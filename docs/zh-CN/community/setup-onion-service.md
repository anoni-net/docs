---
title: 如何搭建 .onion 服务
description: 用 Tor 官方方式架设 v3 onion 服务，接上 nginx 导流与子域名，含权限、日志、排错与上线后的运维，另说明 vanity 地址的生成方式与它给不了的保证。
icon: material/onepassword
---

# :material-onepassword: 如何搭建 .onion 服务

Onion 服务让别人通过 Tor 直接连到你的服务器，过程中不需要公开服务器的 IP，也不需要向任何证书机构注册域名。连接两端都在 Tor 网络内完成，加密由 Tor 本身处理。

这份文件带你架起一个 v3 onion 服务，接上 nginx 导流，处理子域名，并在卡住的时候知道要看哪里。

!!! info "这跟架 relay 或桥接是两件事"

    [Tor Relay](./setup-tor-relay.md)、[WebTunnel 桥接](./setup-tor-webtunnel.md) 与 [Snowflake](../tools/tor-snowflake.md) 都是**把带宽贡献给 Tor 网络**，替别人转发流量。

    Onion 服务是**用 Tor 架自己的站**，只服务你自己的内容，不转发任何人的流量，对 Tor 网络的容量也没有贡献。两者的风险、法律处境与运维负担都不一样。

    onion 服务的设计原理、它与 IPFS 的取舍，以及 anoni.net 文档站三轨部署的整体架构，见 [去中心化发布：IPFS 与 Onion](../advanced/dweb-ipfs-onion.md)。只是想临时分享文件或架一个用完即弃的站，[OnionShare](../tools/onionshare.md) 的成本比自己架设服务低。

## 需要什么

- 一台你能控制的服务器，以 Linux 为主
- 已安装的 `tor`。确认方式是 `tor --version`，软件源版本通常都支持 v3
- 一个网页服务，而且它要监听在 `127.0.0.1`

### 确认你的网页服务监听在哪

```bash
sudo ss -ltnp | grep -E 'nginx|apache|caddy'
```

看 `Local Address` 那栏。`127.0.0.1:80` 表示只有本机连得到，这正是我们要的。`0.0.0.0:80` 或 `*:80` 表示对整个互联网开放。

两种情况都可以接 onion 服务。如果你想让网站同时保留 clearnet 版本，维持对外监听即可，Tor 一样连得到 `127.0.0.1`。如果你的目的是让服务器完全不从 clearnet 被看见，才需要把服务改成只绑 `127.0.0.1` 并关掉对外的端口。

### 出站连接要通

Tor 需要主动连出去才能加入 Tor 网络。防火墙**不需要**为 onion 服务开任何入站端口，但如果这台机器在企业内网、出站被限制，Tor 会连不上 Tor 网络，后面每一步都不会成功。这是内网环境最常遇到的第一个问题。

## 一、Tor 官方的做法

配置文件在 `/etc/tor/torrc`。编辑它并加上两行，[Tor 官方文档](https://community.torproject.org/onion-services/setup/){target="_blank"} 的示例如下：

```
HiddenServiceDir /var/lib/tor/my_website/
HiddenServicePort 80 127.0.0.1:80
```

`HiddenServiceDir` 是 Tor 存放这个服务身份的目录，`HiddenServicePort` 的前一个数字是 onion 上对外的端口，后面是后端服务实际监听的地址与端口。

同一个 `torrc` 可以放多组，每一组是一个独立的 onion 地址：

```
HiddenServiceDir /var/lib/tor/site-a/
HiddenServicePort 80 127.0.0.1:8080

HiddenServiceDir /var/lib/tor/site-b/
HiddenServicePort 80 127.0.0.1:8081
```

`HiddenServicePort` 一律归属在它前面最近的那个 `HiddenServiceDir` 下面。

### 目录权限

官方文档对权限只写了一句，目录要「readable/writeable by the user that will be running Tor」，没有给出具体的权限数值。实际的门槛是明确的，**目录权限必须是 `0700`**，放宽就会被拒绝。

软件包安装的 `tor` 通常以 `debian-tor` 或 `tor` 这个用户执行，确认方式：

```bash
systemctl cat tor@default.service | grep -E 'User=|debian-tor'
ps -o user= -C tor
```

权限设置与确认：

```bash
sudo chown -R debian-tor:debian-tor /var/lib/tor/my_website
sudo chmod 0700 /var/lib/tor/my_website
sudo ls -ld /var/lib/tor/my_website
```

如果目录由 Tor 自己创建（`torrc` 写好后重启即可），权限本来就会是对的，上面两行是手动创建目录时才需要。

如果有其他程序需要读取 `hostname`，`torrc` 有 `HiddenServiceDirGroupReadable 1` 可以开放同组读取目录与 `hostname` 文件，默认是 `0`。密钥文件本身不会因此变成组可读。

### 应用配置

```bash
sudo tor --verify-config          # 先检查语法，不会动到运行中的服务
sudo systemctl restart tor@default
sudo systemctl status tor@default
```

!!! warning "Debian 与 Ubuntu 有两个 unit，重启错的那个不会生效"

    软件包同时提供 `tor.service` 与 `tor@default.service`。实际运行的是 `tor@default.service`，`tor.service` 只是一个什么都不做的外壳。只重启 `tor.service` 不会应用新配置，但界面上看不出差别。

    不确定的话用 `systemctl list-units 'tor*'` 看哪一个在 `running`。

### 日志在哪里看

Tor 出问题时的答案几乎都在日志里。走 systemd 的话：

```bash
sudo journalctl -u tor@default -n 50 --no-pager
sudo journalctl -u tor@default -f          # 持续输出新的日志
```

`torrc` 也可以自己开一个日志文件，默认是注释掉的：

```
Log notice file /var/log/tor/notices.log
```

第一件要确认的事是 Tor 有没有连上 Tor 网络，日志里要看到这一行：

```
Bootstrapped 100% (done): Done
```

没有这一行就代表 Tor 本身还没连上网络，此时不管 `HiddenServiceDir` 配置对不对都不会有 onion 地址。多半是出站连接被拦。

### 获取地址

Tor 正常启动后，`HiddenServiceDir` 下面会有下列文件：

| 文件 | 内容 |
|---|---|
| `hostname` | 56 字符的 v3 地址加上 `.onion` |
| `hs_ed25519_public_key` | 公钥 |
| `hs_ed25519_secret_key` | **私钥，泄露即无法挽回** |
| `authorized_clients/` | 访问控制用的目录，默认是空的 |

目录是 `0700`、文件是 `0600`，全部由 Tor 自己创建。因为只有 Tor 的执行身份读得到，看地址要用 `sudo`：

```bash
sudo cat /var/lib/tor/my_website/hostname
```

其余文件是这个服务的密钥。官方文档的警告值得逐字读：

> The other files are your Onion Service keys, so it is imperative that these are kept private. If your keys leak, other people can impersonate your Onion Service, deeming it compromised, useless, and dangerous to visit.

密钥泄露的后果没有补救方式。onion 地址就是公钥的编码，没有吊销机制，也没有机构可以帮你注销。唯一的处理是生成新地址并通知所有读者，而通知本身在抗审查的情境下往往做不到。

!!! tip "怎么确认自己目前是安全的"

    `sudo ls -la /var/lib/tor/my_website` 看到目录是 `drwx------`、文件是 `-rw-------`、所有者是 Tor 的执行身份，就是正常状态。Tor 自己创建的目录本来就是如此，不需要额外处理。

    备份 `HiddenServiceDir` 的整个目录。存放的位置要用跟服务器同等或更高的标准保护，具体来说是加密（例如放进已加密的密码管理器或用 `gpg -c` 加密后再存），不要放进一般的云端硬盘或代码仓库。

## 二、接到 nginx

Onion 服务本身只负责把连接送到你指定的地址与端口，导流由 nginx 决定。

Debian 与 Ubuntu 的惯例是把配置放进 `/etc/nginx/sites-available/`，再链接到 `sites-enabled/`：

```bash
sudo nano /etc/nginx/sites-available/onion
sudo ln -s /etc/nginx/sites-available/onion /etc/nginx/sites-enabled/
sudo nginx -t                     # 语法检查，一定要先执行
sudo systemctl reload nginx
```

配置内容：

```nginx
server {
    listen 127.0.0.1:80;
    server_name <你的地址>.onion;

    root /var/www/site;
    index index.html;
}
```

`server_name` 要填入实际的 onion 地址。如果这个 `listen` 上只有这一个 server block，填错也不会出事。一旦有多个 server block 共用同一个 `listen`（例如下一节的子域名），没对上的请求就会落到 nginx 的 default server，得到错误的内容或默认页。

### 改用 Unix socket

`torrc` 那边写成 `unix:` 的话，nginx 这边要对应改成监听同一个 socket，后端就完全不在 TCP 上出现。

!!! danger "不要用 `/run/tor/`"

    那是 Tor 自己的 runtime 目录，由 systemd 在启动时以 `debian-tor` 身份创建（`ExecStartPre` 里就写着 `-o debian-tor -g debian-tor -d /run/tor`）。nginx 以 `www-data` 执行，在那里创建不了 socket。

建一个两边都能用的目录：

```bash
sudo mkdir -p /run/onion
sudo chown www-data:debian-tor /run/onion
sudo chmod 0770 /run/onion
```

`/run` 是 tmpfs，重启会清空。要让目录重启后仍然存在，建一个 tmpfiles 规则：

```bash
echo 'd /run/onion 0770 www-data debian-tor -' | sudo tee /etc/tmpfiles.d/onion.conf
sudo systemd-tmpfiles --create
```

接着 `torrc` 与 nginx 两边指向同一个路径：

```
HiddenServicePort 80 unix:/run/onion/site.sock
```

```nginx
server {
    listen unix:/run/onion/site.sock;
    server_name <你的地址>.onion;

    root /var/www/site;
    index index.html;
}
```

socket 由 nginx 创建，Tor 是连过去的一方，所以 Tor 的执行身份要能写入它。nginx 的 `listen` 指令没有任何设置 socket 所有者、组或权限的参数，所以控制点只能放在目录那一层。

reload 之后实际确认一次，不要假设默认值可用：

```bash
ls -l /run/onion/site.sock
```

权限太严 Tor 连不上，太松则是本机任何用户都连得到你的后端，两个方向都要看。

`torrc` 的 `GroupWritable` 与 `WorldWritable` 标志对这里没有作用。那两个是给 Tor 自己创建的 socket 用的，例如 `ControlSocket` 与 `SocksPort`。

### HTTPS 的取舍

Tor 对 onion 服务的连接本身已经是端到端加密并经过验证，地址就是公钥。再包一层 TLS 在密码学上不会增加保护，所以默认建议是保持 HTTP，让 Tor 处理加密。

有两件事值得先知道：

- **公开证书机构签得出来**：CA/Browser Forum 在 2021 年通过修正案，允许为 v3 `.onion` 核发 DV 证书，目前有商业 CA 提供这项服务（付费）。如果你的审计规定要求「一律要有 TLS」，这是一条实际存在的路
- **Tor Browser 仍会显示不安全提示**：纯 HTTP 的 `.onion` 在 Tor Browser 上会被标示为不安全，这是官方追踪中的已知议题（`#21321`）。密码学上没有问题，但非技术的用户看到那个字样很可能误判并反馈问题，内部工具尤其容易遇到

### 最常出错的地方

- **后端在响应里写死 clearnet 网址**：页面上的链接、表单 action、重定向如果指向原本的域名，访客一点就跳出 Tor，匿名性当场失效
- **外部资源**：图片、字体、分析脚本如果从 clearnet 加载，同样会让访客的浏览器对外连接
- **Referrer 泄露**：页面上如果有连到 clearnet 网站的链接，浏览器默认会带 `Referer`，对方的日志就会看到你的 `.onion` 地址。加上 `add_header Referrer-Policy no-referrer;` 或在链接加 `rel="noreferrer"`
- **`Host` 头部检查**：有些应用框架会拒绝不在允许清单内的 `Host`，onion 地址要另外加进去
- **access log 的来源都是 `127.0.0.1`**：所有连接都经过本机的 Tor 转发，日志记到的永远是本机地址而不是访客的真实来源。这是正常现象，日志配置没有问题

## 三、子域名怎么运作

Onion 地址可以带子域名，而且不需要另外申请或配置任何 DNS。Tor 会把完整的 `Host` 原样传给后端，由 nginx 决定怎么分流。

anoni.net 文档站的地址正好是下面的结构：

```
docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion
└┬─┘ └──────────────────── 56 个字符的 v3 地址 ────────────────────┘
 └── 子域名，由 nginx 的 server_name 分流
```

一个 onion 地址可以承载多个子域名，nginx 的写法：

```nginx
server {
    listen 127.0.0.1:80;
    server_name docs.<你的地址>.onion;
    root /var/www/docs;
}

server {
    listen 127.0.0.1:80;
    server_name <你的地址>.onion;
    root /var/www/main;
}
```

`torrc` 那边不需要为了子域名多做任何配置，一组 `HiddenServiceDir` 与 `HiddenServicePort` 就够了。

## 四、限制谁能访问

如果这个服务不打算对所有人开放，v3 onion 有内建的访问控制（client authorization）。授权以外的连接在会合阶段就被拒绝，看不到任何内容，比只靠地址保密可靠得多。

服务器端把授权用的公钥放进 `HiddenServiceDir/authorized_clients/`，客户端在自己的 `torrc` 设 `ClientOnionAuthDir` 指向存放私钥的目录。内部工具、只给特定伙伴的镜像，都适合走这条路。

密钥的生成方式与文件格式见 [Tor 官方的 client authorization 说明](https://community.torproject.org/onion-services/advanced/client-auth/){target="_blank"}。

## 五、vanity 地址（可选）

!!! info "这一节可以跳过"

    Vanity 地址纯粹是让开头字符串好记，不影响服务能不能用、也不影响安全性。第一次架服务建议先跳过，等服务运作正常再回来。

默认生成的地址是完全随机的 56 个字符。想让开头是可辨识的字符串，例如 anoni.net 的 `anoninet`，需要反复生成密钥直到开头符合为止。

[mkp224o](https://github.com/cathugger/mkp224o){target="_blank"} 是常用的工具，[Tor 官方的 vanity 地址说明](https://community.torproject.org/onion-services/advanced/vanity-addresses/){target="_blank"} 也以它为主。

先装编译需要的软件包，mkp224o 的说明列出下列软件包：

```bash
sudo apt install gcc libc6-dev libsodium-dev make autoconf
```

编译与执行：

```bash
./autogen.sh
./configure
make
./mkp224o -d nekokeys neko
```

AMD64 平台可以在 `configure` 加上 `--enable-amd64-51-30k` 取得较好的性能，BSD 系统把 `make` 换成 `gmake`。生成的密钥目录结构与 `HiddenServiceDir` 相同，搬过去之后记得把所有者与权限改成前面那一节的样子。

### 成本

mkp224o 的说明给的估计是，6 个字符的前缀「shouldn't take more than few tens of minutes」，但那个数字有前提，原文写的是 `if using batch mode`，细节在它的 `OPTIMISATION.txt`。7 个字符「can take hours to days」。它同时提醒这件事「depends on pure luck」，没办法给出保证。

每多一个字符，搜索空间乘以 32。anoni.net 用的 `anoninet` 是 8 个字符，也就是比官方说明里「hours to days」的 7 个字符再难 32 倍。

### 字符集的限制

onion 地址用 base32 编码，字符集是 `a` 到 `z` 与 `2` 到 `7`。数字 `0`、`1`、`8`、`9` 不存在，所以带这些数字的前缀不可能生成出来。mkp224o 会在开始前检查并提前报错。

### vanity 地址证明不了身份

这是最容易被误解的地方。Tor 官方文档的说明是：

> An attacker wishing to impersonate an existing onionsite by creating a fake version of it might use vanity addresses as an additional way to convince users that their address is the right one.

任何人都可以用一般的运算资源生成另一组以 `anoninet` 开头的地址。前缀相同不代表是同一个服务，它只是好记，没有任何验证作用。

所以自己架 vanity 地址的时候要清楚，前缀带来的是可读性，不是可信度。对外公布地址时要给完整的 56 个字符，读者验证时也要比对完整地址而不是只看开头。

安全性本身不受影响。前缀以外的部分仍然是随机生成的，vanity 地址不会比一般地址容易被破解。

## 六、上线前的检查

依序确认，每一步都有明确的判准：

**1. Tor 连上 Tor 网络了**

```bash
sudo journalctl -u tor@default | grep -i bootstrapped | tail -1
```

要看到 `Bootstrapped 100% (done)`。

**2. 地址生成了**

```bash
sudo cat /var/lib/tor/my_website/hostname
```

要看到 56 个字符加上 `.onion`。

**3. 后端在本机响应正常**

```bash
curl -sI http://127.0.0.1:80/ -H 'Host: <你的地址>.onion' | head -1
```

要看到 `HTTP/1.1 200 OK`。带 `Host` 头部是为了模拟 Tor 实际会送过来的请求，顺便验证 `server_name` 有对上。

**4. 从 Tor 连得到**

用 Tor Browser 打开那个 `.onion` 地址。没有图形界面的话：

```bash
sudo apt install torsocks
torsocks curl -sI http://<你的地址>.onion/ | head -1
```

!!! warning "第一次连不上很可能只是还没好"

    服务的描述符要先发布到 Tor 网络上，刚配置完的前几分钟连不到是正常的。等几分钟再试一次，先不要回头改配置。

    重启 Tor 之后也会有同样的空窗。

**5. 没有东西连出去**

查看页面源代码，确认图片、字体、脚本都不是从 clearnet 加载的。点过站上主要的链接，确认不会跳出 Tor。

**6. 密钥备份好了**

见前面「怎么确认自己目前是安全的」。

clearnet 网站可以加上 `Onion-Location` 头部，让 Tor Browser 的访客自动看到 onion 版本的提示：

```nginx
add_header Onion-Location http://<你的地址>.onion$request_uri;
```

依官方说明，这个头部要放在**走 HTTPS 的 clearnet 网站**上，放在 onion 站自己身上没有作用。

## 七、卡住的时候

??? question "Tor 起不来"

    先看日志：`sudo journalctl -u tor@default -n 50`。

    看到 `Permissions on directory ... are too permissive` 就是目录权限问题，`sudo chmod 0700` 那个目录即可。

    看到 `Failed to parse/validate config` 表示 `torrc` 语法有误，`sudo tor --verify-config` 会指出是哪一行。

??? question "改了 torrc 但好像没生效"

    多半是重启到 `tor.service` 而不是 `tor@default.service`。用 `systemctl list-units 'tor*'` 确认哪一个在运行。

??? question "日志看起来正常，但就是连不到"

    依序排除：

    1. 日志有没有 `Bootstrapped 100%`。没有的话是 Tor 连不上 Tor 网络，检查出站防火墙
    2. `hostname` 文件存不存在。不存在表示 `HiddenServiceDir` 那段没有生效
    3. 刚配置完或刚重启的话，描述符发布需要时间，等几分钟再试
    4. 本机直接连后端通不通（见上一节第 3 步）。不通的话问题在 nginx 不在 Tor

??? question "权限看起来完全正确，但 Tor 就是访问不了"

    如果你用了非默认的路径，可能是 AppArmor 或 SELinux 拦下来的。这种失败不会表现成权限错误，`ls -l` 看起来一切正常。

    ```bash
    sudo journalctl -k | grep -i 'apparmor.*DENIED'
    sudo dmesg | grep -i denied
    ```

    有命中的话，把路径改回 `/var/lib/tor/` 下面是最快的解法。systemd unit 本身的沙箱配置（`ProtectSystem`、`ReadWritePaths`）也可能拦，非默认路径要一并确认。

??? question "nginx 那一侧怎么查"

    ```bash
    sudo nginx -t
    sudo tail -50 /var/log/nginx/error.log
    ```

    走 Unix socket 的话，确认 socket 文件存在且 Tor 的身份写得进去：`ls -l /run/onion/site.sock`。

??? question "重启之后就连不上了"

    如果 socket 放在 `/run` 下面，那是 tmpfs，重启会清空。需要 `/etc/tmpfiles.d/` 的规则才会重建，见第二节。

    另外确认 nginx 与 tor 两个服务的启动顺序，nginx 要先创建好 socket，Tor 才连得上。

## 八、上线之后

### 服务不会自己通报故障

Tor 的进程存活不代表描述符还正常发布在网络上。定期从外部实际连一次是最直接的检查方式，例如用 `torsocks curl` 排一个定时任务。

### 重启会有空窗

每次重启 Tor，描述符要重新发布，服务会有几分钟连不到，那不是故障。

### 延迟是固定成本

连接要绕过数个中继，往返延迟通常是几百毫秒到超过一秒。交互式的应用（后台管理界面、实时协作）在 onion 上的体感会明显比 clearnet 差，静态内容影响较小。这一点在决定要不要把某个服务放上 onion 时就要先想清楚。

### 换机器要搬的是 HiddenServiceDir

地址绑在密钥上，只要把整个目录搬过去、权限设对，地址不会变。这也是为什么那个目录的备份要当成机密数据保管。

### 主动下线

把 `torrc` 里对应的两行移除并重启即可。地址一旦停用就无法让别人知道发生什么事，如果有读者依赖它，先在 clearnet 那侧公告。

## 九、Caddy 的做法

如果你的环境已经在用 Caddy，[Onion mirror with Caddy](https://flower.codes/2025/10/23/onion-mirror.html){target="_blank"} 有一份可以照做的说明。

Caddy 默认会自动申请 TLS 证书，用在 onion 服务上要记得关掉，理由与前面 HTTPS 那节相同。整体流程与本文一致，差别只在导流那一层的配置语法。

## 相关阅读

- [去中心化发布：IPFS 与 Onion](../advanced/dweb-ipfs-onion.md)：原理、两者的取舍，以及 anoni.net 三轨部署的整体架构
- [协助 pin 文档站的 IPFS 镜像](./pin-ipfs-mirror.md)：另一种抗封锁镜像的做法
- [如何搭建 Tor Relay](./setup-tor-relay.md)：把带宽贡献给 Tor 网络，跟本文是不同性质的任务
- [OnionShare](../tools/onionshare.md)：临时分享文件与建站，不需要自己运维服务

需要多台机器分摊同一个 onion 地址的流量时，Tor Project 下面有 [OnionBalance](https://gitlab.torproject.org/tpo/onion-services/onionbalance){target="_blank"} 这个项目。它在 2021 到 2025 年之间沉寂过一段时间，2025 年 4 月恢复发布，最新版本是 `0.2.4`，评估时值得先看一下项目的近况。
