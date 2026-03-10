# AGENTS.md

## Cursor Cloud specific instructions

This monorepo has three subprojects (`docs/`, `pulse/`, `asn_coverage/`), each with its own `pyproject.toml` + `uv.lock`. See `CLAUDE.md` for full development docs.

### Docs subproject (primary dev scope)

Run the MkDocs dev server from `docs/`:

```bash
cd docs
uv run mkdocs serve          # serves zh-TW on http://127.0.0.1:8000
uv run mkdocs build --clean  # build validation
```

**Caveats:**
- **MkDocs startup time**: The dev server downloads external assets (Vega libs, emoji SVGs, images) on first build, which can take 20-30 seconds. Wait for the "Serving on" log line before testing.
- **Port conflict with Pulse**: If Pulse API is also running, use `-a 127.0.0.1:8001` to avoid the default port 8000 clash.
- **No automated test suites**: Validation is done via `mkdocs build`. There is no pytest or other test framework.
- **System imaging libs**: `mkdocs-material[imaging]` (social card generation) requires `libcairo2-dev`, `libpango1.0-dev`, `libgdk-pixbuf2.0-dev`, `libffi-dev` — these are pre-installed in the VM snapshot.

### Other subprojects (for reference)

- **Pulse** (`pulse/`): FastAPI + PostgreSQL via Docker Compose. See `CLAUDE.md` § Pulse for details. Needs Docker with `fuse-overlayfs` in nested environments.
- **ASN Coverage** (`asn_coverage/`): CLI tool. `uv run python ooni.py --help`. Needs internet for S3 access.
