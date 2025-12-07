"""
dbt assets for transforming raw data to staging.
"""
import os
from pathlib import Path
from dagster import AssetExecutionContext
from dagster_dbt import DbtCliResource, dbt_assets, DbtProject

# Point to the dbt project
DBT_PROJECT_DIR = Path(__file__).parent.parent.parent / "dbt_project"

dbt_project = DbtProject(
    project_dir=DBT_PROJECT_DIR,
)

@dbt_assets(
    manifest=DBT_PROJECT_DIR / "target" / "manifest.json",
    project=dbt_project,
)
def quantfoot_dbt_assets(context: AssetExecutionContext, dbt: DbtCliResource):
    """
    dbt models for transforming raw data from API Football into staging views.
    
    This will create staging views:
    - stg_fixtures: Parsed fixture data with all details
    - stg_players: Player squad information
    - stg_teams: Team information with venue details
    - stg_venues: Venue/stadium details
    - stg_leagues: League and season information
    
    And marts tables:
    - fixtures: Final fixtures table
    - players: Final players table
    - teams: Final teams table
    """
    # Build all models (staging + marts) in the correct order
    yield from dbt.cli(["build", "--select", "staging.*+ marts.*"], context=context).stream()
