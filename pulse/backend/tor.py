"""Fetch tor metrics

https://metrics.torproject.org/onionoo.html

"""

import logging
import sys

import click

from pgdb import PGConn
from tor_onionoo import TorOnionoo

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(asctime)s] {%(filename)s:%(lineno)d} %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(stream=sys.stdout),
    ],
)

logger = logging.getLogger("tor-details")


@click.group()
def cli():
    """cli for groups"""


@cli.command("details", short_help="Get tor nodes details")
@click.option("--country", default="tw", help="country code")
@click.option("--save", default=True, help="country code")
def details(country="tw", save=True):
    """Get details"""
    resp_details = TorOnionoo().get_details(country=country)

    bandwidth = 0
    for relay in resp_details.relays:
        bandwidth += relay.observed_bandwidth
        logger.info(relay)

    logger.info(
        f"bandwidth: {bandwidth / 1000 / 1000:.4f} MB/s ({bandwidth / 1000 / 1000 * 8:.4f} Mb/s)"
    )
    logger.info(f"relays: {len(resp_details.relays)}")

    if save:
        sql = """INSERT INTO relay_details (
                       created_at,
                       fingerprint,
                       nickname,
                       running,
                       measured,
                       asn,
                       as_name,
                       consensus_weight,
                       platform,
                       version,
                       country,
                       country_name,
                       contact,
                       flags,
                       first_seen,
                       last_seen,
                       last_changed,
                       bandwidth_rate,
                       bandwidth_burst,
                       observed_bandwidth,
                       advertised_bandwidth,
                       guard_probability,
                       middle_probability,
                       exit_probability
                    ) VALUES (
                       %(created_at)s,
                       %(fingerprint)s,
                       %(nickname)s,
                       %(running)s,
                       %(measured)s,
                       %(asn)s,
                       %(as_name)s,
                       %(consensus_weight)s,
                       %(platform)s,
                       %(version)s,
                       %(country)s,
                       %(country_name)s,
                       %(contact)s,
                       %(flags)s,
                       %(first_seen)s,
                       %(last_seen)s,
                       %(last_changed)s,
                       %(bandwidth_rate)s,
                       %(bandwidth_burst)s,
                       %(observed_bandwidth)s,
                       %(advertised_bandwidth)s,
                       %(guard_probability)s,
                       %(middle_probability)s,
                       %(exit_probability)s
                       )
                ON CONFLICT (created_at, fingerprint) DO NOTHING
            """
        logger.info("Going into connecting DB")
        with PGConn() as pg:
            for relay in resp_details.relays:
                relay_dict = relay.model_dump()
                relay_dict["created_at"] = resp_details.relays_published
                for key, value in relay_dict.items():
                    if isinstance(value, int):
                        print(key, value)

                logger.info(relay_dict)
                pg.cur.execute(sql, relay_dict)


if __name__ == "__main__":
    cli()
