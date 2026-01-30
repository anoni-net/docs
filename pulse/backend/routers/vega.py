""" Route Vega-Lite """
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


class Country(Enum):
    """Country enum for Tor relay queries"""
    tw = 'tw'
    jp = 'jp'
    kr = 'kr'
    hk = 'hk'


class NodeType(Enum):
    """Node type enum for Tor relays"""
    guard = 'guard'
    middle = 'middle'
    exit = 'exit'


class RelaysRunning(BaseModel):
    """Tor relays running status data"""
    created_at: datetime
    count: int
    running: bool = Field(default=False)
    observed_bandwidth: float = Field(default=0)


class RelaysVersion(BaseModel):
    """Tor relays version data"""
    created_at: datetime
    count: int
    version: str = Field(default="")


class RelaysASN(BaseModel):
    """Tor relays ASN data"""
    created_at: datetime
    count: int
    asn: str


class RelaysNodeType(BaseModel):
    """Tor relays node type data"""
    created_at: datetime
    count: int
    node: NodeType


class RelaysFlags(BaseModel):
    """Tor relays flags data"""
    created_at: datetime
    count: int
    flag: str


@router.get('/tor/relays/running')
async def tor_relays_running(country: Country) -> list[RelaysRunning]:
    ''' Get Tor Relays Running by country'''
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
                                      ;''', (country, )):
            datas.append(RelaysRunning(
                created_at=row[0], count=row[1], running=row[2], observed_bandwidth=row[3]))

    return datas


@router.get('/tor/relays/version')
async def tor_relays_version(country: Country) -> list[RelaysVersion]:
    '''Get Tor Relays Version by country'''
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''
                                       select date(created_at) as dt,
                                              count(DISTINCT fingerprint),
                                              version
                                       from relay_details
                                       where country=%s
                                       group by dt, version
                                       order by dt, version desc;
                                      ;''', (country, )):
            datas.append(RelaysVersion(
                created_at=row[0], count=row[1], version=row[2]))

    return datas


@router.get('/tor/relays/asn')
async def tor_relays_asn(country: Country) -> list[RelaysASN]:
    '''Get Tor Relays Version by country'''
    datas = []
    with PGConn() as pg_conn:
        for row in pg_conn.cur.execute('''
                                       select date(created_at) as dt,
                                              count(DISTINCT fingerprint),
                                              asn
                                       from relay_details
                                       where country=%s
                                       group by dt, asn
                                       order by dt, asn;
                                      ;''', (country, )):
            datas.append(
                RelaysASN(created_at=row[0], count=row[1], asn=row[2]))

    return datas


@router.get('/tor/relays/node_type')
async def tor_relays_node_type(country: Country) -> list[RelaysNodeType]:
    '''Get Tor Relays Node Type by country'''
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
                    dt;
            ;''', (country, )):
            datas.append(RelaysNodeType(
                created_at=row[0], count=row[1], node=NodeType.guard))
            datas.append(RelaysNodeType(
                created_at=row[0], count=row[2], node=NodeType.middle))
            datas.append(RelaysNodeType(
                created_at=row[0], count=row[3], node=NodeType.exit))

    return datas


@router.get('/tor/relays/flags')
async def tor_relays_flags(country: Country) -> list[RelaysFlags]:
    '''Get Tor Relays Flags by country'''
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
                ele, dt;''', (country, )):
            datas.append(RelaysFlags(
                created_at=row[0], count=row[2], flag=row[1]))

    return datas
