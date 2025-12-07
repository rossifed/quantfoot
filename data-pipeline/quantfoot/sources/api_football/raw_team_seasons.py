"""
Raw team seasons resource - stores seasons available for Servette FC from API Football.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_team_seasons",
    write_disposition="replace",
    columns={"data": {"data_type": "json"}}
)
def raw_team_seasons_resource(
    client: APIFootballClient,
    team_ids: list[int]
) -> Iterator[dict[str, Any]]:
    """
    Fetch seasons available for multiple teams and store as raw JSON.
    
    Args:
        client: API Football client
        team_ids: List of team IDs (e.g., [2184, 6654])
        
    Yields:
        Raw season data with JSON stored in 'data' column
    """
    for team_id in team_ids:
        params = {"team": team_id}
        response = client.get("teams/seasons", params)
        
        # Response is a simple array of years
        for season_year in response:
            yield {
                "team_id": team_id,
                "season": season_year,
                "data": {"team_id": team_id, "season": season_year},  # Store as JSON
            }