"""Save Data into OONI"""

import csv
import logging
import sys

import arrow
import click

from pgdb import PGConn

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(asctime)s] {%(filename)s:%(lineno)d} %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(stream=sys.stdout),
    ],
)

logger = logging.getLogger("ooni-asn")


@click.group()
def cli():
    """cli for groups"""


@cli.command("asn", short_help="Load asn row csv file")
@click.option("--path", help="csv file path")
@click.option("--save", default=True, help="do save mode")
def save_from_asn_file(path, save=False):
    """Save data from asn file"""
    datas = []
    with open(path, "r", encoding="UTF-8") as files:
        datas.extend(list(csv.DictReader(files)))

    if save:
        sql = """INSERT INTO asn_count (country, created_at, asn, times
                    ) Values (%(country)s, %(created_at)s, %(asn)s, %(times)s)
                    ON CONFLICT (country, created_at, asn)
                    DO UPDATE SET times = %(times)s
                """
        with PGConn() as pg:
            for data in datas:
                save_data = {
                    "country": data["loc"],
                    "asn": data["asn"],
                    "times": data["count"],
                    "created_at": arrow.get(data["date"]).shift(hours=int(data["hour"])).datetime,
                }
                pg.cur.execute(sql, save_data)


if __name__ == "__main__":
    cli()
