# Quantfoot

Modern football analytics platform with microservices architecture.

## Structure

```
quantfoot/
├── services/
│   ├── dotnet/              # .NET microservices
│   │   ├── Quantfoot.sln    # Visual Studio solution
│   │   ├── FixturesService/
│   │   ├── PlayersService/
│   │   ├── TeamsService/
│   │   └── Shared/          # Shared libraries
│   └── python/              # Python services (FastAPI)
│
├── data-pipeline/
│   ├── orchestration/       # Dagster + dlt pipelines
│   └── transformations/     # dbt models
│
├── apps/
│   └── web/                 # Next.js frontend
│
└── infrastructure/
    ├── docker/              # Docker Compose
    └── k8s/                 # Kubernetes manifests
```

## Getting Started

### Data Pipeline

```bash
cd infrastructure/docker
docker compose up -d
```

Access Dagster UI: http://localhost:3000

### Services

Coming soon: .NET microservices and Python API gateway

### Frontend

Coming soon: Next.js application

## Tech Stack

- **Orchestration**: Dagster
- **Data Ingestion**: dlt
- **Transformations**: dbt
- **Database**: PostgreSQL 16
- **Services**: .NET 8, Python FastAPI
- **Frontend**: Next.js 14+
- **Infrastructure**: Docker, Kubernetes
