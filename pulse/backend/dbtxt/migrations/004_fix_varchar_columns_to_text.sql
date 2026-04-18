-- Migration 004: Convert unbounded string columns from varchar to text
-- Keeps fingerprint/asn/country/flags which are bounded by Tor spec.

ALTER TABLE relay_details
    ALTER COLUMN nickname TYPE text,
    ALTER COLUMN as_name TYPE text,
    ALTER COLUMN platform TYPE text,
    ALTER COLUMN version TYPE text,
    ALTER COLUMN country_name TYPE text;
