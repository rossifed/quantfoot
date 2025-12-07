# Live Service Lifecycle Management

## 1. Service Wake-up & Shutdown Strategy

### Problem
- Service doit s'activer au début du match
- Service doit se désactiver à la fin du match
- Service doit reprendre après crash

### Solution: Event-Driven Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Dagster Pipeline                          │
│  (Fetch fixtures daily at 3 AM)                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Write to PostgreSQL
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL: fixtures table                    │
│  - fixture_id, start_time, status (SCHEDULED/LIVE/FINISHED) │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Read every minute
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          Match Lifecycle Orchestrator (Background Service)   │
│  - Polls DB for fixtures starting soon (T-5min)              │
│  - Activates MatchActor                                      │
│  - Monitors match status                                     │
│  - Deactivates when FINISHED                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Activate/Deactivate
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Orleans MatchActor                          │
│  - State: WARMING_UP → LIVE → HALF_TIME → LIVE → FINISHED   │
│  - Self-polling API every 30s when LIVE                      │
│  - Auto-deactivate when match ends                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Implementation Details

### A. Match Lifecycle Orchestrator (.NET Background Service)

```csharp
public class MatchLifecycleOrchestrator : BackgroundService
{
    private readonly IGrainFactory _grainFactory;
    private readonly IDbConnection _db;
    private readonly ILogger<MatchLifecycleOrchestrator> _logger;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await OrchestrateMatches();
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in match orchestration");
            }
        }
    }

    private async Task OrchestrateMatches()
    {
        var now = DateTime.UtcNow;

        // 1. Wake up matches starting in 5 minutes
        var upcomingMatches = await _db.QueryAsync<Fixture>(@"
            SELECT fixture_id, start_time 
            FROM fixtures 
            WHERE status = 'SCHEDULED' 
            AND start_time BETWEEN @Now AND @FiveMinutesLater
        ", new { Now = now, FiveMinutesLater = now.AddMinutes(5) });

        foreach (var fixture in upcomingMatches)
        {
            _logger.LogInformation("Warming up match {FixtureId}", fixture.FixtureId);
            var matchActor = _grainFactory.GetGrain<IMatchActor>(fixture.FixtureId);
            await matchActor.WarmUp(fixture.StartTime);
        }

        // 2. Check live matches for completion
        var liveMatches = await _db.QueryAsync<long>(@"
            SELECT fixture_id 
            FROM fixtures 
            WHERE status = 'LIVE'
        ");

        foreach (var fixtureId in liveMatches)
        {
            var matchActor = _grainFactory.GetGrain<IMatchActor>(fixtureId);
            var state = await matchActor.GetState();
            
            if (state.IsFinished)
            {
                _logger.LogInformation("Match {FixtureId} finished, shutting down", fixtureId);
                await matchActor.Shutdown();
                
                // Update DB
                await _db.ExecuteAsync(@"
                    UPDATE fixtures 
                    SET status = 'FINISHED', end_time = @EndTime 
                    WHERE fixture_id = @FixtureId
                ", new { EndTime = DateTime.UtcNow, FixtureId = fixtureId });
            }
        }

        // 3. Resume crashed matches
        await ResumeCrashedMatches();
    }

    private async Task ResumeCrashedMatches()
    {
        var now = DateTime.UtcNow;
        
        // Find matches that should be live but actor is not active
        var potentiallyCrashedMatches = await _db.QueryAsync<Fixture>(@"
            SELECT fixture_id, start_time 
            FROM fixtures 
            WHERE status = 'LIVE' 
            AND start_time < @Now
            AND start_time > @TwoHoursAgo
        ", new { Now = now, TwoHoursAgo = now.AddHours(-2) });

        foreach (var fixture in potentiallyCrashedMatches)
        {
            var matchActor = _grainFactory.GetGrain<IMatchActor>(fixture.FixtureId);
            var state = await matchActor.GetState();
            
            // Check if actor is actually active
            if (!state.IsActive)
            {
                _logger.LogWarning("Resuming crashed match {FixtureId}", fixture.FixtureId);
                await matchActor.Resume();
            }
        }
    }
}
```

---

### B. MatchActor State Machine

```csharp
public class MatchActor : Grain, IMatchActor
{
    private MatchState _state = new();
    private IDisposable? _pollingTimer;
    private readonly IApiFootballClient _apiClient;
    private readonly ILogger<MatchActor> _logger;

    // State Machine
    public enum MatchPhase
    {
        IDLE,           // Not started
        WARMING_UP,     // 5min before kickoff
        FIRST_HALF,     // 0-45min + injury time
        HALF_TIME,      // Break
        SECOND_HALF,    // 45-90min + injury time
        EXTRA_TIME,     // If applicable
        FINISHED        // Match ended
    }

    public async Task WarmUp(DateTime scheduledStartTime)
    {
        _state.Phase = MatchPhase.WARMING_UP;
        _state.ScheduledStart = scheduledStartTime;
        _state.IsActive = true;

        _logger.LogInformation("Match {MatchId} warming up, scheduled for {Time}", 
            this.GetPrimaryKeyLong(), scheduledStartTime);

        // Load players from DB
        await LoadPlayers();

        // Start checking for kickoff every 30 seconds
        _pollingTimer = RegisterTimer(
            CheckForKickoff, 
            null, 
            TimeSpan.FromSeconds(10), 
            TimeSpan.FromSeconds(30)
        );

        await WriteStateAsync();
    }

    private async Task CheckForKickoff(object state)
    {
        if (_state.Phase != MatchPhase.WARMING_UP)
            return;

        // Check API if match has started
        var liveData = await _apiClient.GetFixture(this.GetPrimaryKeyLong());

        if (liveData.Status == "1H") // First Half started
        {
            await StartLiveTracking();
        }
    }

    private async Task StartLiveTracking()
    {
        _state.Phase = MatchPhase.FIRST_HALF;
        _state.ActualStart = DateTime.UtcNow;

        _logger.LogInformation("Match {MatchId} LIVE - Starting real-time tracking", 
            this.GetPrimaryKeyLong());

        // Cancel warmup timer
        _pollingTimer?.Dispose();

        // Start aggressive polling every 30 seconds
        _pollingTimer = RegisterTimer(
            PollLiveData, 
            null, 
            TimeSpan.Zero,              // Start immediately
            TimeSpan.FromSeconds(30)    // Every 30 seconds
        );

        await WriteStateAsync();
    }

    private async Task PollLiveData(object state)
    {
        try
        {
            var liveData = await _apiClient.GetFixtureLive(this.GetPrimaryKeyLong());

            // Update match phase
            _state.Phase = liveData.Status switch
            {
                "1H" => MatchPhase.FIRST_HALF,
                "HT" => MatchPhase.HALF_TIME,
                "2H" => MatchPhase.SECOND_HALF,
                "ET" => MatchPhase.EXTRA_TIME,
                "FT" or "AET" or "PEN" => MatchPhase.FINISHED,
                _ => _state.Phase
            };

            // Process new events
            await ProcessNewEvents(liveData.Events);

            // Update players
            await UpdatePlayers(liveData.Players);

            // Check if match finished
            if (_state.Phase == MatchPhase.FINISHED)
            {
                await Shutdown();
            }

            // Broadcast to WebSocket clients
            await BroadcastUpdate();

            await WriteStateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error polling live data for match {MatchId}", 
                this.GetPrimaryKeyLong());
            
            // Continue polling despite errors (resilience)
        }
    }

    public async Task Shutdown()
    {
        _logger.LogInformation("Shutting down match {MatchId}", this.GetPrimaryKeyLong());

        _state.IsActive = false;
        _state.Phase = MatchPhase.FINISHED;
        _state.EndTime = DateTime.UtcNow;

        // Stop polling
        _pollingTimer?.Dispose();

        // Final broadcast
        await BroadcastUpdate();

        // Persist final state
        await WriteFinalStateToDb();
        await WriteStateAsync();

        // Deactivate all player actors
        foreach (var playerId in _state.PlayerIds)
        {
            var playerActor = GrainFactory.GetGrain<IPlayerActor>(playerId);
            await playerActor.Deactivate();
        }

        _logger.LogInformation("Match {MatchId} shutdown complete", this.GetPrimaryKeyLong());
    }

    public async Task Resume()
    {
        _logger.LogWarning("Resuming match {MatchId} after crash", this.GetPrimaryKeyLong());

        _state.IsActive = true;

        // Fetch latest state from API
        var liveData = await _apiClient.GetFixtureLive(this.GetPrimaryKeyLong());

        // Restore state
        _state.Phase = liveData.Status switch
        {
            "1H" => MatchPhase.FIRST_HALF,
            "HT" => MatchPhase.HALF_TIME,
            "2H" => MatchPhase.SECOND_HALF,
            "ET" => MatchPhase.EXTRA_TIME,
            "FT" => MatchPhase.FINISHED,
            _ => MatchPhase.IDLE
        };

        if (_state.Phase == MatchPhase.FINISHED)
        {
            await Shutdown();
            return;
        }

        // Catch up on missed events
        await CatchUpMissedEvents(liveData);

        // Resume polling
        await StartLiveTracking();

        _logger.LogInformation("Match {MatchId} resumed successfully", this.GetPrimaryKeyLong());
    }

    private async Task CatchUpMissedEvents(FixtureLiveData liveData)
    {
        // Get all events from API
        var allEvents = liveData.Events;

        // Get last processed event from state
        var lastEventId = _state.LastProcessedEventId;

        // Process only new events
        var newEvents = allEvents.Where(e => e.Id > lastEventId).ToList();

        _logger.LogInformation("Catching up {Count} missed events for match {MatchId}", 
            newEvents.Count, this.GetPrimaryKeyLong());

        foreach (var evt in newEvents)
        {
            await ProcessEvent(evt);
        }
    }

    public Task<MatchState> GetState() => Task.FromResult(_state);

    private async Task WriteStateAsync()
    {
        // Orleans automatically persists to Redis
        await base.WriteStateAsync();
    }

    private async Task WriteFinalStateToDb()
    {
        // Persist final match statistics to PostgreSQL for historical analysis
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(@"
            INSERT INTO match_history 
            (fixture_id, start_time, end_time, final_score, events, player_stats)
            VALUES (@FixtureId, @Start, @End, @Score, @Events::jsonb, @Players::jsonb)
        ", new
        {
            FixtureId = this.GetPrimaryKeyLong(),
            Start = _state.ActualStart,
            End = _state.EndTime,
            Score = _state.Score,
            Events = JsonSerializer.Serialize(_state.Events),
            Players = JsonSerializer.Serialize(_state.PlayerStats)
        });
    }
}
```

---

### C. Redis State Persistence (Orleans Storage)

```csharp
// Program.cs - Orleans configuration
builder.Host.UseOrleans((context, siloBuilder) =>
{
    siloBuilder
        .UseLocalhostClustering()
        .UseRedisGrainStorage("match-state", options =>
        {
            options.ConnectionString = "localhost:6379";
            options.DatabaseNumber = 0;
        })
        .ConfigureApplicationParts(parts =>
        {
            parts.AddApplicationPart(typeof(MatchActor).Assembly).WithReferences();
        });
});
```

**Orleans automatically:**
- ✅ Saves actor state to Redis on `WriteStateAsync()`
- ✅ Loads state from Redis when actor reactivates
- ✅ Handles serialization/deserialization
- ✅ Provides consistency guarantees

---

### D. Crash Recovery Flow

```
Scenario: Service crashes during live match

T=0:    Match 123 is LIVE, MatchActor polling every 30s
T=10:   💥 Service crashes (pod restart, OOM, etc.)
T=11:   Service restarts
T=12:   MatchLifecycleOrchestrator runs ResumeCrashedMatches()
        - Finds fixture 123 with status=LIVE in DB
        - Gets MatchActor grain (Orleans loads state from Redis)
        - Checks if actor is active: NO
        - Calls matchActor.Resume()
T=13:   MatchActor.Resume() executes:
        - Fetches latest data from API
        - Identifies missed events (event IDs > last processed)
        - Processes missed events
        - Resumes polling timer
T=14:   Match continues tracking as if nothing happened ✅
```

---

## 3. Database Schema for Lifecycle Management

```sql
-- fixtures table (updated by Dagster + Live Service)
CREATE TABLE fixtures (
    fixture_id BIGINT PRIMARY KEY,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL, -- SCHEDULED, LIVE, FINISHED
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for lifecycle queries
CREATE INDEX idx_fixtures_status_start 
ON fixtures(status, start_time);

-- match_history table (final state after match)
CREATE TABLE match_history (
    fixture_id BIGINT PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    final_score JSONB NOT NULL,
    events JSONB NOT NULL,
    player_stats JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Monitoring & Alerts

```csharp
public class MatchLifecycleOrchestrator : BackgroundService
{
    private readonly IMetricsCollector _metrics;

    private async Task OrchestrateMatches()
    {
        // Emit metrics
        _metrics.RecordGauge("matches.warming_up", warmingUpCount);
        _metrics.RecordGauge("matches.live", liveCount);
        _metrics.RecordGauge("matches.finished", finishedCount);

        // Alert if match stuck in LIVE for too long
        var stuckMatches = await _db.QueryAsync<long>(@"
            SELECT fixture_id 
            FROM fixtures 
            WHERE status = 'LIVE' 
            AND start_time < NOW() - INTERVAL '3 hours'
        ");

        if (stuckMatches.Any())
        {
            _logger.LogError("Found {Count} matches stuck in LIVE state: {Ids}", 
                stuckMatches.Count(), string.Join(",", stuckMatches));
            
            // Force check via API and update status
            foreach (var id in stuckMatches)
            {
                await ForceCheckMatchStatus(id);
            }
        }
    }
}
```

---

## 5. Configuration

```json
// appsettings.json
{
  "MatchLifecycle": {
    "WarmupMinutesBeforeKickoff": 5,
    "PollingIntervalSeconds": 30,
    "OrchestratorIntervalMinutes": 1,
    "MaxMatchDurationHours": 3,
    "EnableCrashRecovery": true
  },
  "ApiFootball": {
    "RateLimitPerMinute": 60,
    "TimeoutSeconds": 10
  }
}
```

---

## Summary

| Challenge | Solution |
|-----------|----------|
| **Wake up before match** | Orchestrator polls DB for fixtures starting in 5min |
| **Know when match ends** | MatchActor checks API status, auto-shuts down on FT |
| **Recover from crash** | Orleans loads state from Redis + catchup missed events |
| **Resource efficiency** | Only active matches consume resources |
| **Idempotency** | Event IDs prevent duplicate processing |

**Key mechanisms:**
1. **Database as source of truth** for match schedule
2. **Orleans grain state** persisted in Redis for crash recovery
3. **Self-monitoring actors** that shut themselves down
4. **Orchestrator** as supervisor for lifecycle management
5. **API as fallback** to catch up after failures
