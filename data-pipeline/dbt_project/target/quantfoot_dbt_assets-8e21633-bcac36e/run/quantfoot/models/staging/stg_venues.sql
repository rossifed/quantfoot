
  create view "football_data"."staging"."stg_venues__dbt_tmp"
    
    
  as (
    

with source as (
    select * from "football_data"."raw"."raw_venues"
),

parsed as (
    select
        venue_id,
        venue_name,
        team_id,
        
        -- Parse venue details from JSON
        (data->>'address')::text as address,
        (data->>'city')::text as city,
        (data->>'capacity')::int as capacity,
        (data->>'surface')::text as surface,
        (data->>'image')::text as image_url,
        
        -- Metadata
        current_timestamp as dbt_loaded_at
        
    from source
)

select * from parsed
  );