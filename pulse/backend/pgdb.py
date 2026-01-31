"""PostgreSQL"""

from typing import Self

import psycopg

import setting


class PGConn:
    """PG DB Conn"""

    def __init__(self) -> None:
        self.conn = psycopg.connect(setting.PG_CONN, autocommit=True)
        self.cur = self.conn.cursor()

    def __enter__(self) -> Self:
        return self

    def __exit__(self, exc_type, exc_value, exc_traceback) -> None:
        self.conn.commit()
        self.conn.close()
        print("Connect Closed!", exc_type, exc_value, exc_traceback)

    def save_one(self) -> None:
        """save one"""
        self.cur.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (121, "asdds"))

    def show_all(self) -> None:
        """Show All"""
        self.cur.execute("SELECT * FROM test")

        for row in self.cur.fetchall():
            print(row)


def create_table_relay_details():
    with PGConn() as pg:
        with open("./dbtxt/relay_details.sql", "r+") as files:
            sql = files.read()
            pg.cur.execute(sql)


def create_table_asn_count():
    with PGConn() as pg:
        with open("./dbtxt/asn_count.sql", "r+") as files:
            sql = files.read()
            pg.cur.execute(sql)


if __name__ == "__main__":
    # with PGConn() as pg:
    #    pg.save_one()
    #    pg.show_all()

    # create_table_relay_details()
    create_table_asn_count()
