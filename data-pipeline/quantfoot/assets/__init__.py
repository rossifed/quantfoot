"""
Export all assets for Dagster.
"""
from .leagues import api_football_raw_assets
from .dbt import quantfoot_dbt_assets

__all__ = [
    "api_football_raw_assets",
    "quantfoot_dbt_assets",
]

