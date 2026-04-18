CREATE TABLE IF NOT EXISTS relay_details (
    created_at timestamp with time zone,
    fingerprint varchar(40),
    nickname text,
    running boolean,
    measured boolean,
    asn varchar(10),
    as_name text,
    consensus_weight integer,
    platform text,
    version text,
    country varchar(10),
    country_name text,
    contact text,
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
