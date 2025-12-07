{{
    config(
        materialized='view'
    )
}}

with source as (
    select * from {{ source('raw', 'raw_leagues') }}
),

parsed as (
    select
        league_id,
        league_name,
        country_name,
        season,
        
        -- Parse league details from JSON
        (data->'league'->>'type')::text as league_type,
        (data->'league'->>'logo')::text as league_logo,
        
        -- Parse country details
        (data->'country'->>'code')::text as country_code,
        (data->'country'->>'flag')::text as country_flag,
        
        -- Parse season info from the seasons array
        -- Note: Each row already has a specific season extracted
        (data->'seasons'->0->>'start')::date as season_start,
        (data->'seasons'->0->>'end')::date as season_end,
        (data->'seasons'->0->>'current')::boolean as is_current_season,
        
        -- Metadata
        current_timestamp as dbt_loaded_at
        
    from source
)

select * from parsed
