"""
Raw fixtures resource - stores complete JSON response for Servette FC fixtures from API Football.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_fixtures",
    write_disposition="merge",
    primary_key="fixture_id",
    columns={"data": {"data_type": "json"}}
)
def raw_fixtures_resource(
    client: APIFootballClient,
    season: int,
    team_ids: list[int]
) -> Iterator[dict[str, Any]]:
    """
    Fetch all fixtures (with history) for multiple teams in a season and store as raw JSON.
    
    Args:
        client: API Football client
        season: Season year
        team_ids: List of team IDs (e.g., [2184, 6654])
        
    Yields:
        Raw fixture data with JSON stored in 'data' column
    """
    for team_id in team_ids:
        params = {"team": team_id, "season": season}
        response = client.get("fixtures", params)
        
        for item in response:
            fixture = item.get("fixture", {})
            
            yield {
                "fixture_id": fixture.get("id"),
                "fixture_date": fixture.get("date"),
                "team_id": team_id,
                "season": season,
                "status": fixture.get("status", {}).get("short"),
                "data": item,  # Store complete JSON (fixture + teams + score + league, etc.)
            }