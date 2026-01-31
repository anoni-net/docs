"""
Anoni.net Tor-Watcher API

This module provides a FastAPI application for storing and visualizing
daily observational data about Tor network activity. It exposes endpoints
for generating Vega-Lite compatible graphics and accessing network statistics.

The API is designed to be consumed by frontend applications and supports
CORS for cross-origin requests.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import vega

TAG_META = [{"name": "vega", "description": "For Vega-Lite output graphics."}]

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

# Configure CORS middleware to allow cross-origin requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from all origins
    allow_credentials=True,
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
