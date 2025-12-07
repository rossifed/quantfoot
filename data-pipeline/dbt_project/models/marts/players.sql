{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['player_id'], 'unique': True},
            {'columns': ['team_id']},
            {'columns': ['player_name']},
            {'columns': ['position']}
        ],
        post_hook=[
            "ALTER TABLE {{ this }} ADD CONSTRAINT {{ this.name }}_pkey PRIMARY KEY (player_id)",
            "ALTER TABLE {{ this }} ADD CONSTRAINT fk_{{ this.name }}_team FOREIGN KEY (team_id) REFERENCES {{ this.schema }}.teams(team_id) ON DELETE SET NULL",
            "ALTER TABLE {{ this }} ADD CONSTRAINT check_{{ this.name }}_age CHECK (age IS NULL OR (age >= 15 AND age <= 50))",
            "ALTER TABLE {{ this }} ALTER COLUMN player_id SET NOT NULL",
            "ALTER TABLE {{ this }} ALTER COLUMN player_name SET NOT NULL"
        ]
    )
}}

with players as (
    select * from {{ ref('stg_players') }}
),

teams as (
    select * from {{ ref('stg_teams') }}
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
