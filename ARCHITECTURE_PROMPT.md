# Prompt pour Recréer l'Architecture QuantFoot

Copie-colle ce prompt à un assistant IA pour recréer la même architecture dans un nouveau projet :

---

## PROMPT

Je veux créer un projet avec l'architecture suivante. Aide-moi à le structurer en suivant exactement ces principes :

### 1. STRUCTURE DES DOSSIERS

```
mon-projet/
├── apps/
│   └── web/                          # Frontend React + TypeScript
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/           # Header, Footer, Navigation
│       │   │   ├── features/         # Composants métier
│       │   │   └── ui/               # Composants réutilisables
│       │   ├── pages/                # Pages React Router
│       │   ├── services/             # Services API (axios)
│       │   ├── hooks/                # Custom hooks
│       │   ├── types/                # Interfaces TypeScript
│       │   └── App.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── services/
│   └── dotnet/                       # Services .NET avec DDD
│       ├── [DomainName]/             # Un dossier par microservice
│       │   ├── [DomainName].Api/
│       │   │   ├── Controllers/
│       │   │   ├── Program.cs
│       │   │   └── appsettings.json
│       │   ├── [DomainName].Application/
│       │   │   ├── Services/
│       │   │   ├── DTOs/
│       │   │   └── Interfaces/
│       │   ├── [DomainName].Domain/
│       │   │   ├── Entities/
│       │   │   └── Repositories/
│       │   └── [DomainName].Infrastructure/
│       │       └── Persistence/
│       │           ├── DbContext.cs
│       │           └── Repositories/
│       └── [DomainName].sln          # Une solution par service
│
├── data-pipeline/
│   ├── dagster_project/              # Orchestration
│   │   ├── dagster_project/
│   │   │   ├── assets/
│   │   │   ├── resources/
│   │   │   └── __init__.py
│   │   ├── dagster.yaml
│   │   └── workspace.yaml
│   ├── dbt_project/                  # Transformations SQL
│   │   ├── models/
│   │   │   ├── staging/              # stg_*
│   │   │   ├── marts/                # Tables finales
│   │   │   └── sources.yml
│   │   ├── macros/
│   │   ├── dbt_project.yml
│   │   └── profiles.yml
│   └── dlt_pipelines/                # Ingestion
│
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

### 2. ARCHITECTURE DDD POUR CHAQUE SERVICE .NET

Pour chaque domaine métier (ex: Users, Orders, Products), crée un **microservice séparé** avec cette structure :

#### Couche Domain (`[DomainName].Domain/`)
**Responsabilité** : Logique métier pure, zéro dépendance externe

**Entities/** :
```csharp
public class [EntityName]
{
    public long Id { get; private set; }
    public string Name { get; private set; }
    
    private [EntityName]() { } // EF Core
    
    public static [EntityName] Create(long id, string name, ...)
    {
        // Validation
        return new [EntityName] { Id = id, Name = name };
    }
    
    // Méthodes métier ici
}
```

**Repositories/** (interfaces uniquement) :
```csharp
public interface I[EntityName]Repository
{
    Task<[EntityName]?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<IEnumerable<[EntityName]>> GetAllAsync(CancellationToken ct = default);
}
```

#### Couche Application (`[DomainName].Application/`)
**Responsabilité** : Orchestration, DTOs, mapping

**DTOs/** :
```csharp
public record [EntityName]Response(
    long Id,
    string Name,
    ...
);
```

**Services/** :
```csharp
public class [EntityName]Service : I[EntityName]Service
{
    private readonly I[EntityName]Repository _repository;
    
    public [EntityName]Service(I[EntityName]Repository repository)
    {
        _repository = repository;
    }
    
    public async Task<[EntityName]Response?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct);
        return entity != null ? MapToResponse(entity) : null;
    }
    
    private static [EntityName]Response MapToResponse([EntityName] entity)
    {
        return new [EntityName]Response(entity.Id, entity.Name, ...);
    }
}
```

#### Couche Infrastructure (`[DomainName].Infrastructure/`)
**Responsabilité** : Implémentation technique (DB, APIs)

**Persistence/DbContext.cs** :
```csharp
public class [DomainName]DbContext : DbContext
{
    public DbSet<[EntityName]> [EntityName]s => Set<[EntityName]>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<[EntityName]>(entity =>
        {
            entity.ToTable("[table_name]", "marts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.HasIndex(e => e.Name);
        });
    }
}
```

**Persistence/Repositories/** :
```csharp
public class [EntityName]Repository : I[EntityName]Repository
{
    private readonly [DomainName]DbContext _context;
    
    public async Task<[EntityName]?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        return await _context.[EntityName]s
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }
}
```

#### Couche API (`[DomainName].Api/`)
**Responsabilité** : Exposition HTTP

**Controllers/** :
```csharp
[ApiController]
[Route("api/[controller]")]
public class [EntityName]Controller : ControllerBase
{
    private readonly I[EntityName]Service _service;
    private readonly ILogger<[EntityName]Controller> _logger;
    
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        try
        {
            var items = await _service.GetAllAsync(ct);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving items");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }
    
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
    {
        var item = await _service.GetByIdAsync(id, ct);
        return item != null ? Ok(item) : NotFound();
    }
}
```

**Program.cs** :
```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<[DomainName]DbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("[DomainName]Db")));

// Repositories
builder.Services.AddScoped<I[EntityName]Repository, [EntityName]Repository>();

// Services
builder.Services.AddScoped<I[EntityName]Service, [EntityName]Service>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3001", "http://localhost:3002")
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

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
```

**appsettings.json** :
```json
{
  "ConnectionStrings": {
    "[DomainName]Db": "Host=localhost;Port=5432;Database=[db_name];Username=[user];Password=[pass]"
  },
  "Urls": "http://localhost:[port]"
}
```

### 3. DATA PIPELINE (Dagster + dbt + dlt)

#### Pipeline ELT
```
Source API → dlt (Extract/Load) → PostgreSQL (raw) 
          → dbt (Transform) → PostgreSQL (staging) 
          → dbt (Transform) → PostgreSQL (marts)
```

#### dlt Pipeline (`dlt_pipelines/[source]_pipeline.py`)
```python
import dlt
from dlt.sources.rest_api import rest_api_source

@dlt.source
def [source]_source():
    return rest_api_source({
        "client": {"base_url": "https://api.example.com"},
        "resources": {
            "[resource1]": {
                "endpoint": {
                    "path": "/[resource1]",
                    "params": {"key": dlt.secrets["api_key"]}
                }
            }
        }
    })

if __name__ == "__main__":
    pipeline = dlt.pipeline(
        pipeline_name="[source]_pipeline",
        destination="postgres",
        dataset_name="raw"
    )
    
    load_info = pipeline.run([source]_source())
    print(load_info)
```

#### dbt Models

**Staging** (`models/staging/stg_[table].sql`) :
```sql
WITH source AS (
    SELECT * FROM {{ source('raw', '[table]_raw') }}
)
SELECT
    id,
    name,
    CAST(created_at AS TIMESTAMP) AS created_at,
    _dlt_load_id,
    CURRENT_TIMESTAMP AS _dbt_loaded_at
FROM source
WHERE id IS NOT NULL
```

**Marts** (`models/marts/[table].sql`) :
```sql
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'unique': True},
            {'columns': ['name']}
        ],
        post_hook=[
            "{{ add_mart_constraints('[table]', 
                primary_key='id',
                not_null_columns=['name']
            ) }}"
        ]
    )
}}

SELECT
    id,
    name,
    created_at,
    CURRENT_TIMESTAMP AS dbt_loaded_at,
    CURRENT_TIMESTAMP AS dbt_updated_at
FROM {{ ref('stg_[table]') }}
```

**Macro** (`macros/add_mart_constraints.sql`) :
```sql
{% macro add_mart_constraints(table_name, primary_key, foreign_keys=[], not_null_columns=[]) %}
    ALTER TABLE marts.{{ table_name }}
    DROP CONSTRAINT IF EXISTS {{ table_name }}_pkey CASCADE;
    
    ALTER TABLE marts.{{ table_name }}
    ADD CONSTRAINT {{ table_name }}_pkey PRIMARY KEY ({{ primary_key }});
    
    {% for fk in foreign_keys %}
    ALTER TABLE marts.{{ table_name }}
    ADD CONSTRAINT {{ table_name }}_{{ fk.column }}_fkey
    FOREIGN KEY ({{ fk.column }}) REFERENCES {{ fk.references }};
    {% endfor %}
    
    {% for col in not_null_columns %}
    ALTER TABLE marts.{{ table_name }}
    ALTER COLUMN {{ col }} SET NOT NULL;
    {% endfor %}
{% endmacro %}
```

**Tests** (`models/marts/schema.yml`) :
```yaml
models:
  - name: [table]
    columns:
      - name: id
        tests:
          - unique
          - not_null
      - name: name
        tests:
          - not_null
```

#### Dagster Assets (`dagster_project/dagster_project/__init__.py`)
```python
from dagster import Definitions, asset, AssetExecutionContext
from dagster_dbt import DbtCliResource, dbt_assets

@asset
def ingest_[source]_data(context: AssetExecutionContext):
    """Ingestion via dlt"""
    from dlt_pipelines.[source]_pipeline import [source]_source
    
    pipeline = dlt.pipeline(
        pipeline_name="[source]_pipeline",
        destination="postgres",
        dataset_name="raw"
    )
    
    load_info = pipeline.run([source]_source())
    context.log.info(f"Loaded {load_info}")

@dbt_assets(manifest="path/to/manifest.json")
def dbt_[project]_project(context: AssetExecutionContext, dbt: DbtCliResource):
    yield from dbt.cli(["build"], context=context).stream()

defs = Definitions(
    assets=[ingest_[source]_data, dbt_[project]_project],
    resources={
        "dbt": DbtCliResource(project_dir="dbt_project")
    }
)
```

### 4. FRONTEND REACT

#### Service API (`src/services/[domain]Api.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:[port]/api';

export const [domain]Api = {
  getAll: () => axios.get(`${API_BASE_URL}/[resource]`),
  getById: (id: number) => axios.get(`${API_BASE_URL}/[resource]/${id}`),
  // ...
};
```

#### Types (`src/types/[domain].ts`)
```typescript
export interface [Entity] {
  id: number;
  name: string;
  // Aligné avec les DTOs backend
}
```

#### Feature Component (`src/components/features/[Entity]Card.tsx`)
```typescript
import { [Entity] } from '@/types/[domain]';

interface [Entity]CardProps {
  [entity]: [Entity];
}

export const [Entity]Card: React.FC<[Entity]CardProps> = ({ [entity] }) => {
  return (
    <div className="card">
      <h2>{[entity].name}</h2>
      {/* ... */}
    </div>
  );
};
```

#### Page (`src/pages/[Entity]Page.tsx`)
```typescript
import { useEffect, useState } from 'react';
import { [domain]Api } from '@/services/[domain]Api';
import { [Entity] } from '@/types/[domain]';

export const [Entity]Page = () => {
  const [items, setItems] = useState<[Entity][]>([]);
  
  useEffect(() => {
    [domain]Api.getAll()
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <[Entity]Card key={item.id} [entity]={item} />
      ))}
    </div>
  );
};
```

### 5. DOCKER COMPOSE

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: [user]
      POSTGRES_PASSWORD: [password]
      POSTGRES_DB: [database]
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  dagster-postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: dagster
      POSTGRES_PASSWORD: dagster_password
      POSTGRES_DB: dagster
    volumes:
      - dagster_postgres_data:/var/lib/postgresql/data

  dagster-webserver:
    build:
      context: .
      dockerfile: Dockerfile
    command: dagster-webserver -h 0.0.0.0 -p 3000
    ports:
      - "3000:3000"
    environment:
      DAGSTER_POSTGRES_HOST: dagster-postgres
    volumes:
      - ./data-pipeline:/opt/dagster
    depends_on:
      - dagster-postgres
      - postgres

volumes:
  postgres_data:
  dagster_postgres_data:
```

### 6. PRINCIPES À RESPECTER

#### Séparation des responsabilités
- ✅ **Data Pipeline** : Ingestion et transformation des données (Python/Dagster/dbt)
- ✅ **Backend Services** : Logique métier et APIs REST (.NET/DDD)
- ✅ **Frontend** : Interface utilisateur (React/TypeScript)

#### DDD - 4 couches obligatoires
1. **Domain** : Entités + Interfaces repositories (zéro dépendance)
2. **Application** : Services + DTOs + Mapping
3. **Infrastructure** : DbContext + Implémentation repositories
4. **API** : Controllers + Program.cs + Configuration

#### Microservices
- ✅ Un service = un domaine métier = une solution .NET séparée
- ✅ Chaque service a son propre port
- ✅ Pas de partage de code entre services (sauf packages NuGet communs)
- ✅ CORS configuré pour le frontend

#### Database Design
- ✅ **raw** schema : Données brutes depuis dlt
- ✅ **staging** schema : Tables préfixées `stg_*` avec nettoyage basique
- ✅ **marts** schema : Tables finales avec PK, FK, indexes, triggers

#### Conventions de nommage
- ✅ Entities : PascalCase (`Player`, `Team`)
- ✅ DTOs : Suffix `Response` ou `Request` (`PlayerResponse`)
- ✅ Repositories : Interface `I[Entity]Repository`
- ✅ Services : Interface `I[Entity]Service`
- ✅ Tables staging : Préfixe `stg_` (`stg_players`)
- ✅ Tables marts : Nom de domaine au pluriel (`players`, `teams`)

### 7. COMMANDES POUR DÉMARRER

```bash
# Frontend
cd apps/web
npm install
npm run dev

# Backend (.NET)
cd services/dotnet/[DomainName]/[DomainName].Api
dotnet run

# Data Pipeline
docker-compose up -d
cd data-pipeline/dbt_project
dbt run
dbt test

# Dagster
dagster dev
```

### 8. PORTS PAR DÉFAUT

| Service | Port |
|---------|------|
| Frontend (Vite) | 3001-3002 |
| Dagster UI | 3000 |
| PostgreSQL | 5432 |
| Service 1 | 5087 |
| Service 2 | 5088 |
| Service 3 | 5089 |

---

## CE QU'IL FAUT ME FOURNIR

Pour que je puisse créer cette architecture dans ton projet, donne-moi :

1. **Nom du projet** : [nom]
2. **Domaines métiers** : Liste des entités principales (ex: Users, Products, Orders)
3. **Source de données** : URL de l'API externe à ingérer (si applicable)
4. **Base de données** : PostgreSQL (nom, user, password)
5. **Ports souhaités** : Pour chaque service backend

Exemple :
```
Projet : MonEcommerce
Domaines : Users (port 5087), Products (port 5088), Orders (port 5089)
Source : https://api.fakeshop.com
Database : ecommerce_db, user: admin, pass: secret
```

Ensuite, je créerai toute la structure en suivant exactement cette architecture.

---

**FIN DU PROMPT** - Copie tout ce qui précède pour recréer cette architecture dans un autre projet.
