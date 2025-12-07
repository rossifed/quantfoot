"""
API Football dlt source.
"""
import dlt
from .client import APIFootballClient
from .raw_countries import raw_countries_resource
from .raw_leagues import raw_leagues_resource
from .raw_team_info import raw_team_info_resource
from .raw_team_seasons import raw_team_seasons_resource
from .raw_venues import raw_venues_resource
from .raw_fixtures import raw_fixtures_resource
from .raw_players import raw_players_resource


@dlt.source(name="api_football")
def api_football_source(
    api_key: str,
    api_host: str = "v3.football.api-sports.io",
    season: int = 2025,
    team_ids: list[int] | None = None,
):
    """
    Source for loading raw data from API Football.
    All data is stored as JSON in PostgreSQL JSONB columns for flexibility.
    
    Args:
        api_key: API key for API Football
        api_host: API host
        season: Season year
        team_ids: List of team IDs (default: None -> [2184, 6654] for Servette FC and Étoile Carouge)
        
    Returns:
        dlt source with raw data resources storing complete JSON responses
    """
    # Initialize client
    client = APIFootballClient(api_key=api_key, api_host=api_host)
    
    # Default team IDs if not provided
    if team_ids is None:
        team_ids = [2184, 6654]
    
    # Return all raw resources
    return (
        raw_countries_resource(client=client),
        raw_leagues_resource(client=client),
        raw_team_info_resource(client=client, team_ids=team_ids),
        raw_team_seasons_resource(client=client, team_ids=team_ids),
        raw_venues_resource(client=client, team_ids=team_ids),
        raw_fixtures_resource(client=client, season=season, team_ids=team_ids),
        raw_players_resource(client=client, team_ids=team_ids),
    )
