{{
    config(
        materialized='table'
    )
}}

with teams as (
    select * from {{ ref('stg_teams') }}
),

venues as (
    select * from {{ ref('stg_venues') }}
),

final as (
    select
        t.team_id,
        t.team_name,
        t.team_code,
        t.team_country,
        t.team_founded,
        t.is_national_team,
        t.team_logo,
        
        -- Venue info
        t.venue_id,
        v.venue_name,
        v.address as venue_address,
        v.city as venue_city,
        v.capacity as venue_capacity,
        v.surface as venue_surface,
        
        -- Metadata
        current_timestamp as dbt_updated_at
        
    from teams t
    left join venues v on t.venue_id = v.venue_id
)

select * from final
