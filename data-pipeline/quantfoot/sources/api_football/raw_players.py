"""
Raw players resource - stores player squad information for Servette FC from API Football.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_players",
    write_disposition="replace",
    columns={"data": {"data_type": "json"}}
)
def raw_players_resource(
    client: APIFootballClient,
    team_ids: list[int]
) -> Iterator[dict[str, Any]]:
    """
    Fetch player squad for multiple teams and store as raw JSON.
    
    Args:
        client: API Football client
        team_ids: List of team IDs (e.g., [2184, 6654])
        
    Yields:
        Raw player data with JSON stored in 'data' column
    """
    for team_id in team_ids:
        params = {"team": team_id}
        response = client.get("players/squads", params)
        
        for item in response:
            team = item.get("team", {})
            players = item.get("players", [])
            
            for player in players:
                yield {
                    "player_id": player.get("id"),
                    "player_name": player.get("name"),
                    "team_id": team.get("id"),
                    "position": player.get("position"),
                    "number": player.get("number"),
                    "data": player,  # Store complete player JSON
                }