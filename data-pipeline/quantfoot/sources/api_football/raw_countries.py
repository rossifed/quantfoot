"""
Raw countries resource - stores complete JSON response from API Football.
"""
import dlt
from typing import Iterator, Any
from .client import APIFootballClient


@dlt.resource(
    name="raw_countries",
    write_disposition="replace",
    columns={"data": {"data_type": "json"}}
)
def raw_countries_resource(client: APIFootballClient) -> Iterator[dict[str, Any]]:
    """
    Fetch all countries from API Football and store as raw JSON.
    
    Args:
        client: API Football client
        
    Yields:
        Raw country data with JSON stored in 'data' column
    """
    response = client.get("countries", {})
    
    for item in response:
        yield {
            "country_code": item.get("code"),
            "country_name": item.get("name"),
            "data": item,  # Store complete JSON
        }
