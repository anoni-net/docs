""" Main """
import csv
import re

import arrow
import click
from requests import Response, Session


class RIPEData(Session):
    ''' Fetch RIPE Data '''

    def __init__(self) -> None:
        super().__init__()
        self.url = 'https://ftp.ripe.net'

    def fetch_asn(self) -> Response:
        ''' Fetch ASN name '''
        return super().get(self.url+'/ripe/asnames/asn.txt')

    def get_asn_name(self):
        ''' Get and Process ASN Data '''
        asn_data = self.fetch_asn()
        pattens = (
            re.compile(
                r"(?P<no>\d+) (?P<reserved>-Reserved AS-), (?P<location>[A-Z]{2})"),
            re.compile(
                r"(?P<no>\d+) (?P<org_id>[\w\-]+)? ?(?P<registrar>.+?)?, (?P<location>[A-Z]{2})\s*$"),
            re.compile(r"(?P<no>23456) (?P<name>.+)"),
            re.compile(r"(?P<no>\d+) , "),
        )

        result = []
        for raw in asn_data.text.split('\n'):
            if not raw:
                continue

            for splitor in pattens:
                matched = splitor.match(raw)
                if matched:
                    base = {'no': 0, 'location': '',
                            'org_id': '', 'registrar': '', 'reserved': '', 'name': ''}
                    base.update(matched.groupdict())
                    result.append(base)
                    break
            else:
                raise NotImplementedError(f'`{raw}`')
        return result


@click.group()
def cli():
    ''' cli for groups '''


@cli.command('list', short_help='list ASNs')
@click.option('--loc', help='location, two-letters')
def asn_list(loc=None):
    ''' List ASNs'''
    num = 1
    for asn in RIPEData().get_asn_name():
        if loc is None:
            num += 1
            print(num, asn)
            continue

        if asn['location'] == loc:
            num += 1
            print(num, asn)


@cli.command('save', short_help='save ASNs lists')
@click.option('--loc', help='location, two-letters')
def save_to_csv(loc=None):
    ''' Save datas to CSV '''
    with open(f'./asns_{arrow.utcnow().format("YYYYMMDDTHH")}.csv', 'w+', encoding='UTF8') as csv_files:
        csv_writer = csv.DictWriter(csv_files,
                                    fieldnames=(
                                        'no', 'location', 'org_id', 'registrar', 'reserved', 'name'),
                                    quoting=csv.QUOTE_MINIMAL)
        csv_writer.writeheader()

        for asn in RIPEData().get_asn_name():
            if loc is None:
                csv_writer.writerow(asn)
                continue

            if asn['location'] == loc:
                csv_writer.writerow(asn)


if __name__ == '__main__':
    cli()
