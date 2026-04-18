-- Migration 003: Fix contact column type
-- Tor relay contact strings can exceed 400 characters; use unbounded text.

ALTER TABLE relay_details ALTER COLUMN contact TYPE text;
