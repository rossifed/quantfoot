

with players as (
    select * from "football_data"."staging"."stg_players"
),

teams as (
    select * from "football_data"."staging"."stg_teams"
),

final as (
    select
        p.player_id,
        p.player_name,
        p.age,
        p.position,
        p.jersey_number,
        p.photo_url,
        
        -- Team info
        p.team_id,
        t.team_name,
        t.team_code,
        t.team_country,
        
        -- Metadata
        current_timestamp as dbt_updated_at
        
    from players p
    left join teams t on p.team_id = t.team_id
)

select * from final