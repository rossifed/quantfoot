"""
Raw venues resource - stores venue information for Servette FC from API Football.
Note: Venue info is already included in team info, but this provides dedicated access.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_venues",
    write_disposition="replace",
    columns={"data": {"data_type": "json"}}
)
def raw_venues_resource(
    client: APIFootballClient,
    team_ids: list[int]
) -> Iterator[dict[str, Any]]:
    """
    Fetch venue information for multiple teams and store as raw JSON.
    
    Args:
        client: API Football client
        team_ids: List of team IDs (e.g., [2184, 6654])
        
    Yields:
        Raw venue data with JSON stored in 'data' column
    """
    for team_id in team_ids:
        # Get team info which includes venue
        params = {"id": team_id}
        response = client.get("teams", params)
        
        for item in response:
            venue = item.get("venue", {})
            
            if venue:
                yield {
                    "venue_id": venue.get("id"),
                    "venue_name": venue.get("name"),
                    "team_id": item.get("team", {}).get("id"),
                    "data": venue,  # Store complete venue JSON
                }