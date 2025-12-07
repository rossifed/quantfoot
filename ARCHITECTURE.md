# QuantFoot - Architecture Documentation Complète

## Vue d'ensemble

QuantFoot est une application full-stack d'analyse de données football utilisant une architecture moderne basée sur des microservices, un pipeline de données ELT, et une séparation claire des responsabilités selon les principes DDD (Domain-Driven Design).
- ✅ Built-in clustering and resilience

**Alternative** (if staying Python):
- **FastAPI** with WebSocket support
- **Redis** for real-time caching
- **Celery** for background tasks
- ⚠️ Limited to ~10K concurrent connections per instance

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - SignalR client for live updates                           │
│  - REST API calls for static data                            │
└──────────────────┬─────────────────────────┬─────────────────┘
                   │                         │
                   │ SignalR/WebSocket       │ REST API
                   │                         │
┌──────────────────▼─────────────────────────▼─────────────────┐
│              .NET Live Service (ASP.NET + Orleans)            │
│  - SignalR Hub for WebSocket connections                     │
│  - REST API for static data queries                          │
└──────────────────┬─────────────────────────┬─────────────────┘
                   │                         │
        ┌──────────▼─────────┐    ┌─────────▼──────────┐
        │   Orleans Cluster   │    │   Dagster Pipeline │
        │   (Virtual Actors)  │    │   (Daily batch)    │
        │                     │    │                    │
        │  🎭 PlayerActor     │    │  - Fetch clubs     │
        │  🎭 MatchActor      │    │  - Fetch teams     │
        │  🎭 ValueActor      │    │  - Fetch fixtures  │
        │                     │    │  - dbt transforms  │
        │  - State per player │    │                    │
        │  - Parallel updates │    │                    │
        │  - Auto-scaling     │    │                    │
        └──────────┬──────────┘    └─────────┬──────────┘
                   │                         │
                   │                         │
        ┌──────────▼──────────┐   ┌─────────▼──────────┐
        │      Redis          │   │    PostgreSQL      │
        │   (Actor state)     │   │  (Static data)     │
        │   (Cache)           │   │  (History)         │
        └─────────────────────┘   └────────────────────┘
```

---

## Implementation Plan

### Phase 1: Static Data (CURRENT)
✅ Dagster pipeline for daily updates
✅ dbt models for data transformation
✅ PostgreSQL storage

### Phase 2: Live Service (NEXT)
Create new service: `services/live-data/`

**OPTION A: .NET + Orleans (RECOMMENDED for scale)**

**File structure**:
```
services/
└── live-data-dotnet/
    ├── LiveData.Api/                    # ASP.NET Core Web API
    │   ├── Program.cs
    │   ├── Hubs/
    │   │   └── LiveMatchHub.cs          # SignalR Hub
    │   ├── Controllers/
    │   │   └── LiveDataController.cs
    │   └── appsettings.json
    ├── LiveData.Grains/                 # Orleans Actors
    │   ├── PlayerActor.cs               # Track individual player
    │   ├── MatchActor.cs                # Track match state
    │   ├── ValueCalculatorActor.cs      # Calculate player values
    │   └── Interfaces/
    │       ├── IPlayerActor.cs
    │       ├── IMatchActor.cs
    │       └── IValueCalculatorActor.cs
    ├── LiveData.Services/
    │   ├── ApiFootballClient.cs         # API calls
    │   └── BackgroundServices/
    │       └── LiveMatchPoller.cs       # Background polling
    └── Dockerfile
```

**Key components with Orleans**:

1. **PlayerActor** (Orleans Grain)
```csharp
public class PlayerActor : Grain, IPlayerActor
{
    private PlayerLiveState _state = new();
    
    public async Task UpdateStats(PlayerStats stats)
    {
        _state.Stats = stats;
        _state.LastUpdate = DateTime.UtcNow;
        
        // Calculate new market value based on performance
        var newValue = await GrainFactory
            .GetGrain<IValueCalculatorActor>(this.GetPrimaryKeyLong())
            .CalculateValue(_state);
        
        _state.MarketValue = newValue;
        
        // Broadcast to all subscribers via SignalR
        await _hubContext.Clients.Group($"player_{this.GetPrimaryKeyLong()}")
            .SendAsync("PlayerUpdate", _state);
    }
    
    public Task<PlayerLiveState> GetState() => Task.FromResult(_state);
}
```

2. **MatchActor** (Orleans Grain)
```csharp
public class MatchActor : Grain, IMatchActor
{
    private MatchLiveState _state = new();
    private readonly List<long> _playerActorIds = new();
    
    public async Task ProcessMatchEvent(MatchEvent evt)
    {
        _state.Events.Add(evt);
        
        // Update affected players in parallel
        var tasks = evt.AffectedPlayers.Select(playerId =>
            GrainFactory.GetGrain<IPlayerActor>(playerId)
                .UpdateFromEvent(evt)
        );
        
        await Task.WhenAll(tasks);
        
        // Broadcast match update
        await _hubContext.Clients.Group($"match_{this.GetPrimaryKeyLong()}")
            .SendAsync("MatchUpdate", _state);
    }
    
    public async Task StartLiveTracking()
    {
        // Start background timer to poll API every 30 seconds
        RegisterTimer(PollApiForUpdates, null, 
            TimeSpan.FromSeconds(30), 
            TimeSpan.FromSeconds(30));
    }
    
    private async Task PollApiForUpdates(object state)
    {
        var liveData = await _apiClient.GetLiveMatch(_state.FixtureId);
        foreach (var evt in liveData.NewEvents)
        {
            await ProcessMatchEvent(evt);
        }
    }
}
```

3. **SignalR Hub** (`LiveMatchHub.cs`)
```csharp
public class LiveMatchHub : Hub
{
    private readonly IGrainFactory _grainFactory;
    
    public async Task SubscribeToMatch(long fixtureId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"match_{fixtureId}");
        
        // Get current state
        var matchActor = _grainFactory.GetGrain<IMatchActor>(fixtureId);
        var state = await matchActor.GetState();
        
        await Clients.Caller.SendAsync("InitialState", state);
    }
    
    public async Task SubscribeToPlayer(long playerId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"player_{playerId}");
        
        var playerActor = _grainFactory.GetGrain<IPlayerActor>(playerId);
        var state = await playerActor.GetState();
        
        await Clients.Caller.SendAsync("PlayerState", state);
    }
}
```

4. **Background Service** (`LiveMatchPoller.cs`)
```csharp
public class LiveMatchPoller : BackgroundService
{
    private readonly IGrainFactory _grainFactory;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Get list of live matches from Redis
            var liveMatchIds = await _redis.GetLiveMatches();
            
            // Activate MatchActor for each live match
            var tasks = liveMatchIds.Select(id =>
                _grainFactory.GetGrain<IMatchActor>(id).StartLiveTracking()
            );
            
            await Task.WhenAll(tasks);
            
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

5. **Program.cs** (ASP.NET Core setup)
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add Orleans
builder.Host.UseOrleans((context, siloBuilder) =>
{
    siloBuilder
        .UseLocalhostClustering()
        .UseRedisGrainStorage("player-state", options =>
        {
            options.ConnectionString = "localhost:6379";
        })
        .ConfigureApplicationParts(parts =>
        {
            parts.AddApplicationPart(typeof(PlayerActor).Assembly).WithReferences();
        });
});

// Add SignalR
builder.Services.AddSignalR();

// Add Background Services
builder.Services.AddHostedService<LiveMatchPoller>();

var app = builder.Build();

app.MapHub<LiveMatchHub>("/hubs/live");

app.Run();
```

**Advantages of Orleans approach**:
- ✅ Each player/match = isolated actor (no race conditions)
- ✅ Automatic distribution across cluster nodes
- ✅ State persistence in Redis
- ✅ Location transparency (actors can move between nodes)
- ✅ True parallel processing (100+ players updated simultaneously)

---

**OPTION B: Python + FastAPI** (simpler but less scalable)

**File structure**:
```
services/
└── live-data/
    ├── main.py              # FastAPI app with WebSocket
    ├── websocket.py         # WebSocket connection manager
    ├── tasks.py             # Celery tasks for live polling
    ├── models.py            # Pydantic models
    ├── redis_client.py      # Redis connection
    ├── api_client.py        # API-Football live endpoints
    └── requirements.txt
```

**Key components**:

1. **WebSocket Manager** (`websocket.py`)
```python
from fastapi import WebSocket
from typing import Dict, Set

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, fixture_id: str):
        await websocket.accept()
        if fixture_id not in self.active_connections:
            self.active_connections[fixture_id] = set()
        self.active_connections[fixture_id].add(websocket)
    
    async def broadcast_to_fixture(self, fixture_id: str, data: dict):
        if fixture_id in self.active_connections:
            for connection in self.active_connections[fixture_id]:
                await connection.send_json(data)
```

2. **Live Polling Task** (`tasks.py`)
```python
from celery import Celery

celery_app = Celery('live-data', broker='redis://localhost:6379/0')

@celery_app.task
def poll_live_matches():
    """Poll API-Football for live match updates every 30 seconds"""
    live_fixtures = get_live_fixtures_from_redis()
    
    for fixture_id in live_fixtures:
        # Call API-Football live endpoint
        live_data = api_client.get_live_match(fixture_id)
        
        # Store in Redis
        redis_client.setex(f"live:{fixture_id}", 60, json.dumps(live_data))
        
        # Broadcast to WebSocket clients
        asyncio.run(manager.broadcast_to_fixture(fixture_id, live_data))
```

3. **Main FastAPI App** (`main.py`)
```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
manager = ConnectionManager()

@app.websocket("/ws/fixture/{fixture_id}")
async def websocket_endpoint(websocket: WebSocket, fixture_id: str):
    await manager.connect(websocket, fixture_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, fixture_id)

@app.get("/api/live/fixture/{fixture_id}")
async def get_live_fixture(fixture_id: str):
    """REST fallback for live data"""
    data = redis_client.get(f"live:{fixture_id}")
    return json.loads(data) if data else {"status": "no_live_data"}
```

### Phase 3: Integration
- Frontend WebSocket client connects to live service
- Display real-time player values on `/fixture/{id}` page
- Show live events as they happen

---

## Best Practices

### 1. **Separation of Concerns**
- ✅ Static data: Dagster (batch processing)
- ✅ Live data: Dedicated service (streaming)

### 2. **Caching Strategy**
- Redis TTL: 60 seconds for live data
- PostgreSQL: Historical data for analysis

### 3. **Rate Limiting**
- API-Football has rate limits
- Poll live matches only during active games
- Use Redis to cache and reduce API calls

### 4. **Scalability**
- WebSocket service can scale horizontally
- Use Redis pub/sub for multi-instance coordination
- Celery workers can scale independently

### 5. **Error Handling**
- Graceful degradation if live service is down
- Frontend falls back to last known data
- Retry logic for API failures

---

## Docker Compose Update

Add live service to `infrastructure/docker/docker-compose.yml`:

**For .NET + Orleans:**
```yaml
services:
  # ... existing services ...
  
  live-service:
    build: ../../services/live-data-dotnet
    ports:
      - "8001:8080"
    environment:
      - REDIS_URL=redis:6379
      - POSTGRES_URL=Host=postgres;Database=quantfoot;Username=user;Password=pass
      - API_FOOTBALL_KEY=${API_FOOTBALL_KEY}
      - ORLEANS_CLUSTER_ID=quantfoot-live
      - ORLEANS_SERVICE_ID=live-service
    depends_on:
      - redis
      - postgres
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
```

**For Python + FastAPI (fallback):**
```yaml
services:
  # ... existing services ...
  
  live-service:
    build: ../../services/live-data
    ports:
      - "8001:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0
      - POSTGRES_URL=postgresql://user:pass@postgres:5432/quantfoot
      - API_FOOTBALL_KEY=${API_FOOTBALL_KEY}
    depends_on:
      - redis
      - postgres
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  celery-worker:
    build: ../../services/live-data
    command: celery -A tasks worker --loglevel=info
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
  
  celery-beat:
    build: ../../services/live-data
    command: celery -A tasks beat --loglevel=info
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
```

---

## Technology Decision: .NET vs Python

### Performance Comparison

| Metric | .NET + Orleans | Python + FastAPI |
|--------|----------------|------------------|
| **Concurrent WebSocket** | 100,000+ per node | ~10,000 per node |
| **Actor updates/sec** | 1M+ messages | ~10K messages (limited by GIL) |
| **Memory per connection** | ~5KB | ~50KB |
| **Latency (p99)** | <10ms | ~50ms |
| **Horizontal scaling** | Native with Orleans | Manual with Redis pub/sub |
| **Type safety** | Strong (C#) | Weak (Python) |

### Why Orleans is Perfect for This Use Case

```
Match with 22 players:
┌─────────────────────────────────────────┐
│         MatchActor (Fixture 123)        │
│  - Receives API updates every 30s       │
│  - Distributes events to player actors  │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐
│Player 1 │ ...  │Player 22│
│Actor    │      │Actor    │
│         │      │         │
│- Stats  │      │- Stats  │
│- Value  │      │- Value  │
│- Events │      │- Events │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              │
        Parallel Update
     (No GIL, True Threads)
```

Each PlayerActor:
- ✅ Isolated state (no locks needed)
- ✅ Can move between cluster nodes
- ✅ Persisted to Redis automatically
- ✅ Processes messages in order per player
- ✅ Updates 22 players in TRUE parallel

### Recommendation

**Use .NET + Orleans if:**
- ✅ You plan to scale (>1000 concurrent users)
- ✅ You want true real-time (<100ms updates)
- ✅ You need to track 100+ players simultaneously
- ✅ You want production-grade reliability

**Use Python + FastAPI if:**
- ✅ Your team only knows Python
- ✅ You have <1000 concurrent users
- ✅ Prototype/MVP phase
- ✅ Lower development velocity is acceptable

**My recommendation**: .NET + Orleans
**Reason**: This is a real-time trading platform where performance and scalability matter. The actor model is perfect for tracking individual player state.

---

## Summary

| Aspect | Static Data | Live Data |
|--------|-------------|-----------|
| **Tool** | Dagster + dbt | .NET + Orleans (or FastAPI) |
| **Frequency** | Daily batch | Real-time stream |
| **Storage** | PostgreSQL | Redis + PostgreSQL |
| **Examples** | Clubs, fixtures schedule | Live events, player stats |
| **Technology** | Python, SQL | C# + Orleans (recommended) |
| **Location** | `data-pipeline/` | `services/live-data-dotnet/` |
| **Scalability** | Vertical (single node) | Horizontal (cluster) |
| **Concurrency** | Sequential (batch) | Parallel (actors) |
