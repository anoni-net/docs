''' API '''
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import vega

TAG_META = [
    {'name': 'vega', 'description': 'For Vega-Lite output graphics.'}
]

app = FastAPI(
    title="Anoni.net Tor-Watcher API",
    description="Store daily observational datas.",
    version="2025.07.09",
    root_path="/api",
    docs_url="/readme",
    openapi_tags=TAG_META,
    contact={
        'name': 'Anoni.net',
        'url': 'https://anoni.net/',
        'email': 'whisper@anoni.net',
    },
    license_info={
        'name': 'GPL-3.0',
        'url': 'https://github.com/anoni-net/docs/blob/main/asn_coverage/LICENSE',
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(vega.router)


@app.get('/')
async def main():
    ''' main page '''
    return {'Hello': "world", "docs": "/api/readme"}
