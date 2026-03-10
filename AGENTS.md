# AGENTS.md

## Cursor Cloud specific instructions

This monorepo has three subprojects, each with its own `pyproject.toml` + `uv.lock`. See `CLAUDE.md` for full development docs.

### Services overview

| Service | Dir | Dev command | Port |
|---|---|---|---|
| Docs (MkDocs) | `docs/` | `uv run mkdocs serve` | 8000 (default) |
| Pulse API (FastAPI) | `pulse/` | `docker compose up -d` (full stack) or `uv run fastapi dev api.py` in `pulse/backend/` (API only) | 8080 (Docker) or 8000 (local) |
| ASN Coverage CLI | `asn_coverage/` | `uv run python ooni.py --help` | N/A |

### Caveats

- **Docker for Pulse**: The Pulse stack (PostgreSQL + API + cron backend) runs via Docker Compose. In a nested container environment (like this VM), Docker needs `fuse-overlayfs` storage driver and `iptables-legacy`. The Docker daemon must be started with `sudo dockerd` before running `docker compose up -d` in `pulse/`.
- **Pulse `.env`**: Copy `pulse/.env.sample` to `pulse/.env` and fill in values before running Docker Compose. Example dev values: `PG_HOST="127.0.0.1:5432"`, `API_HOST="127.0.0.1:8080"`, `PG_DB="pulse"`, `PG_USER="pulse"`, `PG_PASSWORD="pulsedev123"`.
- **MkDocs port conflict**: Both docs and pulse API default to port 8000. Use `-a 127.0.0.1:8001` with `mkdocs serve` when running both simultaneously, or use the Docker Compose mapping (port 8080) for Pulse.
- **MkDocs startup time**: The docs dev server downloads external assets (Vega libs, emoji SVGs, images) on first build, which can take 20-30 seconds. Wait for the "Serving on" log line before testing.
- **Lint**: Only `pulse/backend/` has ruff configured. Run `uv run ruff check .` from `pulse/backend/`.
- **No automated test suites**: The repo does not have pytest or other test frameworks configured. Validation is done via `ruff check` (lint) and `mkdocs build` (docs build).
- **ASN Coverage needs internet**: The `asn_coverage/` CLI downloads from OONI's public S3 bucket (`ooni-data-eu-fra`), requiring internet access. No AWS credentials needed (unsigned access).
