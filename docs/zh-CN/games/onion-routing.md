---
title: Tor 路由解谜
description: 可操作的解谜。自行挑选 3 个中继组成 Tor 的 guard、middle、exit 路径，避开被监听的节点、把 3 跳分散到不同 ASN，遇到封锁改走网桥。四个关卡各对应一项真实的选路考量。
icon: material/shuffle-variant
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/onion-routing.png
  image_width: 2990
  image_height: 1706
---

# :material-shuffle-variant: Tor 路由解谜

![Tor 路由解谜的起始盘面，左侧是发件端，右侧是收件人，中间浮着五个颜色不同的中继](https://assets.anoni.net/games/onion-routing-board-zh-cn.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

把消息从左边的你送到右边的收件人，中间要自己挑 3 个中继组成路径。四个关卡各挡一次，每一关挡的都是 Tor 选路时真的要处理的一项限制。

<a href="../../games/onion-routing/play/index.html?lang=zh-cn" class="md-button md-button--primary">:octicons-arrow-right-24: 开始游戏</a>

## 怎么玩

画面上浮着的球是中继，颜色代表它所在的 ASN。依序点三个，就会照点选顺序组成 guard、middle、exit 三跳，再点一次可以取消。拖曳能旋转视角，滚轮或双指缩放。挑好之后按「发送消息」，消息会沿着你画出的路径走一遍。

![选好三跳之后的画面，一条曲线从发件端串过三个中继连到收件人，下方显示台湾 AS3462、日本 AS2914、荷兰 AS16276](https://assets.anoni.net/games/onion-routing-path-zh-cn.webp){style="border-radius: 10px;"}

下方三格会显示每一跳落在哪里与它的 ASN。三跳都填满才发得出去，路径不合规则的话会挡下来并说明原因。

## 四个关卡在教什么

### 关卡 1：三跳的基本

任意 3 台都算合法，先熟悉操作。Tor 的默认电路长度就是 3 跳，这个数字在匿名性与延迟之间取平衡：少一跳，入口与出口之间少一层隔离。多一跳，延迟增加而匿名性没有等比例提升。

### 关卡 2：避开监听

盘面上出现红色的中继，代表已知被监听。挑一条完全避开红色的路径。实际的 Tor 没有这种明确标记，目录服务器只会标记行为异常或已知有害的中继，一般用户看不到「这台正在被谁监看」。这一关把那个信息直接画出来，方便先建立「路径上每一站都看得到一部分」的直觉。

### 关卡 3：三跳要分散到不同 ASN

![三跳全挑了台湾的中继，三格都显示台湾 AS3462，下方红字说明这 3 跳没有分散到 3 个不同的 ASN](https://assets.anoni.net/games/onion-routing-asn-zh-cn.webp){style="border-radius: 10px;"}

同色代表同一个 ASN。ASN 是自治系统（Autonomous System），可以粗略理解成一个组织或个人掌管的一段网络。三跳落在同一个 ASN 的话，对手只要盯住那一个 ASN，就同时看得到入口与出口的流量，中间绕了几站都没有意义。

文档写「三跳要分散在不同 ASN」，读过就过去了。自己选一次、被挡一次，下次就会记得原因。真实的 Tor 客户端默认会避开同一个 `/16` 网段与同一个 family 的中继，实际的判断比这一关严格。

### 关卡 4：封锁时走网桥

![关卡 4 的盘面，两个中继被红圈标记为封锁，左侧出现两个菱形的网桥节点](https://assets.anoni.net/games/onion-routing-bridge-zh-cn.webp){style="border-radius: 10px;"}

直连的入口被封锁了，画面上用红圈标出来，第一跳必须改用菱形的网桥节点。网桥是没有公开在目录里的入口，封锁方拿不到完整清单，所以挡不干净。盘面上两个网桥分别标了 Snowflake 与 obfs4，那是两种 pluggable transport，差别在于流量伪装成什么样子。

## 跟真实的 Tor 差在哪

这是一个解谜，不是模拟器。几个刻意简化的地方：

- 真实的选路由客户端自动完成，用户不会逐台挑。guard 还会固定使用数个月，减少反复更换入口带来的曝险
- 盘面上一关只有五到八台中继，实际的网络有近万台
- 中继的带宽与共识权重会影响被选中的概率，这里没有模拟
- 「被监听」在画面上是明确标记，实务上没有这种提示

三个语言版本共用同一份程序，语言由网址参数决定，作品内也可以直接切换。

## 延伸阅读

- 三跳路由与匿名原理：[什么是 Tor](../tools/what-is-tor.md)
- 中继分散与 ASN：[台湾 ASN 观测覆盖](../taiwan/ooni-asn-coverage.md)
- 封锁时的网桥：[Tor Snowflake 网桥](../tools/tor-snowflake.md)
- 其他两件作品：[互动与呈现](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "VideoGame",
      "@id": "https://anoni.net/docs/games/onion-routing/#work",
      "name": "Tor 路由解谜",
      "alternateName": ["Tor Routing Puzzle", "Tor 路由解謎"],
      "url": "https://anoni.net/docs/games/onion-routing/play/?lang=zh-cn",
      "mainEntityOfPage": "https://anoni.net/docs/zh-cn/games/onion-routing/",
      "description": "可操作的解谜。自行挑选 3 个中继组成 Tor 的 guard、middle、exit 路径，避开被监听的节点、将 3 跳分散到不同 ASN，遇到封锁则改走网桥。四个关卡各对应一项真实的选路考量。",
      "image": "https://assets.anoni.net/games/onion-routing.png",
      "inLanguage": ["zh-Hans", "zh-Hant", "en"],
      "genre": ["解谜", "教育"],
      "applicationCategory": "GameApplication",
      "gamePlatform": "Web browser",
      "playMode": "SinglePlayer",
      "browserRequirements": "需要支持 WebGPU 或 WebGL2 的浏览器，免安装",
      "isAccessibleForFree": true,
      "isFamilyFriendly": true,
      "license": "https://github.com/anoni-net/docs/blob/main/LICENSE",
      "author": { "@id": "https://anoni.net/#organization" },
      "publisher": { "@id": "https://anoni.net/#organization" },
      "isPartOf": { "@id": "https://anoni.net/docs/games/#collection" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "文档", "item": "https://anoni.net/docs/zh-cn/" },
        { "@type": "ListItem", "position": 2, "name": "互动与呈现", "item": "https://anoni.net/docs/zh-cn/games/" },
        { "@type": "ListItem", "position": 3, "name": "Tor 路由解谜" }
      ]
    }
  ]
}
</script>
