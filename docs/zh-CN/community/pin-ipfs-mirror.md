---
title: 帮忙 pin 文件站的 IPFS 镜像
description: 用一个常驻的 IPFS 节点加定时脚本，帮 anoni.net 文件站 pin 最新镜像，提高抗删除存活率。给 Windows、Linux、macOS 的节点贡献者，含 Docker 与非 Docker 做法。
icon: simple/ipfs
---

# :simple-ipfs: 帮忙 pin 文件站的 IPFS 镜像

anoni.net 文件站除了主站，还有一份 IPFS 镜像，让文件在主站被封锁或下架时仍然读得到。IPFS 上的内容要有节点 pin 才会存活，目前只有社群自己的节点在 pin。你多跑一个节点帮忙 pin，网络上就多一份完整副本，抗删除的底气更足。

这页教你用一个常驻的 IPFS 节点，加一支自动跟上最新版本的定时脚本。整个过程对 Windows、Linux、macOS 都适用，有没有用 Docker 都可以。

!!! tip "要帮忙，你需要"

    - 一台几乎整天开着、能联网的电脑（台式机、家用服务器、或一台小主机都可以）。
    - 安装 IPFS（下面会带你装）。
    - 跑一支定时脚本，每隔几小时自动 pin 最新版本。

    帮不了节点也没关系，文末的「不想自架节点」有用 pinning service 代 pin 的替代做法。

## 为什么 CID 每次都不一样（IPFS 30 秒入门）

第一次接触 IPFS 的话，先理解一件事，后面的定时才有道理。IPFS 的深入设计见 [去中心化网站发布](../advanced/dweb-ipfs-onion.md)，这里只说明到够用为止。

- IPFS 把文件内容算出一段 hash，叫做 CID（Content Identifier），这段 CID 就是内容在 IPFS 上的地址。内容相同，CID 就相同。
- 内容一改，CID 就跟着变。文件站每次更新、重新发布，都会产生一个全新的 CID。
- IPNS（InterPlanetary Name System）是一个固定不变的名字，永远指向「目前最新」的那个 CID。文件站的 IPNS 名字就是下面那串 `k51…`。
- pin 的意思是「保证留住某个 CID 的内容」。pin 绑在 CID 上，不会自己跟着 IPNS 走。所以文件站一发新版，你上次 pin 的还是旧 CID。

结论就是这支脚本要做的事：先把 IPNS 换算成当前的 CID，再 pin 那个新 CID，然后放掉旧的。因为 CID 会变，这件事要定期重跑，这就是为什么要设定时任务。

## 运作原理（为什么定时就够，不用等通知）

你不需要社群通知你「换新版了」。IPNS 就是大家共用的同步点，你的脚本自己去解析就拿得到最新 CID。文件站发布时只是照常更新 IPNS，你这边每隔几小时解析一次、发现变了就 pin 新版，全程不用人工协调。

!!! info ""

    文件站的 IPFS 坐标（公开值，可以直接用）：

    - IPNS 名称：`k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw`
    - 浏览器打开看：[https://anoni-net.ipns.dweb.link/](https://anoni-net.ipns.dweb.link/){target="_blank"}

脚本每次跑的动作是：解析 IPNS 拿到当前 CID，pin 新 CID，unpin 上次那版，回收空间。脚本先确认新版 pin 成功，才会放掉旧版。万一解析失败或抓不到内容，它会保留你手上现有的副本，不会让你的节点变空。

## 步骤一：跑一个常驻的 IPFS 节点

pin 要能抓齐内容，本机就得有一个持续运作的 IPFS daemon。下面依你的环境选一种。

=== "Linux / macOS"

    安装 [kubo](https://docs.ipfs.tech/install/command-line/){target="_blank"}（IPFS 官方的命令行版本）。macOS 可以用 Homebrew：

    ```bash
    brew install ipfs
    ```

    Linux 依 [官方说明](https://docs.ipfs.tech/install/command-line/){target="_blank"} 下载对应架构的 kubo。装好后初始化并启动 daemon：

    ```bash
    ipfs init          # 第一次才需要
    ipfs daemon
    ```

    要让 daemon 长时间常驻，Linux 建议做成 systemd user service，macOS 可以用 `brew services` 或 launchd。临时测试时，直接让 `ipfs daemon` 在后台跑也可以。

=== "Windows"

    最省事的是安装 [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/){target="_blank"}，它内含 kubo，登录后会自动在系统托盘常驻，daemon 一直开着。

    装好后确认命令行能调用到 `ipfs`。独立版 kubo 需要自己把 `ipfs.exe` 加进系统 PATH，用 IPFS Desktop 的话，若 PATH 找不到 `ipfs`，在脚本里改用完整路径即可。

=== "Docker"

    用一个 `docker-compose.yml` 跑 kubo，容器名取 `ipfs_host`：

    ```yaml
    services:
      ipfs_host:
        image: ipfs/kubo:latest
        restart: always
        volumes:
          - ./ipfs-data:/data/ipfs
        ports:
          - "4001:4001"   # swarm，对外开有助于连到其他节点
    ```

    启动：

    ```bash
    docker compose up -d
    ```

    之后对 IPFS 下指令都透过容器，设一个环境变量让脚本自动套用（下一步会用到）：

    ```bash
    export IPFS_CMD="docker exec ipfs_host ipfs"
    ```

## 步骤二：取得 pin 脚本

脚本会自己解析 IPNS、pin 新版、unpin 旧版。IPNS 名字已经写死在里面，不用改。Docker 用户记得先设好上一步的 `IPFS_CMD`。

### Linux、macOS、Docker：`anoni-pin.sh`

[:material-download: 下载 anoni-pin.sh](https://raw.githubusercontent.com/anoni-net/docs/main/docs/_scripts/anoni-pin.sh){ .md-button }

```bash
--8<-- "_scripts/anoni-pin.sh"
```

保存后给执行权限：

```bash
chmod +x anoni-pin.sh
./anoni-pin.sh          # 先手动跑一次确认正常
```

### Windows：`anoni-pin.ps1`

[:material-download: 下载 anoni-pin.ps1](https://raw.githubusercontent.com/anoni-net/docs/main/docs/_scripts/anoni-pin.ps1){ .md-button }

```powershell
--8<-- "_scripts/anoni-pin.ps1"
```

先手动跑一次确认正常（PowerShell 默认会挡脚本，用 `-ExecutionPolicy Bypass` 放行这一次）：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\anoni-pin.ps1
```

## 步骤三：设定定时任务

让脚本每隔几小时自动跑。文件站更新不频繁，每 6 小时足够，想更快跟上可以缩短。

=== "Linux / macOS"

    用 cron。编辑定时表：

    ```bash
    crontab -e
    ```

    加一行，每 6 小时跑一次，并把输出写进 log：

    ```bash
    0 */6 * * * /path/to/anoni-pin.sh >> $HOME/.anoni-pin/log 2>&1
    ```

    想要开机补跑漏掉的任务，也可以改用 systemd timer（设 `Persistent=true`），效果更稳。

=== "Windows"

    用「任务计划程序」。最快的方式是命令行创建，每 6 小时跑一次：

    ```powershell
    schtasks /Create /TN "anoni-ipfs-pin" `
      /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Tools\anoni-pin.ps1" `
      /SC HOURLY /MO 6 /RL LIMITED
    ```

    把 `C:\Tools\anoni-pin.ps1` 换成你实际存放的路径。也可以用「任务计划程序」的图形界面，触发程序填 `powershell`，参数填 `-NoProfile -ExecutionPolicy Bypass -File 你的路径`。

=== "Docker"

    定时任务照你主机的操作系统设（Linux、macOS 用 cron，Windows 用任务计划程序，见前两个分页）。差别只在脚本执行前要先设好 `IPFS_CMD`，例如包一层小 wrapper：

    ```bash
    #!/usr/bin/env bash
    export IPFS_CMD="docker exec ipfs_host ipfs"
    exec /path/to/anoni-pin.sh
    ```

    把 cron 指到这支 wrapper 即可。

## 步骤四：验证

确认脚本真的把内容 pin 住了。先解析出当前 CID，再看它在不在 pin 列表：

```bash
CID=$(ipfs name resolve --nocache /ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw)
ipfs pin ls --type=recursive | grep "${CID#/ipfs/}"
```

也可以在本机 gateway 打开看，内容正常显示就成功了：`http://127.0.0.1:8080${CID}/`。Docker 用户把上面的 `ipfs` 换成 `docker exec ipfs_host ipfs`。

## 维护与注意事项

- **会自动跟上新版**：文件站换 CID 后，下一次定时任务就会 pin 新版、放掉旧版，你不用做任何事。
- **硬盘不会一直变大**：脚本 unpin 旧版后会执行一次垃圾回收，只留最新版本占空间。文件站是纯静态网站，体积不大。
- **不会弄丢你手上的版本**：脚本先确认新版 pin 成功才放掉旧版，解析或下载失败时会保留现有副本。
- **想停止帮忙**：unpin 目前版本、把定时任务移除即可，不影响其他节点。
- **隐私与风险**：你 pin 的是公开文件，没有隐私顾虑。提供 IPFS pin 在不同司法管辖下的风险不同，相关限制见 [去中心化网站发布](../advanced/dweb-ipfs-onion.md) 的「已知限制与风险」。

## 不想自架节点：用 pinning service 代 pin

不想维护 daemon 与定时任务的话，可以改用 [Pinata](https://www.pinata.cloud/){target="_blank"}、[Storacha](https://storacha.network/){target="_blank"} 这类 pinning service。在它们的界面直接贴上当前 CID 手动 pin，或用它们的 API 写个定时任务喂新 CID，逻辑跟本页脚本一样（解析 IPNS 拿 CID，再送给服务 pin）。

差别在存活重新依赖第三方服务商，而不是你自己的节点。当备援可以，想真正分散化还是自架节点最直接。

## :fontawesome-solid-diagram-project: 相关阅读

<div class="grid cards" markdown>

- [:material-web-box: 去中心化网站发布](../advanced/dweb-ipfs-onion.md)
- [:material-server-network: 如何搭建 Tor Relay](./setup-tor-relay.md)
- [:material-chat-question: 什么是 Tor](../tools/what-is-tor.md)

</div>
