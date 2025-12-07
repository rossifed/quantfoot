{{
    config(
        materialized='view'
    )
}}

with source as (
    select * from {{ source('raw', 'raw_players') }}
),

parsed as (
    select
        player_id,
        player_name,
        team_id,
        position,
        number as jersey_number,
        
        -- Parse additional fields from JSON
        (data->>'age')::int as age,
        (data->>'photo')::text as photo_url,
        
        -- Metadata
        current_timestamp as dbt_loaded_at
        
    from source
)

select * from parsed
