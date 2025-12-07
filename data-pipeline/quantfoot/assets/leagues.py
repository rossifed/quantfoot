"""
Dagster assets using dlt for loading raw data from API Football.
"""
import os
import dlt
from dagster import AssetExecutionContext
from dagster_embedded_elt.dlt import DagsterDltResource, dlt_assets

from ..sources import api_football_source


@dlt_assets(
    dlt_source=api_football_source(
        api_key=os.getenv("API_FOOTBALL_KEY", "6f3db45add8cadeeca80b5641e4c5ee8"),
        api_host=os.getenv("API_FOOTBALL_HOST", "v3.football.api-sports.io"),
        season=int(os.getenv("SEASON", "2025")),
        team_ids=[int(x) for x in os.getenv("TEAM_IDS", "2184,6654").split(",")],
    ),
    dlt_pipeline=dlt.pipeline(
        pipeline_name="api_football_raw",
        dataset_name="raw",
        destination=dlt.destinations.postgres(
            credentials={
                "database": os.getenv("POSTGRES_DB", "football_data"),
                "username": os.getenv("POSTGRES_USER", "dagster"),
                "password": os.getenv("POSTGRES_PASSWORD", "dagster_password"),
                "host": os.getenv("POSTGRES_HOST", "postgres"),
                "port": int(os.getenv("POSTGRES_PORT", "5432")),
            }
        ),
        progress="log"
    ),
    name="api_football_raw",
    group_name="api_football"
)
def api_football_raw_assets(context: AssetExecutionContext, dlt_pipeline_resource: DagsterDltResource):  # type: ignore
    """
    Load raw data from API Football into PostgreSQL as JSON.
    
    This asset loads:
    - raw_countries: All countries
    - raw_leagues: All leagues and seasons
    - raw_team_info: Servette FC and Étoile Carouge information
    - raw_team_seasons: Teams seasons
    - raw_venues: Teams venues
    - raw_fixtures: All teams fixtures for 2025
    - raw_players: Teams squads
    
    All data is stored as JSONB for flexibility and future transformation with dbt.
    """
    yield from dlt_pipeline_resource.run(context=context)  # type: ignore

