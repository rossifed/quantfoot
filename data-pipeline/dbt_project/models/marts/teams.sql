{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['team_id'], 'unique': True},
            {'columns': ['team_name']},
            {'columns': ['team_country']},
            {'columns': ['venue_id']}
        ],
        post_hook=[
            "ALTER TABLE {{ this }} ADD CONSTRAINT {{ this.name }}_pkey PRIMARY KEY (team_id)",
            "ALTER TABLE {{ this }} ADD CONSTRAINT check_{{ this.name }}_founded CHECK (team_founded IS NULL OR (team_founded >= 1850 AND team_founded <= EXTRACT(YEAR FROM CURRENT_DATE)))",
            "ALTER TABLE {{ this }} ALTER COLUMN team_id SET NOT NULL",
            "ALTER TABLE {{ this }} ALTER COLUMN team_name SET NOT NULL"
        ]
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
