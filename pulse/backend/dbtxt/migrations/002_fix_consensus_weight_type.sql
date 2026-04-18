-- Migration 002: Fix consensus_weight column type
-- smallint range (-32768~32767) is insufficient for high-bandwidth Tor relays.

ALTER TABLE relay_details ALTER COLUMN consensus_weight TYPE integer;
