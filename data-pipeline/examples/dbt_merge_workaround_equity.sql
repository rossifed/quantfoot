-- models/marts/equity.sql
{{
    config(
        materialized='incremental',
        unique_key='equity_id'
    )
}}

-- ⚠️ PROBLÈME: Dépend de instrument.sql, mais pas dans MÊME transaction!
SELECT
    i.instrument_id as equity_id,
    s.security_id,
    s.isin,
    s.cusip,
    s.sedol,
    s.ric,
    s.ticker,
    s.delisted_date,
    s.equity_type_id,
    -- ... autres colonnes
    current_timestamp as dbt_updated_at
FROM {{ ref('instrument') }} i  -- ⚠️ Lit depuis table DÉJÀ commited!
JOIN {{ ref('stg_qa_equity') }} s
  ON i.external_instrument_id = s.external_instrument_id

{% if is_incremental() %}
    WHERE i.dbt_updated_at > (SELECT MAX(dbt_updated_at) FROM {{ this }})
{% endif %}
