
  
    

  create  table "football_data"."marts"."fixtures__dbt_tmp"
  
  
    as
  
  (
    

with fixtures as (
    select * from "football_data"."staging"."stg_fixtures"
),

teams as (
    select * from "football_data"."staging"."stg_teams"
),

venues as (
    select * from "football_data"."staging"."stg_venues"
),

leagues as (
    select * from "football_data"."staging"."stg_leagues"
),

final as (
    select
        -- Fixture identifiers
        f.fixture_id,
        f.fixture_datetime,
        f.fixture_date,
        f.season,
        
        -- Status
        f.status,
        f.status_long,
        f.minutes_elapsed,
        
        -- League info
        f.league_id,
        l.league_name,
        l.league_type,
        l.country_name as league_country,
        f.league_round,
        
        -- Venue info
        f.venue_id,
        v.venue_name,
        v.city as venue_city,
        v.capacity as venue_capacity,
        
        -- Home team
        f.home_team_id,
        ht.team_name as home_team_name,
        ht.team_code as home_team_code,
        f.home_team_winner,
        
        -- Away team
        f.away_team_id,
        at.team_name as away_team_name,
        at.team_code as away_team_code,
        f.away_team_winner,
        
        -- Score
        f.goals_home,
        f.goals_away,
        f.halftime_home,
        f.halftime_away,
        f.fulltime_home,
        f.fulltime_away,
        
        -- Match result
        case
            when f.home_team_winner = true then 'H'
            when f.away_team_winner = true then 'A'
            when f.goals_home = f.goals_away and f.status_short = 'FT' then 'D'
            else null
        end as result,
        
        -- Goal difference
        case
            when f.goals_home is not null and f.goals_away is not null
            then f.goals_home - f.goals_away
            else null
        end as goal_difference,
        
        -- Total goals
        case
            when f.goals_home is not null and f.goals_away is not null
            then f.goals_home + f.goals_away
            else null
        end as total_goals,
        
        -- Match info
        f.referee,
        
        -- Metadata
        current_timestamp as dbt_updated_at
        
    from fixtures f
    left join teams ht on f.home_team_id = ht.team_id
    left join teams at on f.away_team_id = at.team_id
    left join venues v on f.venue_id = v.venue_id
    left join leagues l on f.league_id = l.league_id and f.season = l.season
)

select * from final
  );
  