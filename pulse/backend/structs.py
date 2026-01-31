"""Structs"""

from datetime import datetime

from pydantic import BaseModel, Field


class Relay(BaseModel):
    """Relay Structs"""

    nickname: str
    fingerprint: str
    running: bool
    measured: bool
    asn: str = Field(alias="as")
    as_name: str = ""
    consensus_weight: int
    platform: str
    version: str
    contact: str = ""
    country: str
    country_name: str
    flags: list[str]
    first_seen: datetime
    last_seen: datetime
    last_changed: datetime = Field(alias="last_changed_address_or_port")
    bandwidth_rate: int
    bandwidth_burst: int
    observed_bandwidth: int
    advertised_bandwidth: int
    guard_probability: float = 0
    middle_probability: float = 0
    exit_probability: float = 0


class Details(BaseModel):
    """Details Structs"""

    version: str
    build_revision: str
    relays_published: datetime
    bridges_published: datetime
    relays: list[Relay]
