-- models/marts/instrument.sql
{{
    config(
        materialized='incremental',
        unique_key='internal_instrument_id',
        merge_update_columns=['name', 'instrument_type_id', 'entity_id', 'symbol', 'description']
    )
}}

WITH stg_qa_instrument_with_id AS (
    SELECT
        iim.internal_instrument_id,
        sqe.external_instrument_id,
        sqe.source,
        ds.data_source_id,
        cim.internal_company_id AS entity_id,
        sqe.external_security_id::INT AS security_id,
        sqe.ds_sec_name AS name,
        sqe.ds_qt_name AS description,
        -- ... autres colonnes
        it.instrument_type_id
    FROM {{ ref('stg_qa_equity') }} AS sqe
    JOIN {{ ref('data_source') }} ds on ds.mnemonic = sqe.source
    LEFT JOIN {{ ref('instrument_mapping') }} AS iim
        ON iim.external_instrument_id = sqe.external_instrument_id
       AND iim.data_source_id = ds.data_source_id
    -- ... autres joins
)

SELECT
    COALESCE(internal_instrument_id, {{ generate_surrogate_key(['external_instrument_id', 'data_source_id']) }}) as instrument_id,
    name,
    instrument_type_id,
    entity_id,
    symbol,
    description,
    external_instrument_id,
    data_source_id,
    current_timestamp as dbt_updated_at
FROM stg_qa_instrument_with_id

{% if is_incremental() %}
    WHERE dbt_updated_at > (SELECT MAX(dbt_updated_at) FROM {{ this }})
{% endif %}
