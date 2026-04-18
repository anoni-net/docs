-- Migration 001: Add index on (country, created_at) for vega query performance
-- Safe to run on a live DB: CONCURRENTLY does not lock the table.
-- NOTE: Cannot run inside a transaction block — execute without BEGIN/COMMIT.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relay_details_country_created
    ON relay_details (country, date(created_at) DESC);
