FROM python:3.12.12-alpine3.23

WORKDIR /app
ADD pyproject.toml \
    uv.lock \
    structs.py \
    setting.py \
    pgdb.py \
    tor_onionoo.py \
    tor.py \
    ./

ENV PATH="/root/.local/bin:${PATH}"

RUN \
    apk update && apk upgrade && \
    apk add --no-cache ca-certificates && \
    apk add --no-cache --virtual .build-deps curl && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    uv sync && \
    apk del .build-deps && \
    cd ~/.cache/ && \
    rm -rf /var/cache/apk/* /var/lib/apk/* /etc/apk/cache/*

RUN \
    echo "@reboot cd /app; uv run tor.py details" >> /etc/crontabs/root
RUN \
    echo "@reboot cd /app; uv run tor.py details --country=jp" >> /etc/crontabs/root
RUN \
    echo "@reboot cd /app; uv run tor.py details --country=kr" >> /etc/crontabs/root
RUN \
    echo "@reboot cd /app; uv run tor.py details --country=hk" >> /etc/crontabs/root

RUN \
    echo "5 * * * * cd /app; uv run tor.py details" >> /etc/crontabs/root
RUN \
    echo "5 * * * * cd /app; uv run tor.py details --country=jp" >> /etc/crontabs/root
RUN \
    echo "5 * * * * cd /app; uv run tor.py details --country=kr" >> /etc/crontabs/root
RUN \
    echo "5 * * * * cd /app; uv run tor.py details --country=hk" >> /etc/crontabs/root

ENTRYPOINT ["/bin/sh", "-c", "crond -f"]
