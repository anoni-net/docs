"""Tor Onionoo API"""

from requests import Session

from structs import Details


class TorOnionoo(Session):
    """Fetch Tor Metrics"""

    def get_details(self, country="tw") -> Details:
        """Get Relays"""
        resp = self.get(
            "https://onionoo.torproject.org/details", params={"country": country}
        ).json()

        return Details.model_validate(resp)
