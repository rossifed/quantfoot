

with source as (
    select * from "football_data"."raw"."raw_fixtures"
),

parsed as (
    select
        fixture_id,
        fixture_date,
        team_id,
        season,
        status,
        
        -- Parse JSON fields
        (data->>'fixture')::jsonb as fixture_json,
        (data->>'league')::jsonb as league_json,
        (data->>'teams')::jsonb as teams_json,
        (data->>'goals')::jsonb as goals_json,
        (data->>'score')::jsonb as score_json,
        
        -- Extract fixture details
        (data->'fixture'->>'referee')::text as referee,
        (data->'fixture'->>'timezone')::text as timezone,
        (data->'fixture'->>'timestamp')::bigint as timestamp_unix,
        to_timestamp((data->'fixture'->>'timestamp')::bigint) as fixture_datetime,
        
        -- Extract venue
        (data->'fixture'->'venue'->>'id')::int as venue_id,
        (data->'fixture'->'venue'->>'name')::text as venue_name,
        (data->'fixture'->'venue'->>'city')::text as venue_city,
        
        -- Extract status
        (data->'fixture'->'status'->>'long')::text as status_long,
        (data->'fixture'->'status'->>'short')::text as status_short,
        (data->'fixture'->'status'->>'elapsed')::int as minutes_elapsed,
        
        -- Extract league
        (data->'league'->>'id')::int as league_id,
        (data->'league'->>'name')::text as league_name,
        (data->'league'->>'country')::text as league_country,
        (data->'league'->>'logo')::text as league_logo,
        (data->'league'->>'flag')::text as league_flag,
        (data->'league'->>'season')::int as league_season,
        (data->'league'->>'round')::text as league_round,
        
        -- Extract teams
        (data->'teams'->'home'->>'id')::int as home_team_id,
        (data->'teams'->'home'->>'name')::text as home_team_name,
        (data->'teams'->'home'->>'logo')::text as home_team_logo,
        (data->'teams'->'home'->>'winner')::boolean as home_team_winner,
        
        (data->'teams'->'away'->>'id')::int as away_team_id,
        (data->'teams'->'away'->>'name')::text as away_team_name,
        (data->'teams'->'away'->>'logo')::text as away_team_logo,
        (data->'teams'->'away'->>'winner')::boolean as away_team_winner,
        
        -- Extract goals
        (data->'goals'->>'home')::int as goals_home,
        (data->'goals'->>'away')::int as goals_away,
        
        -- Extract score details
        (data->'score'->'halftime'->>'home')::int as halftime_home,
        (data->'score'->'halftime'->>'away')::int as halftime_away,
        (data->'score'->'fulltime'->>'home')::int as fulltime_home,
        (data->'score'->'fulltime'->>'away')::int as fulltime_away,
        (data->'score'->'extratime'->>'home')::int as extratime_home,
        (data->'score'->'extratime'->>'away')::int as extratime_away,
        (data->'score'->'penalty'->>'home')::int as penalty_home,
        (data->'score'->'penalty'->>'away')::int as penalty_away,
        
        -- Metadata
        current_timestamp as dbt_loaded_at
        
    from source
)

select * from parsed