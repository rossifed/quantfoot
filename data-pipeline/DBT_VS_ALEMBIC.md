# dbt vs Alembic/SQLAlchemy - Choix Architecture

## 🎯 Question centrale

**"Dois-je utiliser dbt OU Alembic/SQLAlchemy pour ma golden source avec contraintes fortes?"**

---

## 📊 Comparaison détaillée

| Critère | dbt | Alembic + SQLAlchemy | Gagnant |
|---|---|---|---|
| **ELT/Analytics** | ✅ Conçu pour ça | ❌ Pas son domaine | **dbt** |
| **OLTP/Transactionnel** | ❌ Pas conçu pour ça | ✅ Conçu pour ça | **Alembic** |
| **Migrations schema** | ⚠️ Full refresh only | ✅ Versionnées, réversibles | **Alembic** |
| **Contraintes persistantes** | ⚠️ Réappliquées à chaque run | ✅ Créées une fois | **Alembic** |
| **Golden Source READ** | ✅ Parfait | ⚠️ Requiert ORM mapping | **dbt** |
| **Golden Source WRITE** | ❌ Pas conçu | ✅ INSERT/UPDATE/DELETE | **Alembic** |
| **Tests qualité données** | ✅ Natif | ❌ Tu codes | **dbt** |
| **Documentation** | ✅ Auto | ❌ Manuelle | **dbt** |
| **Performance SELECT** | ✅ Optimisé batch | ⚠️ ORM overhead | **dbt** |
| **Transactions complexes** | ❌ Limité | ✅ ACID complet | **Alembic** |

---

## 🏗️ Architectures recommandées

### Architecture 1: **dbt pur** (ton cas actuel - VALIDE ✅)

```
API Sources → dbt (staging + marts) → PostgreSQL marts schema
                                          ↓
                                      .NET API (read-only)
                                          ↓
                                      Frontend React
```

**Cas d'usage:**
- ✅ Lecture seule (analytics, dashboards)
- ✅ Batch quotidien suffit
- ✅ Pas d'écritures utilisateur
- ✅ Golden source = marts dbt

**Contraintes:**
```yaml
# dbt avec post-hooks automatiques
config:
  materialized: table
  post_hook:
    - "ALTER TABLE {{ this }} ADD CONSTRAINT pk PRIMARY KEY (id)"
    - "ALTER TABLE {{ this }} ADD CONSTRAINT fk FOREIGN KEY..."
```

**Workflow:**
```bash
# Chaque jour à 2h du matin
dbt run --select marts  # Rebuild avec contraintes
dbt test                # Valide qualité
```

**✅ Avantages:**
- Simple, une seule techno
- Contraintes garanties après chaque run
- Tests qualité intégrés
- Documentation auto

**⚠️ Limitations:**
- Rebuild complet quotidien (lent si gros volumes)
- Pas de mutations en temps réel
- Contraintes recréées à chaque fois

---

### Architecture 2: **Alembic pour golden + dbt pour analytics**

```
API Sources → Python ETL → PostgreSQL (Alembic schema)
                               ↓
                           dbt (read from Alembic schema)
                               ↓
                           marts (dbt schema)
                               ↓
                           .NET API
```

**Cas d'usage:**
- ✅ Golden source avec WRITE (users, config, etc.)
- ✅ Migrations schema fréquentes
- ✅ Contraintes critiques (intégrité comptable, etc.)
- ✅ Mix OLTP + OLAP

**Code:**

```python
# alembic/versions/001_create_teams.py
def upgrade():
    op.create_table(
        'teams',
        sa.Column('team_id', sa.BigInteger, primary_key=True),
        sa.Column('team_name', sa.String, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now())
    )
    op.create_index('idx_teams_name', 'teams', ['team_name'])

def downgrade():
    op.drop_table('teams')

# alembic/versions/002_create_players.py
def upgrade():
    op.create_table(
        'players',
        sa.Column('player_id', sa.BigInteger, primary_key=True),
        sa.Column('team_id', sa.BigInteger, nullable=True),
        sa.ForeignKeyConstraint(['team_id'], ['teams.team_id'], 
                                ondelete='SET NULL'),
        sa.CheckConstraint('age >= 15 AND age <= 50', name='check_age')
    )
```

```sql
-- dbt models/marts/players.sql (read from Alembic tables)
{{ config(materialized='view') }}  -- VIEW, pas table!

SELECT 
    player_id,
    player_name,
    age,
    team_id
FROM {{ source('alembic', 'players') }}  -- Lit depuis schema Alembic
```

**✅ Avantages:**
- Migrations versionnées et réversibles
- Contraintes persistantes (pas recréées)
- Mix OLTP (Alembic) + OLAP (dbt)
- Rollback schema possible

**⚠️ Inconvénients:**
- Plus complexe (2 systèmes)
- Duplication potentielle
- Maintenance des 2 côtés

---

### Architecture 3: **Hybrid dbt incremental** (best of both)

```
API Sources → dbt incremental marts → PostgreSQL
                  ↓                       ↓
            Contraintes créées      .NET API (read/write)
            UNE SEULE FOIS              ↓
                                    Frontend
```

**Code:**

```sql
-- models/marts/players.sql
{{
    config(
        materialized='incremental',
        unique_key='player_id',
        on_schema_change='append_new_columns'
    )
}}

SELECT 
    player_id,
    player_name,
    age,
    team_id,
    current_timestamp as dbt_updated_at
FROM {{ ref('stg_players') }}

{% if is_incremental() %}
    WHERE dbt_updated_at > (SELECT MAX(dbt_updated_at) FROM {{ this }})
{% endif %}
```

**Contraintes (créées UNE FOIS):**
```bash
# Initial setup (une seule fois)
dbt run --select players --full-refresh
dbt run-operation add_mart_constraints

# Puis incrémental quotidien (contraintes conservées!)
dbt run --select players  # MERGE, pas DROP+CREATE
```

**✅ Avantages:**
- Performance (merge incrémental)
- Contraintes persistantes
- Une seule techno (dbt)
- Permet des writes externes (via .NET API)

**⚠️ Limitations:**
- Complexe si schema change souvent
- Nécessite colonne dbt_updated_at partout
- Pas de rollback migrations

---

## 🎯 Recommandation pour QuantFoot

### Ton contexte:
- ✅ Données lues depuis API externe
- ✅ Batch quotidien (pas temps réel)
- ✅ Lecture seule pour users (pas de writes)
- ✅ Analytics/dashboards
- ❌ Pas de mutations utilisateur

### ✅ Solution recommandée: **dbt pur avec post-hooks**

**Pourquoi:**
1. **Pas besoin d'Alembic** → Pas de writes utilisateur
2. **Post-hooks suffisent** → Contraintes automatiques après chaque run
3. **Simplicité** → Une seule stack (dbt + Dagster)
4. **Tests qualité** → Validation automatique
5. **Documentation** → Auto-générée

**Setup final:**

```sql
-- models/marts/teams.sql
{{
    config(
        materialized='table',
        indexes=[{'columns': ['team_id'], 'unique': True}],
        post_hook=[
            "ALTER TABLE {{ this }} ADD CONSTRAINT pk_teams PRIMARY KEY (team_id)",
            "ALTER TABLE {{ this }} ALTER COLUMN team_id SET NOT NULL"
        ]
    )
}}
```

```sql
-- models/marts/players.sql
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['player_id'], 'unique': True},
            {'columns': ['team_id']}
        ],
        post_hook=[
            "ALTER TABLE {{ this }} ADD CONSTRAINT pk_players PRIMARY KEY (player_id)",
            "ALTER TABLE {{ this }} ADD CONSTRAINT fk_players_team FOREIGN KEY (team_id) REFERENCES {{ this.schema }}.teams(team_id)",
            "ALTER TABLE {{ this }} ALTER COLUMN player_id SET NOT NULL"
        ]
    )
}}
```

**Workflow quotidien:**
```bash
# Via Dagster (automatique)
dbt run --select marts  # Rebuild avec contraintes auto (post-hooks)
dbt test               # Valide qualité
```

**Résultat:**
- ✅ Contraintes **automatiques** après chaque run
- ✅ Intégrité référentielle garantie
- ✅ Performance (indexes)
- ✅ Simplicité (pas besoin Alembic)

---

## 🚫 Quand utiliser Alembic/SQLAlchemy?

### Scénarios où Alembic est OBLIGATOIRE:

1. **Application transactionnelle (OLTP)**
```python
# Users peuvent créer/modifier des données
user = User(name="John")
session.add(user)
session.commit()  # ACID transaction
```

2. **Migrations schema fréquentes avec rollback**
```bash
alembic upgrade head  # Applique migrations
alembic downgrade -1  # Rollback si problème
```

3. **Contraintes critiques métier**
```python
# Comptabilité, finance, etc.
class Transaction(Base):
    __table_args__ = (
        CheckConstraint('debit + credit = 0'),  # DOIT être respecté
    )
```

4. **Mix OLTP + OLAP**
```
Users → Alembic (writes) → PostgreSQL ← dbt (reads) → Marts
```

### ❌ Alembic PAS nécessaire pour QuantFoot car:
- Pas de writes utilisateur
- Pas de transactions critiques
- Schema stable (API externe)
- Lecture seule

---

## 📋 Checklist décision

```
☐ Users peuvent créer/modifier des données?
   → OUI: Alembic pour golden source
   → NON: dbt suffit

☐ Migrations schema fréquentes avec rollback?
   → OUI: Alembic
   → NON: dbt post-hooks

☐ Contraintes critiques métier (finance, etc.)?
   → OUI: Alembic
   → NON: dbt post-hooks

☐ Mix OLTP + OLAP?
   → OUI: Alembic + dbt
   → NON: dbt seul

☐ Temps réel requis?
   → OUI: Alembic + CDC
   → NON: dbt batch

☐ Simplicité importante?
   → OUI: dbt seul
   → NON: Peu importe
```

**Pour QuantFoot: 6/6 NON → dbt seul suffit! ✅**

---

## 🎯 Ton architecture finale (validée)

```
┌─────────────────────────────────────────────────┐
│  API-Football (externe)                         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Dagster Orchestration                          │
│  └─ Fetch API → Load to PostgreSQL raw          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  dbt Transformation                             │
│  ├─ staging/ (clean)                            │
│  └─ marts/ (denormalized + CONSTRAINTS)         │
│      ├─ players (PK, FK, CHECK, indexes)        │
│      ├─ teams (PK, CHECK, indexes)              │
│      └─ fixtures (PK, FK, CHECK, indexes)       │
│                                                  │
│  post-hooks appliquent contraintes AUTO! ✅      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  PostgreSQL marts schema                        │
│  └─ Golden Source READ-ONLY                     │
│     └─ Contraintes fortes garanties             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  .NET API (Players service)                     │
│  └─ EF Core lit depuis marts                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  React Frontend                                 │
│  └─ Affiche données                             │
└─────────────────────────────────────────────────┘
```

**Pas besoin d'Alembic! dbt avec post-hooks = Golden source robuste! 🏆**
