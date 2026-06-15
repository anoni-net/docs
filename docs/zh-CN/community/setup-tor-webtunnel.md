---
title: 如何搭建 Tor WebTunnel 桥接
description: 架设 Tor WebTunnel 桥接，把 Tor 流量伪装成一般 HTTPS 网页连接，协助伊朗、中国这类重度审查地区的使用者连上 Tor。含 VPS、域名、TLS、nginx 反向代理、Docker 的完整步骤与维运指引。
icon: material/tunnel-outline
---

# :material-tunnel-outline: 如何搭建 Tor WebTunnel 桥接

WebTunnel 是 Tor 目前抗审查能力最强的桥接方式之一。它把 Tor 流量包进一个正常的 HTTPS 连接里，流量形态与一般 HTTPS 浏览近似，难以被深度封包检测（DPI）单独挑出来。当审查系统用 DPI 封锁 obfs4 这类「看起来不像 HTTPS」的协定时，WebTunnel 通常仍能穿过去。

这份文件带你在一台小型 VPS 上，用官方 Docker 方式架起一个 WebTunnel 桥接，从域名、TLS 证书、nginx 反向代理到上线验证，并附上监控、伪装页、防火墙与事件处置的维运做法。

!!! info "先理解桥接与中继的差别"

    如果你对 Tor 还不熟，可以先看「[什么是 Tor？](../tools/what-is-tor.md)」。

    Tor 的对外贡献有几种，门槛与抗审查强度各不相同：

    - [Tor Snowflake](../tools/tor-snowflake.md)：开浏览器分页就能跑的临时桥接，门槛最低，但走 WebRTC，握手特征仍可能被指纹识别，严格审查地区（如中国）已有封锁记录。
    - **WebTunnel（本文）**：需要 VPS、域名与 TLS，伪装成 HTTPS，重度审查地区最难封锁。
    - [Tor Relay](./setup-tor-relay.md)：中继节点，负责 Tor 网络的带宽与节点多元性，不属于桥接。

    桥接（Bridge）跟中继一样不直接连向使用者要去的目的地，对外网站看到的是 Tor 出口节点，不是你的服务器，因此营运桥接的法律风险跟入口、中间节点同级，远低于出口节点。

## 为什么需要更多 WebTunnel

- **对外连接受审查程度低、带宽充足的地方是合适的桥接来源地**。
- **IP 与 ASN 多元性有价值**：审查者会去封锁已知的桥接 IP，分散在不同国家、不同网络供应商的桥接越多，当地使用者能用的入口就越多。
- **比架中继省资源**：一台 512MB 到 1GB RAM 的 VPS 就够跑，成本与运维负担比 Tor Relay 低。
- **回应真实需求**：2026 年伊朗在军事行动期间多次大规模断网，第二阶段持续近三个月（2 月底至 5 月底）。重新开放后，社区自架的 WebTunnel 观察到流量明显涌入，记录在 [伊朗断网后：流量涌入社区的 WebTunnel](../blog/posts/iran-blackout-webtunnel.md)。在这类极端审查下，这种伪装成 HTTPS 的桥接，往往是当地人能否连上 Tor 的关键。

## 开始前要准备的东西

- 一台 VPS（Debian 或 Ubuntu，512MB RAM 以上，建议 1GB 让 Tor 进程有余裕）。
- 一个域名或子域名，并能编辑它的 DNS。
- 对外开放 443 连接埠（WebTunnel 走标准 HTTPS 埠才像正常网站）。
- 一个联络用 email，会公开在桥接的 `ContactInfo`。

!!! tip "域名与营运隐私"

    WebTunnel 的伪装效果靠「这个域名看起来就是个普通网站」。建议：

    - 用一个不会一眼看出是 Tor 桥接的域名或子域名。
    - 根路径（`/`）放一个无害的页面（个人首页、放置页、简单部落格都可以），让扫描者看到的是一个普通网站。
    - 在低风险环境，用既有域名的子域名通常没问题。若你想要更高的营运隐私，再考虑用匿名注册的独立域名。

整个流程分两部分：先把域名、TLS、反向代理这层架好（让服务器看起来像个正常 HTTPS 网站），再用 Docker 把桥接跑起来。

## 第一部分：域名、TLS 与 nginx 反向代理

### 设定 DNS

在你的域名 DNS 加一笔 A record，把域名（或子域名）指向 VPS 的 IP。例如 `bridge.example.com` 指到服务器的对外 IP。等 DNS 生效后再进行下一步。

### 取得 TLS 证书

WebTunnel 需要一张浏览器信任的 TLS 证书，让连接看起来就是连到一个真的 HTTPS 网站。用 Let's Encrypt 最方便。

```bash
apt update
apt install certbot python3-certbot-nginx
certbot --nginx -d bridge.example.com
```

certbot 套件会装好 systemd timer 自动续期，可以这样确认：

```bash
systemctl status certbot.timer
```

!!! info "其他取得证书的方式"

    也可以用 `acme.sh` 之类的 ACME 客户端签证书，做法见官方文件：[Tor Project | WebTunnel Bridge](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}。

### 设定 nginx 反向代理

WebTunnel 桥接会在本机 `127.0.0.1:15000` 监听，由 nginx 处理对外的 HTTPS，再把某个「秘密路径」反向代理到桥接。请先想一个随机字串当作这个秘密路径，下面范例用 `$PATH` 代表。

在既有的 vhost（或新建一个）里加上这段 `location` 区块，注意要带 WebSocket 标头：

```nginx
location = /$PATH {
    proxy_pass http://127.0.0.1:15000;
    proxy_http_version 1.1;
    ### WebSocket 标头 ###
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ### Proxy 标头 ###
    proxy_set_header Accept-Encoding "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Front-End-Https on;
    proxy_redirect off;
    access_log off;
    error_log /dev/null;
}
```

!!! tip "进阶：两个官方没提的反向代理加固"

    上面的设定能正常运作。有两个官方文件没写的小调整，能让秘密路径更难被探测、长连线更稳定，实务上很值得加。

    **把秘密路径藏得更彻底**

    预设情况下，对秘密路径送一个没有 WebSocket 握手的普通请求，会被转发给桥接，而桥接的回应可能跟站上其他路径长得不一样，反而暴露出这个路径的存在。加一行，让没有 Upgrade 标头的请求一律回 404，这个路径就跟站上任何不存在的网址没有两样：

    ```nginx
    location = /$PATH {
        # 只有真正的 WebTunnel 握手能通过，普通探测一律回 404
        if ($http_upgrade = "") { return 404; }
        proxy_pass http://127.0.0.1:15000;
        # ……其余设定同上
    }
    ```

    真正的 WebTunnel 连线一定带 Upgrade 标头，这行不会挡到正常的桥接客户端。

    **别让 nginx 切断长连线**

    nginx 的 `proxy_read_timeout` 预设只有 60 秒，连线超过 60 秒没有资料流动就会被切掉，对长时间挂着的 Tor 电路会造成莫名的断线。把 `location` 区块里的逾时拉长，并开启 TCP keepalive：

    ```nginx
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_socket_keepalive on;
    ```

根路径 `location /` 维持回传一个正常网页，让服务器整体看起来像普通网站，只有知道秘密路径的 Tor 客户端会走到桥接。改完测试设定并重新载入：

```bash
nginx -t && systemctl reload nginx
```

## 第二部分：用 Docker 跑 WebTunnel 桥接

### 安装 Docker

```bash
apt install curl sudo
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh
```

### 建立 `.env` 设定档

把 `URL` 换成你的域名加上秘密路径（对齐第一部分 nginx 设的 `$PATH`），`OPERATOR_EMAIL` 换成你的联络信箱，然后执行：

```bash
truncate --size 0 .env
echo "URL=https://bridge.example.com/your-secret-path" >> .env
echo "OPERATOR_EMAIL=your@email.org" >> .env
echo "BRIDGE_NICKNAME=WTBr$(cat /dev/urandom | tr -cd 'qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAQWERTUIOP0987654321'|head -c 10)" >> .env
echo "GENEDORPORT=4$(cat /dev/urandom | tr -cd '0987654321'|head -c 4)" >> .env
```

### 下载 docker-compose 设定

```bash
curl https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel/-/raw/main/release/container/docker-compose.yml?inline=false > docker-compose.yml
```

这份 compose 预设开启自动更新，桥接会自己更新到新版，不需要额外动作。接着启动：

```bash
docker compose up -d
```

### 取得桥接行并验证

```bash
docker compose exec webtunnel-bridge get-bridge-line.sh
```

把输出的 bridge line 贴进 Tor Browser 的桥接设定就能测试是否可用。

!!! warning "指令失效时的替代写法"

    在较新版本的容器上，容器名称可能改成 `webtunnelBridge`，原指令会失败。改用：

    ```bash
    docker exec webtunnelBridge get-bridge-line.sh
    ```

桥接行里的 IP（特别是 IPv6）是随机产生的占位符，不会真的被使用，这是 pluggable transport 规格要求那个位置要有 IP 而已。实际连接是靠你的域名与秘密路径。预设情况下，你的桥接会透过 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 自动分发给需要的使用者。

## 进阶维运

### 防火墙

只开必要的连接埠。WebTunnel 对外只需要 443（HTTPS），SSH 视管理需求保留。桥接监听的 `15000` 绑在 `127.0.0.1`，不要对外开放。

```bash
ufw allow 443/tcp
ufw allow OpenSSH
ufw enable
ufw status
```

### 伪装页设计

根路径那个「无害页面」是伪装的一部分。建议放一个有实际内容、不会引人怀疑的静态页（个人作品集、技术笔记、放置中页面都行），避免空白页或预设的 nginx 欢迎页，那反而显眼。

### 监控与健康检查

- 看容器状态与日志：

    ```bash
    docker compose ps
    docker compose logs -f
    ```

- 确认 TLS 证书还有效、续期正常：`systemctl status certbot.timer`。
- 桥接上线数小时后，可在 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 流程或 Tor Browser 实测它是否被分发、是否可连。

### 软件更新

compose 预设自动更新桥接本体。系统层的 Docker、nginx、certbot 仍要定期 `apt update && apt upgrade`，TLS 证书续期则交给 certbot timer。

### 事件处置 runbook

- **桥接连不上**：先看 `docker compose logs`，再确认 nginx 反向代理的秘密路径与 `.env` 的 `URL` 路径一致、TLS 证书未过期、443 有开。
- **证书过期**：`certbot renew` 后 `systemctl reload nginx`。
- **收到滥用或法律询问**：桥接属于入口、中间性质，不直接连向目的地。可向对方说明 Tor 桥接的角色，并参考 [EFF Tor 中继营运者法律 FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}。
- **要下线**：`docker compose down` 停止桥接，移除 nginx 的 `location` 区块并重载。

## 常见问题

??? question "WebTunnel 跟 Snowflake、obfs4 有什么不同？"

    三者都是帮人绕过审查连上 Tor 的桥接。Snowflake 走 WebRTC（浏览器做视讯通话用的那种即时连接技术）、开浏览器就能跑，但易被侦测。obfs4 把流量变成随机噪声，但 DPI 仍可能辨识出它不像 HTTPS 而封锁。WebTunnel 把流量包进真正的 HTTPS 连接，审查者要封它就得连带封掉大量正常网站，因此在中国、伊朗、哈萨克这类 DPI 严格的地方最有效。

??? question "营运 WebTunnel 桥接合法吗？会被找上门吗？"

    桥接跟入口、中间节点一样不连向最终目的地，对外网站看到的是 Tor 出口节点，不是你的服务器。在网络相对自由的地方，目前允许营运这类节点，风险远低于出口节点。若收到询问，可参考 [EFF Tor 中继营运者法律 FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}。

??? question "需要多大的服务器？"

    一台 512MB RAM 的小 VPS 跑得动，但建议配到 1GB，因为 Tor 进程本身可能吃到接近 1GiB 的内存。CPU 与带宽需求都不高。

??? question "我可以用家里的网络架吗？"

    可以，但需要固定对外 IP、能在路由器做埠转发（443），且 ISP 允许这类流量。家用动态 IP 会让桥接位址不稳定。用 VPS 通常更省事、更稳定。

??? question "桥接行里的 IP 是我的服务器 IP 吗？"

    不是。WebTunnel 桥接行里的 IP 是随机产生的占位符，仅为符合规格。客户端实际是靠你的域名与秘密路径连上来的。

??? question "一定要用 Docker 吗？"

    不是唯一方式。也可以从原始码编译 Go 二进位档来跑，做法见 [Tor Project | Compile and run WebTunnel from source](https://community.torproject.org/relay/setup/webtunnel/source/){target="_blank"}。对多数人来说 Docker 是最省事的路。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 网络自由为什么重要](../basics/internet-freedom.md)
- [:material-chat-question: 什么是 Tor](../tools/what-is-tor.md)
- [:material-snowflake: Tor Snowflake 桥接点](../tools/tor-snowflake.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的专案

<div class="grid cards" markdown>

- [:material-server-network: 如何搭建 Tor Relay](./setup-tor-relay.md)
- [:material-school-outline: Tor Relay 校园建立](./relay-on-campus.md)
- [:material-list-status: Tor Relays 观测点](../taiwan/tor-relay-watcher.md)

</div>

## 官方参考文件

- [Tor Project | WebTunnel Bridge](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}：域名、TLS、nginx 设定主文件。
- [Tor Project | WebTunnel Docker setup](https://community.torproject.org/relay/setup/webtunnel/docker/){target="_blank"}：Docker 部署。
- [Tor Project | Compile and run WebTunnel from source](https://community.torproject.org/relay/setup/webtunnel/source/){target="_blank"}：从原始码编译。
- [Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"}：WebTunnel 设计理念。
