"""
Raw team info resource - stores complete JSON response for Servette FC from API Football.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_team_info",
    write_disposition="replace",
    columns={"data": {"data_type": "json"}}
)
def raw_team_info_resource(
    client: APIFootballClient,
    team_ids: list[int]
) -> Iterator[dict[str, Any]]:
    """
    Fetch team information for multiple teams and store as raw JSON.
    
    Args:
        client: API Football client
        team_ids: List of team IDs (e.g., [2184, 6654])
        
    Yields:
        Raw team data with JSON stored in 'data' column
    """
    for team_id in team_ids:
        params = {"id": team_id}
        response = client.get("teams", params)
        
        for item in response:
            team = item.get("team", {})
            venue = item.get("venue", {})
            
            yield {
                "team_id": team.get("id"),
                "team_name": team.get("name"),
                "venue_id": venue.get("id"),
                "venue_name": venue.get("name"),
                "data": item,  # Store complete JSON (team + venue)
            }