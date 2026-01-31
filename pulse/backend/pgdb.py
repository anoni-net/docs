"""PostgreSQL helpers."""

from __future__ import annotations

import logging
import os
from typing import Self

import psycopg

logger = logging.getLogger(__name__)


def _getenv(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if value is None:
        return None
    value = value.strip()
    return value or None


PG_CONN = _getenv("PG_CONN")


class PGConn:
    """PG DB Conn"""

    def __init__(self) -> None:
        if not PG_CONN:
            raise RuntimeError(
                "PG connection string is not configured. "
                'Set environment variable "PG_CONN" (see .env.example).'
            )

        self.conn = psycopg.connect(PG_CONN)
        self.cur = self.conn.cursor()

    def __enter__(self) -> Self:
        return self

    def __exit__(self, exc_type, exc_value, exc_traceback) -> None:
        try:
            if exc_type is None:
                self.conn.commit()
            else:
                self.conn.rollback()
                logger.error(
                    "DB transaction rolled back due to error",
                    exc_info=(exc_type, exc_value, exc_traceback),
                )
        finally:
            try:
                self.cur.close()
            finally:
                self.conn.close()

    def save_one(self) -> None:
        """save one"""
        self.cur.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (121, "asdds"))

    def show_all(self) -> None:
        """Show All"""
        self.cur.execute("SELECT * FROM test")

        for row in self.cur.fetchall():
            logger.info("row=%s", row)


def create_table_relay_details():
    with PGConn() as pg:
        with open("./dbtxt/relay_details.sql", "r", encoding="utf-8") as files:
            sql = files.read()
            pg.cur.execute(sql)


def create_table_asn_count():
    with PGConn() as pg:
        with open("./dbtxt/asn_count.sql", "r", encoding="utf-8") as files:
            sql = files.read()
            pg.cur.execute(sql)


if __name__ == "__main__":
    # with PGConn() as pg:
    #    pg.save_one()
    #    pg.show_all()

    # create_table_relay_details()
    create_table_asn_count()
