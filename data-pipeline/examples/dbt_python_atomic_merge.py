import pandas as pd
from sqlalchemy import text

def model(dbt, session):
    """
    dbt Python model qui reproduit exactement ta logique MERGE avec atomicité
    """
    
    # Configuration
    dbt.config(
        materialized="table",
        packages=["pandas", "sqlalchemy"]
    )
    
    # Exécuter la transaction atomique complète
    sql = text("""
    BEGIN;
    
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
            sqe.sec_delist_date AS delisted_date,
            sqe.issue_type_code AS issue_type,
            sqe.issue_description,
            sqe.ric_root AS symbol,
            sqe.isin,
            sqe.cusip,
            sqe.sedol,
            sqe.ric,
            sqe.ticker,
            et.equity_type_id,
            sqe.div_unit,
            sqe.is_major_security,
            sqe.is_primary_country,
            ctry.country_id,
            sqe.split_factor,
            sqe.split_date,
            it.instrument_type_id
        FROM staging.stg_qa_equity AS sqe
        JOIN ref_data.data_source ds on ds.mnemonic = sqe.source
        LEFT JOIN ref_data.instrument_mapping AS iim
            ON iim.external_instrument_id = sqe.external_instrument_id
           AND iim.data_source_id = ds.data_source_id
        LEFT JOIN ref_data.company_mapping AS cim
            ON cim.external_company_id = sqe.external_company_id
           AND cim.data_source_id = ds.data_source_id
        LEFT JOIN ref_data.country AS ctry
            ON ctry.code = sqe.region
        LEFT JOIN ref_data.instrument_type AS it
            ON it.mnemonic = 'EQU'
        LEFT JOIN ref_data.equity_type AS et
            ON et.mnemonic = sqe.type_code
    ),
    merge_instrument_base AS (
        MERGE INTO ref_data.instrument AS tgt
        USING stg_qa_instrument_with_id AS src
        ON src.internal_instrument_id = tgt.instrument_id
        WHEN MATCHED THEN
            UPDATE SET
                name = src.name,
                instrument_type_id = src.instrument_type_id,
                entity_id = src.entity_id,
                symbol = src.symbol,
                description = src.description
        WHEN NOT MATCHED THEN
            INSERT (name, instrument_type_id, entity_id, symbol, description)
            VALUES (src.name, src.instrument_type_id, src.entity_id, src.symbol, src.description)
        RETURNING tgt.instrument_id, src.external_instrument_id, src.data_source_id
    ),
    enriched_instrument AS (
        SELECT
            me.instrument_id,
            src.security_id,
            src.isin,
            src.cusip,
            src.sedol,
            src.ric,
            src.ticker,
            src.equity_type_id,
            src.issue_type,
            src.issue_description,
            src.delisted_date,
            src.div_unit,
            src.is_major_security,
            src.is_primary_country,
            src.country_id,
            src.split_date,
            src.split_factor,
            src.instrument_type_id,
            me.external_instrument_id,
            me.data_source_id
        FROM merge_instrument_base AS me
        JOIN stg_qa_instrument_with_id AS src
          ON src.external_instrument_id = me.external_instrument_id
    ),
    merge_equity AS (
        MERGE INTO ref_data.equity AS tgt
        USING enriched_instrument AS src
        ON src.instrument_id = tgt.equity_id
        WHEN MATCHED THEN
            UPDATE SET
                isin = src.isin,
                cusip = src.cusip,
                sedol = src.sedol,
                ric = src.ric,
                ticker = src.ticker,
                delisted_date = src.delisted_date,
                equity_type_id = src.equity_type_id,
                issue_type = src.issue_type,
                issue_description = src.issue_description,
                div_unit = src.div_unit,
                is_major_security = src.is_major_security,
                country_id = src.country_id,
                split_date = src.split_date,
                split_factor = src.split_factor,
                security_id = src.security_id
        WHEN NOT MATCHED THEN
            INSERT (
                equity_id, security_id, isin, cusip, sedol, ric, ticker, delisted_date,
                equity_type_id, issue_type, issue_description, div_unit,
                is_major_security, country_id,
                split_date, split_factor
            )
            VALUES (
                src.instrument_id, src.security_id, src.isin, src.cusip, src.sedol, src.ric, src.ticker,
                src.delisted_date, src.equity_type_id, src.issue_type, src.issue_description,
                src.div_unit, src.is_major_security,
                src.country_id, src.split_date, src.split_factor
            )
    ),
    update_mapping AS (
        INSERT INTO ref_data.instrument_mapping (data_source_id, external_instrument_id, internal_instrument_id)
        SELECT
            data_source_id, external_instrument_id, instrument_id
        FROM merge_instrument_base
        ON CONFLICT (data_source_id, external_instrument_id) DO NOTHING
    )
    
    SELECT 1 as success;
    
    COMMIT;
    """)
    
    # Exécuter dans une transaction atomique
    result = session.execute(sql)
    
    # Retourner un DataFrame pour dbt (requis)
    return pd.DataFrame({'success': [1], 'executed_at': [pd.Timestamp.now()]})
