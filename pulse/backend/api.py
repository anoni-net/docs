"""
Anoni.net Tor-Watcher API

This module provides a FastAPI application for storing and visualizing
daily observational data about Tor network activity. It exposes endpoints
for generating Vega-Lite compatible graphics and accessing network statistics.

The API is designed to be consumed by frontend applications and supports
CORS for cross-origin requests.
"""

from __future__ import annotations

import logging
import os

import psycopg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import vega

logger = logging.getLogger(__name__)

TAG_META = [{"name": "vega", "description": "For Vega-Lite output graphics."}]


def _getenv(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if value is None:
        return None
    value = value.strip()
    return value or None


PG_CONN = _getenv("PG_CONN")

_cors_origins_raw = _getenv("CORS_ALLOW_ORIGINS", "")
CORS_ALLOW_ORIGINS = [o.strip() for o in (_cors_origins_raw or "").split(",") if o.strip()]

_cors_allow_credentials_raw = (_getenv("CORS_ALLOW_CREDENTIALS", "false") or "false").lower()
CORS_ALLOW_CREDENTIALS = _cors_allow_credentials_raw in {"1", "true", "yes", "on"}

app = FastAPI(
    title="Anoni.net Tor-Watcher API",
    description="Store daily observational datas.",
    version="2026.01.30",
    root_path="/api",
    docs_url="/readme",
    openapi_tags=TAG_META,
    contact={
        "name": "Anoni.net",
        "url": "https://anoni.net/",
        "email": "whisper@anoni.net",
    },
    license_info={
        "name": "GPL-3.0",
        "url": "https://github.com/anoni-net/docs/blob/main/asn_coverage/LICENSE",
    },
)

allow_origins = CORS_ALLOW_ORIGINS or ["*"]
# Wildcard origins cannot be used with credentials in browsers.
allow_credentials = CORS_ALLOW_CREDENTIALS if CORS_ALLOW_ORIGINS else False

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(vega.router)


@app.get("/")
async def main():
    """
    Health check and API information endpoint.

    Returns:
        dict: A greeting message and link to API documentation.
    """
    return {"Hello": "world", "docs": "/api/readme"}


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "version": app.version}


@app.get("/readyz")
async def readyz():
    if not PG_CONN:
        return {"status": "ok", "db": "skipped"}
    try:
        with psycopg.connect(PG_CONN, connect_timeout=3):
            pass
        return {"status": "ok", "db": "ok"}
    except Exception:
        logger.exception("DB readiness check failed")
        return {"status": "error", "db": "error"}
