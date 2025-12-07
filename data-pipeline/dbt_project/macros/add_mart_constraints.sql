{% macro add_mart_constraints() %}

{%- set schema = target.schema -%}

-- ==============================================
-- STEP 1: DROP ALL EXISTING CONSTRAINTS (idempotent)
-- ==============================================

-- Drop FK constraints (must be first to avoid cascade issues)
ALTER TABLE {{ schema }}.players DROP CONSTRAINT IF EXISTS fk_players_team CASCADE;
ALTER TABLE {{ schema }}.fixtures DROP CONSTRAINT IF EXISTS fk_fixtures_home_team CASCADE;
ALTER TABLE {{ schema }}.fixtures DROP CONSTRAINT IF EXISTS fk_fixtures_away_team CASCADE;
ALTER TABLE {{ schema }}.fixtures DROP CONSTRAINT IF EXISTS fk_fixtures_league CASCADE;
ALTER TABLE {{ schema }}.fixtures DROP CONSTRAINT IF EXISTS fk_fixtures_venue CASCADE;

-- Drop PK constraints
ALTER TABLE {{ schema }}.players DROP CONSTRAINT IF EXISTS players_pkey CASCADE;
ALTER TABLE {{ schema }}.teams DROP CONSTRAINT IF EXISTS teams_pkey CASCADE;
ALTER TABLE {{ schema }}.fixtures DROP CONSTRAINT IF EXISTS fixtures_pkey CASCADE;

-- Drop CHECK constraints
ALTER TABLE {{ schema }}.players DROP CONSTRAINT IF EXISTS check_player_age CASCADE;
ALTER TABLE {{ schema }}.teams DROP CONSTRAINT IF EXISTS check_team_founded CASCADE;
ALTER TABLE {{ schema }}.fixtures DROP CONSTRAINT IF EXISTS check_fixture_scores CASCADE;


-- ==============================================
-- STEP 2: ADD PRIMARY KEYS
-- ==============================================

ALTER TABLE {{ schema }}.teams 
    ADD CONSTRAINT teams_pkey PRIMARY KEY (team_id);

ALTER TABLE {{ schema }}.players 
    ADD CONSTRAINT players_pkey PRIMARY KEY (player_id);

ALTER TABLE {{ schema }}.fixtures 
    ADD CONSTRAINT fixtures_pkey PRIMARY KEY (fixture_id);


-- ==============================================
-- STEP 3: ADD FOREIGN KEYS
-- ==============================================

-- Players → Teams (soft delete: SET NULL si team supprimée)
ALTER TABLE {{ schema }}.players 
    ADD CONSTRAINT fk_players_team 
    FOREIGN KEY (team_id) 
    REFERENCES {{ schema }}.teams(team_id) 
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Fixtures → Teams (hard delete: CASCADE si team supprimée)
ALTER TABLE {{ schema }}.fixtures 
    ADD CONSTRAINT fk_fixtures_home_team 
    FOREIGN KEY (home_team_id) 
    REFERENCES {{ schema }}.teams(team_id) 
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE {{ schema }}.fixtures 
    ADD CONSTRAINT fk_fixtures_away_team 
    FOREIGN KEY (away_team_id) 
    REFERENCES {{ schema }}.teams(team_id) 
    ON DELETE CASCADE
    ON UPDATE CASCADE;


-- ==============================================
-- STEP 4: ADD NOT NULL CONSTRAINTS
-- ==============================================

-- Players
ALTER TABLE {{ schema }}.players 
    ALTER COLUMN player_id SET NOT NULL,
    ALTER COLUMN player_name SET NOT NULL;

-- Teams
ALTER TABLE {{ schema }}.teams 
    ALTER COLUMN team_id SET NOT NULL,
    ALTER COLUMN team_name SET NOT NULL;

-- Fixtures
ALTER TABLE {{ schema }}.fixtures 
    ALTER COLUMN fixture_id SET NOT NULL,
    ALTER COLUMN home_team_id SET NOT NULL,
    ALTER COLUMN away_team_id SET NOT NULL,
    ALTER COLUMN fixture_date SET NOT NULL;


-- ==============================================
-- STEP 5: ADD CHECK CONSTRAINTS (business rules)
-- ==============================================

-- Player age must be realistic
ALTER TABLE {{ schema }}.players 
    ADD CONSTRAINT check_player_age 
    CHECK (age IS NULL OR (age >= 15 AND age <= 50));

-- Team founded year must be realistic
ALTER TABLE {{ schema }}.teams 
    ADD CONSTRAINT check_team_founded 
    CHECK (team_founded IS NULL OR (team_founded >= 1850 AND team_founded <= EXTRACT(YEAR FROM CURRENT_DATE)));

-- Fixture scores must be non-negative
ALTER TABLE {{ schema }}.fixtures 
    ADD CONSTRAINT check_fixture_scores 
    CHECK (
        (home_goals IS NULL OR home_goals >= 0) AND 
        (away_goals IS NULL OR away_goals >= 0)
    );

-- Home and away teams must be different
ALTER TABLE {{ schema }}.fixtures 
    ADD CONSTRAINT check_teams_different 
    CHECK (home_team_id != away_team_id);


-- ==============================================
-- STEP 6: ADD UNIQUE CONSTRAINTS
-- ==============================================

-- Prevent duplicate fixtures (same teams, same date)
-- Note: Commented out as same teams can play multiple times same day (different competitions)
-- ALTER TABLE {{ schema }}.fixtures 
--     ADD CONSTRAINT unique_fixture_matchup 
--     UNIQUE (home_team_id, away_team_id, fixture_date);


-- ==============================================
-- STEP 7: CREATE UPDATE TIMESTAMP TRIGGERS
-- ==============================================

-- Function to auto-update dbt_updated_at
CREATE OR REPLACE FUNCTION {{ schema }}.update_dbt_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dbt_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all marts
DROP TRIGGER IF EXISTS trg_update_players_timestamp ON {{ schema }}.players;
CREATE TRIGGER trg_update_players_timestamp
    BEFORE UPDATE ON {{ schema }}.players
    FOR EACH ROW
    EXECUTE FUNCTION {{ schema }}.update_dbt_timestamp();

DROP TRIGGER IF EXISTS trg_update_teams_timestamp ON {{ schema }}.teams;
CREATE TRIGGER trg_update_teams_timestamp
    BEFORE UPDATE ON {{ schema }}.teams
    FOR EACH ROW
    EXECUTE FUNCTION {{ schema }}.update_dbt_timestamp();

DROP TRIGGER IF EXISTS trg_update_fixtures_timestamp ON {{ schema }}.fixtures;
CREATE TRIGGER trg_update_fixtures_timestamp
    BEFORE UPDATE ON {{ schema }}.fixtures
    FOR EACH ROW
    EXECUTE FUNCTION {{ schema }}.update_dbt_timestamp();


-- ==============================================
-- STEP 8: ANALYZE TABLES (update statistics)
-- ==============================================

ANALYZE {{ schema }}.teams;
ANALYZE {{ schema }}.players;
ANALYZE {{ schema }}.fixtures;


-- ==============================================
-- SUMMARY
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Constraints applied successfully:';
    RAISE NOTICE '   - Primary Keys: teams, players, fixtures';
    RAISE NOTICE '   - Foreign Keys: players→teams, fixtures→teams';
    RAISE NOTICE '   - NOT NULL: Critical columns enforced';
    RAISE NOTICE '   - CHECK: Age, founded year, scores validated';
    RAISE NOTICE '   - TRIGGERS: Auto-update timestamps';
    RAISE NOTICE '   - ANALYZE: Statistics refreshed';
END $$;

{% endmacro %}
