{{
    config(
        materialized='view'
    )
}}

with source as (
    select * from {{ source('raw', 'raw_team_info') }}
),

parsed as (
    select
        team_id,
        team_name,
        venue_id,
        venue_name,
        
        -- Parse team details from JSON
        (data->'team'->>'code')::text as team_code,
        (data->'team'->>'country')::text as team_country,
        (data->'team'->>'founded')::int as team_founded,
        (data->'team'->>'national')::boolean as is_national_team,
        (data->'team'->>'logo')::text as team_logo,
        
        -- Parse venue details
        (data->'venue'->>'address')::text as venue_address,
        (data->'venue'->>'city')::text as venue_city,
        (data->'venue'->>'capacity')::int as venue_capacity,
        (data->'venue'->>'surface')::text as venue_surface,
        (data->'venue'->>'image')::text as venue_image,
        
        -- Metadata
        current_timestamp as dbt_loaded_at
        
    from source
)

select * from parsed
