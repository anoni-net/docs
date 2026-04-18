CREATE TABLE IF NOT EXISTS asn_count (
    country varchar(10),
    created_at timestamp with time zone,
    asn varchar(10),
    times smallint,
    UNIQUE (country, created_at, asn)
)
