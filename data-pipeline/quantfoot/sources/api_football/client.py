"""
API Football client for making requests.
"""
from typing import Optional, Any
from dlt.sources.helpers import requests


class APIFootballClient:
    """Client for API Football REST API."""
    
    def __init__(self, api_key: str, api_host: str = "v3.football.api-sports.io"):
        self.api_key = api_key
        self.api_host = api_host
        self.base_url = f"https://{api_host}"
    
    def _get_headers(self) -> dict[str, str]:
        """Get headers for API requests."""
        return {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": self.api_host
        }
    
    def get(self, endpoint: str, params: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
        """
        Make a GET request to the API.
        
        Args:
            endpoint: API endpoint (e.g., "leagues", "teams")
            params: Query parameters
            
        Returns:
            JSON response data
        """
        url = f"{self.base_url}/{endpoint}"
        response = requests.get(url, headers=self._get_headers(), params=params or {})  # type: ignore
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("errors"):
            raise Exception(f"API Error: {data['errors']}")
        
        return data.get("response", [])  # type: ignore
