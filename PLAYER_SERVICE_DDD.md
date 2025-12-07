# Players Service - Architecture DDD

## Clean Architecture Layers

### Analyse de ton cas d'usage

Pour le **Players Service**, voici la complexité attendue:

| Layer | Nécessaire? | Justification |
|-------|-------------|---------------|
| **API** | ✅ OUI | Controllers REST exposés au frontend |
| **Application** | ✅ OUI | Use cases: GetPlayerProfile, SearchPlayers |
| **Domain** | 🟡 LÉGER | Peu de logique business pour un profil statique |
| **Infrastructure** | ✅ OUI | PostgreSQL repository, Redis cache |

**Mon conseil:** 
- ✅ Utilise les 4 layers mais **garde Domain simple**
- ✅ La vraie complexité viendra avec le **Live Service** (trading, valuation)
- ✅ Commence propre même si c'est simple = évolutif

---

## Structure Recommandée

```
services/
└── players/                         # .NET 8 Web API
    ├── Players.sln
    │
    ├── src/
    │   ├── Players.Api/                        # Layer 1: API (Controllers)
    │   │   ├── Controllers/
    │   │   │   ├── PlayersController.cs        # GET /api/players/{id}
    │   │   │   └── TeamsController.cs          # GET /api/teams/{id}
    │   │   ├── DTOs/
    │   │   │   ├── PlayerProfileDto.cs
    │   │   │   └── TeamDto.cs
    │   │   ├── Middleware/
    │   │   │   ├── ExceptionHandlingMiddleware.cs
    │   │   │   └── CachingMiddleware.cs
    │   │   ├── Program.cs
    │   │   └── appsettings.json
    │   │
    │   ├── Players.Application/                # Layer 2: Application Logic
    │   │   ├── Services/
    │   │   │   ├── PlayerService.cs            # Business orchestration
    │   │   │   └── TeamService.cs
    │   │   ├── Queries/                        # CQRS pattern (optional)
    │   │   │   ├── GetPlayerProfileQuery.cs
    │   │   │   └── SearchPlayersQuery.cs
    │   │   ├── DTOs/
    │   │   │   └── PlayerProfileResponse.cs
    │   │   ├── Mapping/
    │   │   │   └── AutoMapperProfile.cs
    │   │   └── Interfaces/
    │   │       └── IPlayerService.cs
    │   │
    │   ├── Players.Domain/                     # Layer 3: Domain Model
    │   │   ├── Entities/
    │   │   │   ├── Player.cs                   # Aggregate Root
    │   │   │   ├── Team.cs
    │   │   │   └── Club.cs
    │   │   ├── ValueObjects/
    │   │   │   ├── PlayerId.cs
    │   │   │   ├── MarketValue.cs
    │   │   │   └── Position.cs
    │   │   ├── Repositories/                   # Interfaces only
    │   │   │   ├── IPlayerRepository.cs
    │   │   │   └── ITeamRepository.cs
    │   │   └── DomainServices/                 # Complex business logic
    │   │       └── PlayerValuationService.cs (future)
    │   │
    │   └── Players.Infrastructure/             # Layer 4: External Concerns
    │       ├── Persistence/
    │       │   ├── PlayersDbContext.cs
    │       │   ├── Repositories/
    │       │   │   ├── PlayerRepository.cs     # EF Core implementation
    │       │   │   └── TeamRepository.cs
    │       │   └── Configurations/
    │       │       ├── PlayerConfiguration.cs  # EF mapping
    │       │       └── TeamConfiguration.cs
    │       ├── Caching/
    │       │   └── RedisCacheService.cs
    │       ├── ExternalApis/
    │       │   └── ApiFootballClient.cs (if needed)
    │       └── DependencyInjection.cs
    │
    └── tests/
        ├── Players.UnitTests/
        ├── Players.IntegrationTests/
        └── Players.ArchitectureTests/
```

---

## Implémentation par couche

### 1. Domain Layer (Simple pour ce cas)

**Player.cs (Aggregate Root)**
```csharp
namespace Players.Domain.Entities;

public class Player
{
    public long Id { get; private set; }
    public string Name { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public Position Position { get; private set; }
    public DateTime BirthDate { get; private set; }
    public string Nationality { get; private set; }
    public string PhotoUrl { get; private set; }
    
    // Relationships
    public long TeamId { get; private set; }
    public Team? Team { get; private set; }
    
    // Value Object
    public MarketValue CurrentValue { get; private set; }
    
    // Stats (could be separate aggregate later)
    public PlayerStatistics? Statistics { get; private set; }

    // Constructor
    private Player() { } // EF Core

    public static Player Create(
        long id,
        string name,
        Position position,
        DateTime birthDate,
        string nationality)
    {
        // Domain validation
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Player name cannot be empty");

        return new Player
        {
            Id = id,
            Name = name,
            Position = position,
            BirthDate = birthDate,
            Nationality = nationality
        };
    }

    // Domain behavior (minimal for now)
    public int GetAge()
    {
        var today = DateTime.Today;
        var age = today.Year - BirthDate.Year;
        if (BirthDate.Date > today.AddYears(-age)) age--;
        return age;
    }
}
```

**Position.cs (Value Object)**
```csharp
namespace Players.Domain.ValueObjects;

public record Position
{
    public string Code { get; init; }  // GK, DEF, MID, ATT
    public string DisplayName { get; init; }

    public static Position Goalkeeper => new() { Code = "GK", DisplayName = "Goalkeeper" };
    public static Position Defender => new() { Code = "DEF", DisplayName = "Defender" };
    public static Position Midfielder => new() { Code = "MID", DisplayName = "Midfielder" };
    public static Position Attacker => new() { Code = "ATT", DisplayName = "Attacker" };

    public static Position FromCode(string code) => code.ToUpper() switch
    {
        "GK" => Goalkeeper,
        "DEF" => Defender,
        "MID" => Midfielder,
        "ATT" => Attacker,
        _ => throw new ArgumentException($"Invalid position code: {code}")
    };
}
```

**IPlayerRepository.cs (Domain Interface)**
```csharp
namespace Players.Domain.Repositories;

public interface IPlayerRepository
{
    Task<Player?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Player>> GetByTeamIdAsync(long teamId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Player>> SearchByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Player> AddAsync(Player player, CancellationToken cancellationToken = default);
    Task UpdateAsync(Player player, CancellationToken cancellationToken = default);
}
```

---

### 2. Infrastructure Layer

**PlayerRepository.cs (Implementation)**
```csharp
namespace Players.Infrastructure.Persistence.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly PlayersDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<PlayerRepository> _logger;

    public PlayerRepository(
        PlayersDbContext context,
        IDistributedCache cache,
        ILogger<PlayerRepository> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Player?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        // Try cache first
        var cacheKey = $"player:{id}";
        var cachedPlayer = await _cache.GetStringAsync(cacheKey, cancellationToken);
        
        if (cachedPlayer != null)
        {
            _logger.LogDebug("Player {PlayerId} found in cache", id);
            return JsonSerializer.Deserialize<Player>(cachedPlayer);
        }

        // Fallback to database
        var player = await _context.Players
            .Include(p => p.Team)
            .Include(p => p.Statistics)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (player != null)
        {
            // Cache for 1 hour (static data)
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(player),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
                },
                cancellationToken
            );
        }

        return player;
    }

    public async Task<IEnumerable<Player>> GetByTeamIdAsync(
        long teamId, 
        CancellationToken cancellationToken = default)
    {
        return await _context.Players
            .Where(p => p.TeamId == teamId)
            .Include(p => p.Statistics)
            .OrderBy(p => p.Position.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Player>> SearchByNameAsync(
        string name, 
        CancellationToken cancellationToken = default)
    {
        return await _context.Players
            .Where(p => EF.Functions.ILike(p.Name, $"%{name}%"))
            .Take(20)
            .ToListAsync(cancellationToken);
    }

    public async Task<Player> AddAsync(Player player, CancellationToken cancellationToken = default)
    {
        _context.Players.Add(player);
        await _context.SaveChangesAsync(cancellationToken);
        return player;
    }

    public async Task UpdateAsync(Player player, CancellationToken cancellationToken = default)
    {
        _context.Players.Update(player);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Invalidate cache
        await _cache.RemoveAsync($"player:{player.Id}", cancellationToken);
    }
}
```

**PlayersDbContext.cs**
```csharp
namespace Players.Infrastructure.Persistence;

public class PlayersDbContext : DbContext
{
    public PlayersDbContext(DbContextOptions<PlayersDbContext> options)
        : base(options)
    {
    }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Club> Clubs => Set<Club>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new PlayerConfiguration());
        modelBuilder.ApplyConfiguration(new TeamConfiguration());
        modelBuilder.ApplyConfiguration(new ClubConfiguration());
    }
}
```

**PlayerConfiguration.cs (EF Core Mapping)**
```csharp
namespace Players.Infrastructure.Persistence.Configurations;

public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.ToTable("players", "public");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        // Value Object mapping
        builder.OwnsOne(p => p.Position, position =>
        {
            position.Property(pos => pos.Code)
                .HasColumnName("position_code")
                .HasMaxLength(10);
            position.Property(pos => pos.DisplayName)
                .HasColumnName("position_name")
                .HasMaxLength(50);
        });

        builder.OwnsOne(p => p.CurrentValue, value =>
        {
            value.Property(v => v.Amount)
                .HasColumnName("market_value")
                .HasColumnType("decimal(18,2)");
        });

        // Relationship
        builder.HasOne(p => p.Team)
            .WithMany(t => t.Players)
            .HasForeignKey(p => p.TeamId);

        // Indexes
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.TeamId);
    }
}
```

---

### 3. Application Layer

**PlayerService.cs**
```csharp
namespace Players.Application.Services;

public class PlayerService : IPlayerService
{
    private readonly IPlayerRepository _playerRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<PlayerService> _logger;

    public PlayerService(
        IPlayerRepository playerRepository,
        IMapper mapper,
        ILogger<PlayerService> logger)
    {
        _playerRepository = playerRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PlayerProfileResponse?> GetPlayerProfileAsync(
        long playerId, 
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching profile for player {PlayerId}", playerId);

        var player = await _playerRepository.GetByIdAsync(playerId, cancellationToken);

        if (player == null)
        {
            _logger.LogWarning("Player {PlayerId} not found", playerId);
            return null;
        }

        return _mapper.Map<PlayerProfileResponse>(player);
    }

    public async Task<IEnumerable<PlayerProfileResponse>> GetTeamPlayersAsync(
        long teamId, 
        CancellationToken cancellationToken = default)
    {
        var players = await _playerRepository.GetByTeamIdAsync(teamId, cancellationToken);
        return _mapper.Map<IEnumerable<PlayerProfileResponse>>(players);
    }

    public async Task<IEnumerable<PlayerProfileResponse>> SearchPlayersAsync(
        string searchTerm, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return Enumerable.Empty<PlayerProfileResponse>();

        var players = await _playerRepository.SearchByNameAsync(searchTerm, cancellationToken);
        return _mapper.Map<IEnumerable<PlayerProfileResponse>>(players);
    }
}
```

**PlayerProfileResponse.cs (DTO)**
```csharp
namespace Players.Application.DTOs;

public record PlayerProfileResponse
{
    public long Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public int Age { get; init; }
    public string Nationality { get; init; } = string.Empty;
    public string PhotoUrl { get; init; } = string.Empty;
    public decimal MarketValue { get; init; }
    public TeamSummaryDto? Team { get; init; }
    public PlayerStatisticsDto? Statistics { get; init; }
}

public record TeamSummaryDto
{
    public long Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string LogoUrl { get; init; } = string.Empty;
}

public record PlayerStatisticsDto
{
    public int Appearances { get; init; }
    public int Goals { get; init; }
    public int Assists { get; init; }
    public decimal Rating { get; init; }
}
```

---

### 4. API Layer

**PlayersController.cs**
```csharp
namespace Players.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _playerService;
    private readonly ILogger<PlayersController> _logger;

    public PlayersController(
        IPlayerService playerService,
        ILogger<PlayersController> logger)
    {
        _playerService = playerService;
        _logger = logger;
    }

    /// <summary>
    /// Get player profile by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PlayerProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlayerProfileResponse>> GetPlayer(
        long id, 
        CancellationToken cancellationToken)
    {
        var player = await _playerService.GetPlayerProfileAsync(id, cancellationToken);

        if (player == null)
            return NotFound(new { message = $"Player {id} not found" });

        return Ok(player);
    }

    /// <summary>
    /// Search players by name
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<PlayerProfileResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PlayerProfileResponse>>> SearchPlayers(
        [FromQuery] string q,
        CancellationToken cancellationToken)
    {
        var players = await _playerService.SearchPlayersAsync(q, cancellationToken);
        return Ok(players);
    }

    /// <summary>
    /// Get all players for a team
    /// </summary>
    [HttpGet("team/{teamId}")]
    [ProducesResponseType(typeof(IEnumerable<PlayerProfileResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PlayerProfileResponse>>> GetTeamPlayers(
        long teamId,
        CancellationToken cancellationToken)
    {
        var players = await _playerService.GetTeamPlayersAsync(teamId, cancellationToken);
        return Ok(players);
    }
}
```

**Program.cs (Dependency Injection)**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<PlayersDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Repositories
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();

// Application Services
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<ITeamService, TeamService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// CORS for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## Frontend Integration

**React Service**
```typescript
// apps/web/src/services/api.ts
const API_BASE_URL = 'http://localhost:8080/api';

export const playerApi = {
  async getPlayer(id: number): Promise<PlayerProfile> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`);
    if (!response.ok) throw new Error('Player not found');
    return response.json();
  },

  async searchPlayers(query: string): Promise<PlayerProfile[]> {
    const response = await fetch(`${API_BASE_URL}/players/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  async getTeamPlayers(teamId: number): Promise<PlayerProfile[]> {
    const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
    return response.json();
  }
};
```

**Update PlayerProfile.tsx**
```typescript
// apps/web/src/components/pages/PlayerProfile.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { playerApi } from '../../services/api';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const data = await playerApi.getPlayer(Number(id));
        setPlayer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load player');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!player) return <div>Player not found</div>;

  return (
    // ... existing JSX with real data from API
  );
}
```

---

## Résumé

| Aspect | Recommandation |
|--------|----------------|
| **Architecture** | DDD avec 4 layers (léger sur Domain pour le moment) |
| **Complexité** | Simple mais évolutif (prêt pour live service) |
| **Caching** | Redis pour queries fréquentes |
| **Base de données** | PostgreSQL (déjà alimenté par Dagster) |
| **API** | REST avec Swagger pour doc |
| **Tests** | Unit + Integration + Architecture tests |

**Prochaines étapes:**
1. Créer structure .NET
2. Implémenter PlayerRepository + PlayerService
3. Créer PlayersController
4. Connecter React frontend
5. Tester end-to-end

Prêt à créer ce service?
