# QuantFoot - Football Data Pipeline

Pipeline de données Football utilisant **Dagster + dlt** pour charger les données de l'API Football dans PostgreSQL.

## 🏗️ Architecture

Ce projet utilise:
- **Dagster**: Orchestration et monitoring des pipelines
- **dlt (data load tool)**: Extraction et chargement des données avec gestion automatique du schéma
- **API-Football**: Source de données pour les informations de football
- **PostgreSQL**: Base de données pour le stockage des données
- **Docker Compose**: Conteneurisation et déploiement

## ✨ Avantages de dlt

- ✅ **Gestion automatique du schéma** - Plus besoin de scripts SQL
- ✅ **Incremental loading** - Charge uniquement les nouvelles données
- ✅ **State management** - Garde une trace de ce qui a été chargé
- ✅ **Merge automatique** - Upserts gérés automatiquement
- ✅ **Évolution du schéma** - S'adapte aux changements de l'API
- ✅ **Retry et gestion d'erreurs** - Robustesse native

## 📋 Prérequis

- Docker et Docker Compose installés
- Clé API de API-Football (obtenez-la sur [api-football.com](https://www.api-football.com/))
- Python 3.13+ (pour le développement local)

## 🚀 Installation et Lancement

### 1. Configuration

Copiez le fichier d'exemple d'environnement et ajoutez votre clé API:

```bash
cp .env.example .env
```

Éditez le fichier `.env` et ajoutez votre clé API Football:

```env
API_FOOTBALL_KEY=votre_cle_api_ici
```

### 2. Lancement avec Docker Compose

```bash
# Construire et démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f dagster
```

### 3. Accès aux interfaces

- **Dagster UI**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - Database: `football_data`
  - User: `dagster`
  - Password: `dagster_password`

## 📊 Assets Dagster

Le projet charge automatiquement via dlt:

### football_leagues_assets
Un seul asset Dagster qui charge **4 ressources dlt**:
- **leagues**: Toutes les ligues avec informations pays et saison
- **teams**: Équipes des 5 principales ligues européennes avec détails des stades
- **fixtures**: Tous les matchs avec scores et statuts
- **standings**: Classements actuels de toutes les ligues

Chaque ressource utilise:
- `write_disposition="merge"` - Upsert automatique
- Primary keys définies - Pas de doublons
- Schéma auto-géré par dlt

## 🗄️ Schéma de Base de Données

**dlt gère automatiquement le schéma!** Les tables sont créées et mises à jour automatiquement:

- **leagues**: Informations sur les ligues (primary key: league_id, season)
- **teams**: Équipes et leurs stades (primary key: team_id, league_id, season)
- **fixtures**: Matchs et résultats (primary key: fixture_id)
- **standings**: Classements actuels (primary key: league_id, season, team_id)

dlt ajoute aussi automatiquement:
- `_dlt_load_id`: ID du chargement
- `_dlt_id`: ID unique par ligne
- Colonnes de tracking et métadonnées

## 🔧 Développement Local

### Installation des dépendances

```bash
# Créer l'environnement virtuel
uv venv

# Activer l'environnement virtuel
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows

# Installer les dépendances
uv pip install -e ".[dev]"
```

### Lancer Dagster localement

```bash
# Configurer les variables d'environnement
export API_FOOTBALL_KEY=votre_cle_api
export SEASON=2024
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=football_data
export POSTGRES_USER=dagster
export POSTGRES_PASSWORD=dagster_password

# Lancer Dagster
dagster dev -m quantfoot
```

## 📦 Structure du Projet

```
quantfoot/
├── quantfoot/                  # Package principal
│   ├── __init__.py            # Définitions Dagster + config dlt
│   ├── assets/                # Assets Dagster
│   │   ├── __init__.py
│   │   └── leagues.py         # Asset utilisant dlt
│   └── sources/               # Sources dlt
│       ├── __init__.py
│       └── api_football/      # Source API Football (modulaire)
│           ├── __init__.py    # dlt source principale
│           ├── client.py      # Client HTTP réutilisable
│           ├── leagues.py     # Ressource leagues
│           ├── teams.py       # Ressource teams
│           ├── fixtures.py    # Ressource fixtures
│           └── standings.py   # Ressource standings
├── docker/                    # Configuration Docker
│   └── dagster.yaml          # Configuration Dagster
├── Dockerfile                 # Image Docker
├── docker-compose.yml         # Configuration Docker Compose
├── pyproject.toml            # Configuration Python
└── README.md                 # Ce fichier
```

## 🔄 Utilisation

### Matérialiser tous les assets

Dans l'interface Dagster (http://localhost:3000):

1. Allez dans l'onglet "Assets"
2. Sélectionnez tous les assets ou un groupe spécifique
3. Cliquez sur "Materialize selected"

### Planifier des exécutions automatiques

Vous pouvez ajouter des schedules ou des sensors dans `quantfoot/__init__.py` pour automatiser l'exécution des pipelines.

## 🏆 Best Practices Implémentées

1. **Séparation des concerns**: Resources séparées pour l'API et la base de données
2. **Gestion des erreurs**: Gestion des erreurs API et de base de données
3. **Idempotence**: Utilisation de `ON CONFLICT` pour les upserts
## 🏆 Best Practices Implémentées

1. **dlt pour ETL** - Extraction et chargement géré par dlt avec toutes ses fonctionnalités
2. **Schéma auto-géré** - dlt crée et met à jour le schéma automatiquement
3. **Merge automatique** - Upserts avec primary keys, pas de doublons
4. **Incremental loading** - Prêt pour charger uniquement les nouvelles données
5. **State management** - dlt garde une trace de ce qui a été chargé
6. **Logging intégré** - Logs détaillés via Dagster et dlt
7. **Type hints** - Code Python typé
8. **Configuration par environnement** - Variables d'environnement
9. **Conteneurisation** - Architecture Docker complète
10. **Évolutivité** - Facile d'ajouter de nouvelles sources dlt
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Reconstruire les images
docker-compose build

# Voir les logs d'un service spécifique
docker-compose logs -f postgres

# Se connecter à PostgreSQL
docker-compose exec postgres psql -U dagster -d football_data

# Exécuter une commande dans le conteneur Dagster
docker-compose exec dagster bash
```

## 📈 Extensions Futures

- Ajouter l'incremental loading pour les fixtures (charger uniquement les nouveaux matchs)
- Implémenter des partitions temporelles Dagster
- Ajouter des sensors pour détecter les nouveaux matchs en temps réel
- Créer des transformations dbt downstream
- Ajouter des ressources dlt pour: players, player_statistics, fixture_events
- Implémenter un cache/rate limiting pour l'API
- Ajouter des tests de données avec Great Expectations

## 🎯 Exemple d'Ajout d'une Nouvelle Ressource dlt

```python
# 1. Créer quantfoot/sources/api_football/players.py

import dlt
from typing import Iterator
from .client import APIFootballClient

@dlt.resource(
    name="players",
    write_disposition="merge",
    primary_key=["player_id", "team_id", "season"]
)
def players_resource(
    client: APIFootballClient,
    season: int = 2024,
    team_ids: list[int] = None
) -> Iterator[dict]:
    """Fetch players for specified teams."""
    for team_id in team_ids:
        params = {"team": team_id, "season": season}
        response = client.get("players", params)
        
        for item in response:
            # Votre logique de transformation
            yield {...}

# 2. Ajouter dans quantfoot/sources/api_football/__init__.py

from .players import players_resource

@dlt.source(name="api_football")
def api_football_source(...):
    return (
        leagues_resource(...),
        teams_resource(...),
        fixtures_resource(...),
        standings_resource(...),
        players_resource(...),  # ← Ajouter ici
    )
```

C'est tout! dlt s'occupe du reste: schéma, merge, tracking, etc.

## 📝 Notes

- L'API Football a des limites de taux. Consultez votre plan pour connaître vos limites.
- Les principales ligues configurées sont: Premier League, La Liga, Ligue 1, Bundesliga, Serie A
- Modifiez les listes de ligues dans les fichiers d'assets pour ajouter d'autres compétitions

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.
