"""
Vega-Lite Router for Tor Relay Statistics

This module provides FastAPI endpoints that return Tor relay observational data
formatted for visualization with Vega-Lite. It queries the PostgreSQL database
for relay statistics filtered by country and returns time-series data across
multiple dimensions: running status, version, ASN, node type, and flags.
"""
from datetime import datetime
from enum import Enum

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from pgdb import PGConn

router = APIRouter(
    prefix='/vega',
    tags=['vega', ],
    responses={status.HTTP_404_NOT_FOUND: {'description': 'Not found'}},
)


class Country(str, Enum):
    """
    Country enum for Tor relay queries.

    Supported countries:
    - TW: Taiwan
    - JP: Japan
    - KR: South Korea
    - HK: Hong Kong
    """
    TW = 'tw'
    JP = 'jp'
    KR = 'kr'
    HK = 'hk'


class NodeType(Enum):
    """
    Node type enum for Tor relays.

    Relay roles in Tor network:
    - GUARD: Entry point nodes
    - MIDDLE: Intermediate relay nodes
    - EXIT: Exit nodes that connect to destination servers
    """
    GUARD = 'guard'
    MIDDLE = 'middle'
    EXIT = 'exit'


class RelaysRunning(BaseModel):
    """
    Tor relays running status data.

    Attributes:
        created_at: Date of observation
        count: Number of distinct relays
        running: Whether relays are currently active
        observed_bandwidth: Average bandwidth in bytes per second
    """
    created_at: datetime
    count: int
    running: bool = Field(default=False)
    observed_bandwidth: float = Field(default=0)


class RelaysVersion(BaseModel):
    """
    Tor relays version data.

    Attributes:
        created_at: Date of observation
        count: Number of distinct relays
        version: Tor software version
    """
    created_at: datetime
    count: int
    version: str = Field(default="")


class RelaysASN(BaseModel):
    """
    Tor relays ASN data.

    Attributes:
        created_at: Date of observation
        count: Number of distinct relays
        asn: Autonomous System Number
    """
    created_at: datetime
    count: int
    asn: str


class RelaysNodeType(BaseModel):
    """
    Tor relays node type data.

    Attributes:
        created_at: Date of observation
        count: Number of relays with this node type
        node: Type of relay node (guard, middle, or exit)
    """
    created_at: datetime
    count: int
    node: NodeType


class RelaysFlags(BaseModel):
    """
    Tor relays flags data.

    Attributes:
        created_at: Date of observation
        count: Number of relays with this flag
        flag: Relay flag designation (e.g., "Fast", "Stable", "Valid")
    """
    created_at: datetime
    count: int
    flag: str


@router.get('/tor/relays/running')
async def tor_relays_running(country: Country, limit: int = 45) -> list[RelaysRunning]:
    """
    Get Tor relays running status by country.

    Returns daily counts of running vs offline relays for a specific country,
    along with average observed bandwidth.

    Args:
        country: Country code (TW, JP, KR, HK)
        limit: Maximum number of records to return (default: 45)

    Returns:
        List of RelaysRunning objects with daily statistics
    """
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''select date(created_at) as dt,
                                                 count(DISTINCT fingerprint),
                                                 running,
                                                 round(sum(observed_bandwidth)/count(date(created_at))*count(DISTINCT fingerprint), 4)
                                       from relay_details
                                       where country=%s
                                       group by dt, running
                                       order by dt, running
                                       limit %s
                                      ;''', (country, limit)):
            datas.append(RelaysRunning(
                created_at=row[0], count=row[1], running=row[2], observed_bandwidth=row[3]))

    return datas


@router.get('/tor/relays/version')
async def tor_relays_version(country: Country, limit: int = 45) -> list[RelaysVersion]:
    """
    Get Tor relays by software version by country.

    Returns daily counts of relays grouped by Tor software version.

    Args:
        country: Country code (TW, JP, KR, HK)
        limit: Maximum number of records to return (default: 45)

    Returns:
        List of RelaysVersion objects with version distribution
    """
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''
                                       select date(created_at) as dt,
                                              count(DISTINCT fingerprint),
                                              version
                                       from relay_details
                                       where country=%s
                                       group by dt, version
                                       order by dt, version desc
                                       limit %s
                                      ;''', (country, limit)):
            datas.append(RelaysVersion(
                created_at=row[0], count=row[1], version=row[2]))

    return datas


@router.get('/tor/relays/asn')
async def tor_relays_asn(country: Country, limit: int = 45) -> list[RelaysASN]:
    """
    Get Tor relays by Autonomous System Number (ASN) by country.

    Returns daily counts of relays grouped by their hosting ASN.

    Args:
        country: Country code (TW, JP, KR, HK)
        limit: Maximum number of records to return (default: 45)

    Returns:
        List of RelaysASN objects with ASN distribution
    """
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''
                                       select date(created_at) as dt,
                                              count(DISTINCT fingerprint),
                                              asn
                                       from relay_details
                                       where country=%s
                                       group by dt, asn
                                       order by dt, asn
                                       limit %s
                                      ;''', (country, limit)):
            datas.append(
                RelaysASN(created_at=row[0], count=row[1], asn=row[2]))

    return datas


@router.get('/tor/relays/node_type')
async def tor_relays_node_type(country: Country, limit: int = 45) -> list[RelaysNodeType]:
    """
    Get Tor relays by node type (guard, middle, exit) by country.

    Returns daily counts of relays categorized by their Tor network role.
    Only includes running relays with non-zero probability for their role.

    Args:
        country: Country code (TW, JP, KR, HK)
        limit: Maximum number of records to return (default: 45)

    Returns:
        List of RelaysNodeType objects with role distribution
    """
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''
            WITH by_fingerprint AS (
                SELECT
                    date(created_at) AS dt,
                    fingerprint,
                    (CASE WHEN guard_probability > 0 THEN 1 ELSE 0 END) AS guard,
                    (CASE WHEN middle_probability > 0 THEN 1 ELSE 0 END) AS middle,
                    (CASE WHEN exit_probability > 0 THEN 1 ELSE 0 END) AS exit
                FROM
                    relay_details
                WHERE
                    country = %s AND running = true
                GROUP BY
                    dt, fingerprint, guard, middle, exit
                )
                SELECT
                    dt,
                    SUM(guard) AS guard,
                    SUM(middle) AS middle,
                    SUM(exit) AS exit
                FROM
                    by_fingerprint
                GROUP BY
                    dt
                ORDER BY
                    dt
                LIMIT %s
            ;''', (country, limit)):
            datas.append(RelaysNodeType(
                created_at=row[0], count=row[1], node=NodeType.GUARD))
            datas.append(RelaysNodeType(
                created_at=row[0], count=row[2], node=NodeType.MIDDLE))
            datas.append(RelaysNodeType(
                created_at=row[0], count=row[3], node=NodeType.EXIT))

    return datas


@router.get('/tor/relays/flags')
async def tor_relays_flags(country: Country, limit: int = 45) -> list[RelaysFlags]:
    """
    Get Tor relays by flags by country.

    Returns daily counts of relays grouped by their assigned flags
    (e.g., Fast, Stable, Valid, Guard, Exit). Only includes running relays.

    Args:
        country: Country code (TW, JP, KR, HK)
        limit: Maximum number of records to return (default: 45)

    Returns:
        List of RelaysFlags objects with flag distribution
    """
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''
            WITH by_flags AS (
                SELECT
                    date(created_at) AS dt, ele, fingerprint
                FROM
                    relay_details, UNNEST(flags) AS ele
                WHERE
                    country = %s AND running = true
                GROUP BY
                    dt, ele, fingerprint
                ORDER BY
                    dt, ele
            )
            SELECT
                dt, ele, COUNT(*)
            FROM
                by_flags
            GROUP BY
                dt, ele
            ORDER BY
                ele, dt
            LIMIT %s
                                       ;''', (country, limit)):
            datas.append(RelaysFlags(
                created_at=row[0], count=row[2], flag=row[1]))

    return datas
