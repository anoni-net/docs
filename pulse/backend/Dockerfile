FROM ghcr.io/astral-sh/uv:0.9.30 AS uvbin

FROM python:3.12.13-alpine3.23

WORKDIR /app
ADD pyproject.toml \
    uv.lock \
    structs.py \
    pgdb.py \
    tor_onionoo.py \
    tor.py \
    ./

# uv 從官方 image 複製進來，build 不再連 astral.sh。
#
# 原本是 curl -LsSf https://astral.sh/uv/install.sh | sh。pipeline 的 exit
# code 取自 sh，curl 解不到主機名時 sh 讀到空輸入照樣回 0，&& 鏈不會斷，
# build 一路走到 uv sync 才以 127 收場，訊息完全看不出真正的原因。
COPY --from=uvbin /uv /uvx /bin/

RUN \
    apk update && apk upgrade && \
    apk add --no-cache ca-certificates && \
    uv sync && \
    rm -rf /var/cache/apk/* /var/lib/apk/* /etc/apk/cache/*

RUN \
    echo "@reboot cd /app; uv run tor.py details" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=jp" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=kr" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=hk" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=sg" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=in" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=vn" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=de" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=us" >> /etc/crontabs/root && \
    echo "@reboot cd /app; uv run tor.py details --country=nl" >> /etc/crontabs/root

RUN \
    echo "5 * * * * cd /app; uv run tor.py details" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=jp" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=kr" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=hk" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=sg" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=in" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=vn" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=de" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=us" >> /etc/crontabs/root && \
    echo "5 * * * * cd /app; uv run tor.py details --country=nl" >> /etc/crontabs/root

ENTRYPOINT ["/bin/sh", "-c", "crond -f"]
