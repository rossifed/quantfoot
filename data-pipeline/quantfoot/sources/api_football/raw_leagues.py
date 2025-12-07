"""
Raw leagues resource - stores complete JSON response for all leagues/seasons from API Football.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_leagues",
    write_disposition="replace",
    columns={"data": {"data_type": "json"}}
)
def raw_leagues_resource(client: APIFootballClient) -> Iterator[dict[str, Any]]:
    """
    Fetch all leagues and their seasons from API Football and store as raw JSON.
    
    Args:
        client: API Football client
        
    Yields:
        Raw league data with JSON stored in 'data' column
    """
    response = client.get("leagues", {})
    
    for item in response:
        league = item.get("league", {})
        country = item.get("country", {})
        seasons = item.get("seasons", [])
        
        # Store each league-season combination
        for season in seasons:
            yield {
                "league_id": league.get("id"),
                "league_name": league.get("name"),
                "country_name": country.get("name"),
                "season": season.get("year"),
                "data": item,  # Store complete JSON including all seasons
            }
