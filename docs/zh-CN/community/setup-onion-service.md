---
title: 如何搭建 .onion 服务
description: 用 Tor 官方方式架设 v3 onion 服务，接上 nginx 导流与子域名，并说明 vanity 地址的生成方式与它给不了的保证。
icon: material/onepassword
---

# :material-onepassword: 如何搭建 .onion 服务

Onion 服务让别人通过 Tor 直接连到你的服务器，过程中不需要公开服务器的 IP，也不需要向任何证书机构注册域名。连接两端都在 Tor 网络内完成，加密由 Tor 本身处理。

这份文件带你架起一个 v3 onion 服务，接上 nginx 导流，处理子域名，并说明 vanity 地址怎么生成，以及它给不了什么保证。

!!! info "先理解原理再回来"

    这页是操作步骤。onion 服务的设计原理、它与 IPFS 的取舍，以及 anoni.net 文档站三轨部署的整体架构，见 [去中心化发布：IPFS 与 Onion](../advanced/dweb-ipfs-onion.md)。

    只是想临时分享文件或架一个用完即弃的站，[OnionShare](../tools/onionshare.md) 的成本比自己架设服务低。这页说明的是长期运作的服务。

## 需要什么

- 一台你能控制的服务器，以 Linux 为主
- 已安装的 `tor`，软件源版本通常都支持 v3
- 一个已经在 `127.0.0.1` 上运作的网页服务

不需要域名，不需要公开的 IP，不需要 TLS 证书。

## 一、Tor 官方的做法

编辑 `torrc`，加上两行。[Tor 官方文档](https://community.torproject.org/onion-services/setup/){target="_blank"} 的示例是这样：

```
HiddenServiceDir /var/lib/tor/my_website/
HiddenServicePort 80 127.0.0.1:80
```

`HiddenServiceDir` 是 Tor 存放这个服务身份的目录，`HiddenServicePort` 的前一个数字是 onion 上对外的端口，后面是后端服务实际监听的地址与端口。

也可以走 Unix socket，避免后端在 TCP 上监听：

```
HiddenServiceDir /var/lib/tor/my-website/
HiddenServicePort 80 unix:/var/run/tor/my-website.sock
```

### 目录权限

官方文档对这点只写了一句，目录要「readable/writeable by the user that will be running Tor」，没有给出具体的权限数值。

实际操作中这个目录必须只有 Tor 的执行身份能读写，默认情况下权限放宽会让 Tor 拒绝启动并在日志里说明原因。软件包安装的 `tor` 通常以 `debian-tor` 或 `tor` 这个用户执行，确认方式是看发行版的 service 配置。

如果有其他程序需要读取 `hostname`，`torrc` 有 `HiddenServiceDirGroupReadable 1` 可以开放同组读取目录与 `hostname` 文件，默认是 `0`。密钥文件本身不会因此变成组可读。

如果 Tor 起不来，第一个要看的就是这个目录的所有者与权限。

### 获取地址

重启 `tor` 之后，`HiddenServiceDir` 下面会出现几个文件。`hostname` 里面是这个服务的 v3 地址，56 个字符加上 `.onion`。

其余文件是这个服务的密钥。官方文档的警告值得逐字读：

> The other files are your Onion Service keys, so it is imperative that these are kept private. If your keys leak, other people can impersonate your Onion Service, deeming it compromised, useless, and dangerous to visit.

密钥泄露的后果没有补救方式。onion 地址就是公钥的编码，没有吊销机制，也没有机构可以帮你注销。唯一的处理是生成新地址并通知所有读者，而通知本身在抗审查的情境下往往做不到。

备份 `HiddenServiceDir` 的整个目录，存放的位置要用跟服务器同等或更高的标准保护。

## 二、接到 nginx

Onion 服务本身只负责把连接送到你指定的地址与端口，导流由 nginx 决定。

后端只绑 `127.0.0.1`，不对外开端口。服务器的防火墙不需要为了 onion 服务开任何入站端口，Tor 是主动对外建立连接的。

```nginx
server {
    listen 127.0.0.1:80;
    server_name <你的地址>.onion;

    root /var/www/site;
    index index.html;
}
```

`server_name` 要填入实际的 onion 地址。没有填的话请求会落到 nginx 的 default server，通常会得到错误的内容或默认页。

### 改用 Unix socket

`torrc` 那边写成 `unix:` 的话，nginx 这边要对应改成监听同一个 socket，后端就完全不在 TCP 上出现。

```nginx
server {
    listen unix:/var/run/tor/my-website.sock;
    server_name <你的地址>.onion;

    root /var/www/site;
    index index.html;
}
```

两边的路径必须完全一致，也就是 `HiddenServicePort` 里的 `unix:` 路径与 nginx `listen unix:` 的路径。

socket 由 nginx 创建，Tor 是连过去的一方，所以那个 socket 必须让 Tor 的执行身份写得进去。nginx 的 `listen` 指令没有任何设置 socket 所有者、组或权限的参数，这件事只能从文件系统这一侧处理：

- 把 socket 放在一个只有 nginx 与 Tor 两个身份能进入的目录
- nginx 重新加载之后，实际确认 socket 的所有者与模式，不要假设默认值可用
- Tor 连不上时，日志会出现连接被拒的消息，那通常就是权限问题

`torrc` 的 `GroupWritable` 与 `WorldWritable` 标志对这里没有作用。那两个是给 Tor 自己创建的 socket 用的，例如 `ControlSocket` 与 `SocksPort`。

### 不要在 onion 上另外启用 HTTPS

Tor 对 onion 服务的连接本身已经是端到端加密并经过验证，地址就是公钥。再包一层 TLS 只会带来两个问题，公开证书机构通常不签发 `.onion` 证书，而自签证书会让每个访客看到浏览器警告。

保持 HTTP，让 Tor 处理加密。

### 常见的坑

- **后端在响应里写死 clearnet 网址**。页面上的链接、表单 action、重定向如果指向原本的域名，访客一点就跳出 Tor，匿名性当场失效
- **外部资源**。图片、字体、分析脚本如果从 clearnet 加载，同样会让访客的浏览器对外连接
- **`Host` 头部检查**。有些应用框架会拒绝不在允许清单内的 `Host`，onion 地址要另外加进去

## 三、子域名怎么运作

Onion 地址可以带子域名，而且不需要另外申请或配置任何 DNS。Tor 会把完整的 `Host` 原样传给后端，由 nginx 决定怎么分流。

anoni.net 文档站的地址正好是这个结构：

```
docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion
└┬─┘ └──────────────────── 56 个字符的 v3 地址 ────────────────────┘
 └── 子域名，由 nginx 的 server_name 分流
```

一个 onion 地址可以承载多个子域名，nginx 这样写：

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

## 四、vanity 地址

默认生成的地址是完全随机的 56 个字符。想让开头是可辨识的字符串，例如 anoni.net 的 `anoninet`，需要反复生成密钥直到开头符合为止。

[mkp224o](https://github.com/cathugger/mkp224o){target="_blank"} 是常用的工具，[Tor 官方的 vanity 地址说明](https://community.torproject.org/onion-services/advanced/vanity-addresses/){target="_blank"} 也以它为主。

编译与执行：

```bash
./autogen.sh
./configure
make
./mkp224o -d nekokeys neko
```

AMD64 平台可以在 `configure` 加上 `--enable-amd64-51-30k` 取得较好的性能，BSD 系统把 `make` 换成 `gmake`。生成的密钥目录结构与 `HiddenServiceDir` 相同，直接搬过去即可。

### 成本

mkp224o 的说明给的估计是，6 个字符的前缀在批处理模式下「shouldn't take more than few tens of minutes」，7 个字符「can take hours to days」。它同时提醒这件事「depends on pure luck」，没办法给出保证。

每多一个字符，搜索空间乘以 32。anoni.net 用的 `anoninet` 是 8 个字符，比官方说明里「hours to days」的 7 个字符再高一个数量级。

### 字符集的限制

onion 地址用 base32 编码，字符集是 `a` 到 `z` 与 `2` 到 `7`。数字 `0`、`1`、`8`、`9` 不存在，所以带这些数字的前缀不可能生成出来。mkp224o 会在开始前检查并提前报错。

### vanity 地址证明不了身份

这是最容易被误解的地方。Tor 官方文档的说明是：

> An attacker wishing to impersonate an existing onionsite by creating a fake version of it might use vanity addresses as an additional way to convince users that their address is the right one.

任何人都可以用一般的运算资源生成另一组以 `anoninet` 开头的地址。前缀相同不代表是同一个服务，它只是好记，没有任何验证作用。

所以自己架 vanity 地址的时候要清楚，前缀带来的是可读性，不是可信度。对外公布地址时要给完整的 56 个字符，读者验证时也要比对完整地址而不是只看开头。

安全性本身不受影响。前缀以外的部分仍然是随机生成的，vanity 地址不会比一般地址容易被破解。

## 五、上线前的检查

- 用 Tor Browser 实际连一次，确认内容正确
- 查看页面源代码，确认没有任何从 clearnet 加载的资源
- 点过站上主要的链接，确认不会跳出 Tor
- 确认 `HiddenServiceDir` 已备份，且备份的存放位置有适当保护

clearnet 网站可以加上 `Onion-Location` 头部，让 Tor Browser 的访客自动看到 onion 版本的提示。

## 六、Caddy 的做法

如果你的环境已经在用 Caddy，[Onion mirror with Caddy](https://flower.codes/2025/10/23/onion-mirror.html){target="_blank"} 有一份可以照做的说明。

Caddy 默认会自动申请 TLS 证书，用在 onion 服务上要记得关掉，理由与前面 nginx 那节相同。整体流程与本文一致，差别只在导流那一层的配置语法。

## 相关阅读

- [去中心化发布：IPFS 与 Onion](../advanced/dweb-ipfs-onion.md)：原理、两者的取舍，以及 anoni.net 三轨部署的整体架构
- [协助 pin 文档站的 IPFS 镜像](./pin-ipfs-mirror.md)：另一种抗封锁镜像的做法
- [如何搭建 Tor 中继节点](./setup-tor-relay.md)：对 Tor 网络的另一种贡献方式
- [OnionShare](../tools/onionshare.md)：临时分享文件与建站，不需要自己运维服务
