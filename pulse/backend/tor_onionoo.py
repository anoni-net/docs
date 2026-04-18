"""Tor Onionoo API"""

from requests import Session

from structs import Details


class TorOnionoo(Session):
    """Fetch Tor Metrics"""

    def get_details(self, country: str = "tw") -> Details:
        """Get Relays"""
        resp = self.get(
            "https://onionoo.torproject.org/details",
            params={"country": country},
            timeout=30,
        )
        resp.raise_for_status()
        return Details.model_validate(resp.json())
