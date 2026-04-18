CREATE TABLE IF NOT EXISTS relay_details (
    created_at timestamp with time zone,
    fingerprint varchar(40),
    nickname varchar(20),
    running boolean,
    measured boolean,
    asn varchar(10),
    as_name varchar(100),
    consensus_weight integer,
    platform varchar(100),
    version varchar(20),
    country varchar(10),
    country_name varchar(40),
    contact varchar(400),
    flags varchar(20)[],
    first_seen timestamp with time zone,
    last_seen timestamp with time zone,
    last_changed timestamp with time zone,
    bandwidth_rate bigint,
    bandwidth_burst bigint,
    observed_bandwidth bigint,
    advertised_bandwidth bigint,
    guard_probability NUMERIC(7, 6),
    middle_probability NUMERIC(7, 6),
    exit_probability NUMERIC(7, 6),
    UNIQUE (created_at, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_relay_details_country_created
    ON relay_details (country, date(created_at) DESC);
