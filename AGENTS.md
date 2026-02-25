# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This monorepo contains three sub-projects for the Anoni.net anonymous network community. See `CLAUDE.md` for full details.

| Sub-project | Path | Type |
|---|---|---|
| Docs | `docs/` | MkDocs Material static site (zh-TW, zh-CN, en) |
| Pulse | `pulse/` | Tor relay monitoring (FastAPI + PostgreSQL via Docker) |
| ASN Coverage | `asn_coverage/` | OONI observation CLI tool |

### Running services

- **Docs dev server**: `cd docs && uv run mkdocs serve` (default port 8000; use `--dev-addr 0.0.0.0:8001` if Pulse API also needs port 8000)
- **Pulse API (local dev)**: `cd pulse/backend && PG_CONN="postgresql://pulse:devpass123@127.0.0.1:5432/pulse" uv run fastapi dev api.py` (port 8000). Requires PostgreSQL — see below.
- **Pulse PostgreSQL**: `cd pulse && sudo docker compose up -d db db-init` starts the DB and runs schema migrations. Requires a `pulse/.env` file (copy from `.env.sample`; set `PG_DB=pulse`, `PG_USER=pulse`, `PG_PASSWORD=devpass123`, `PG_HOST=127.0.0.1:5432`, `API_HOST=127.0.0.1:8000`).
- **ASN Coverage CLI**: `cd asn_coverage && uv run python ooni.py --help`

### Gotchas

- Docker must be started manually: `sudo dockerd &>/tmp/dockerd.log &` — wait ~3 s before running `docker compose`.
- Docker requires `fuse-overlayfs` storage driver and `iptables-legacy` in this cloud VM environment. These are configured during initial setup.
- The MkDocs `social` plugin needs `libcairo2-dev` system package for Open Graph card generation. It is installed during initial setup.
- The Pulse API uses `root_path="/api"`, so all endpoints are prefixed with `/api` (e.g. `/api/healthz`, `/api/readme` for Swagger UI).
- Pulse backend `.env.example` is at `pulse/backend/.env.example`; the docker-compose `.env.sample` is at `pulse/.env.sample`. Both need to be copied and filled for their respective use cases.

### Lint / Test / Build

- **Lint (Pulse)**: `cd pulse/backend && uv run ruff check .` — configured in `pyproject.toml` (E, F, I rules, line-length 100).
- **Build (Docs)**: `cd docs && uv run mkdocs build` — builds the zh-TW docs to `site/`.
- No automated test suite exists in this repository.
