---
title: 互动与呈现：Tor 网络的 3D 可视化与互动游戏
description: 以 3D 影像与可操作的游戏呈现隐私与匿名技术。目前三件作品都以 Tor 为题：走一遍三跳洋葱路由的解谜、连线流量在会合点相遇的动态呈现、整合十余份公开数据的全球中继地球仪，后者放大到台湾还有海缆登陆点与电网。
icon: material/cube-outline
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network-zh-cn.png
  image_width: 2560
  image_height: 1440
---

# :material-cube-outline: 互动与呈现

这一区收录可以操作、或单纯观看的 3D 作品，将隐私与匿名技术的概念转为可见、可点选的画面。全部以 three.js（WebGPU/TSL）在浏览器中运行，免安装，桌机与移动设备都能使用。目前三件作品都以 Tor 为题，后续会延伸到其他隐私主题。

## 作品

三个作品都支持简体中文界面。三个语言版本共用同一份程序，语言由网址参数决定。

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor 路由解谜__

    ---

    可操作的解谜。将消息从你送到对岸的收件人，自行挑选 3 个中继组成 Tor 的 guard → middle → exit 路径，过程中要避开被监听的节点、将 3 跳分散到不同 ASN，遇到封锁则改走网桥。四个关卡各对应一项真实的选路考量。

    [:octicons-arrow-right-24: 看说明](onion-routing.md){ .md-button .md-button--primary }
    <a href="../../games/onion-routing/play/index.html?lang=zh-cn" class="md-button">开始游戏</a>

-   :material-lan:{ .lg .middle } __Tor 连线流量__

    ---

    以观看为主的呈现。用细小发光粒子与残影表现 Tor 流量的两种路径：连线 .onion 服务时双方各建一条 3 跳电路，在随机挑出的会合点相遇，连线明网网站则经 3 跳出口后原路往返。relay 数、电路数、已被标记的有害节点、流量都能实时调整。

    [:octicons-arrow-right-24: 看说明](onion-rendezvous.md){ .md-button .md-button--primary }
    <a href="../../games/onion-rendezvous/play/index.html?lang=zh-cn" class="md-button">开始观看</a>

-   :material-earth:{ .lg .middle } __Tor 中继地球仪__

    ---

    以真实数据构成的地球仪。将全球正在运作的近万台 Tor 中继落在各自的国界之内，颜色区分 guard、middle、exit，大小对应带宽，陆地亮度依指标上色。除了中继分布，另外整合连线受阻观测、用户估计、断网事件、海底电缆与上网人口。放大到台湾会再多出县市界、海缆登陆点、变电站、发电厂与电网。

    [:octicons-arrow-right-24: 看说明](tor-network.md){ .md-button .md-button--primary }
    <a href="../../games/tor-network/play/index.html?lang=zh-cn" class="md-button">开始探索</a>

</div>

## 为什么做成影像与游戏

文字擅长定义与论证，却说不清楚两件事：顺序，还有规模。

顺序的部分，Tor 本身就是最好的例子。数据包在三个中继之间依序前进，每经过一跳剥除一层加密，到出口才还原成原本的请求。连线 .onion 服务时还多一层，双方各建一条电路，在中途某台中继相遇之后才开始交换内容。哪一层在哪一跳剥掉、每一站看得到什么，都由这个顺序决定。文字写得再仔细，读者脑中仍然要自行补上动起来的那一段，而每个人补出来的版本未必相同。动画把那一段直接演示出来。

规模更难用文字传达。「近万台中继，高度集中在少数国家」读过即忘。把每一台实际标记到地球上，北美与西欧连成一片光带、其余地区仅零星数点，集中的程度就成为可以目视的事实。同一份数字换成画面，读者不必信任我们的形容词，可以自己看。

游戏补的是第三件事：取舍。ASN 是自治系统（Autonomous System），可以粗略理解成一个组织或个人掌管的一段网络。文档写「三跳要分散在不同 ASN」，读过就过去了。自行挑选三台中继送出消息，看着电路因为三跳落在同一个 ASN 而失败，下一次就会记得分散的理由。

这些作品是入口，没有要取代文档。先把抽象概念变得具体，需要细节时可以点链接回到文档，每件作品在完成或结束时都会提供对应的延伸阅读。

## 想先阅读文字版

以下三篇对应目前作品中出现的概念。

- 三跳路由与匿名原理：[什么是 Tor](../tools/what-is-tor.md)
- 中继要分散在不同 ASN：[台湾 ASN 观测覆盖](../taiwan/ooni-asn-coverage.md)
- 封锁时的网桥：[Tor Snowflake 网桥](../tools/tor-snowflake.md)

## 想一起做

三件作品的源代码都在 [anoni-net/docs](https://github.com/anoni-net/docs) 这个 repo，位置是 `docs/zh-TW/games/`，三件加起来约六千三百行 JavaScript，其中地球仪占了四千三百行。没有构建流程，浏览器直接加载 ES module，改完保存刷新就看得到。three.js 是本地 vendor 的版本，onion 与 IPFS 版本都不依赖外部 CDN。

站上的文档内容采用 [CC BY 4.0](https://github.com/anoni-net/docs/blob/main/LICENSE)，这三件作品的源代码放在 `docs/` 底下，同样适用这份许可。地球仪用到的外部数据各自沿用原本的许可，清单在 repo 根目录的 `NOTICE`，其中 OONI 那一份是 CC BY-NC-SA 4.0，禁止商业使用。

会 JavaScript 就能改文案、关卡设计与互动逻辑，动到画面呈现则需要一些 three.js 或 WebGPU 的经验。产生数据的十四支 `gen_*.py` 在 `tools/` 底下，只用 Python 标准库加 curl，不引入 GIS 套件，连县市界的 SHP 都是用 `struct` 自己解的。同一个目录另有四支回归测试，把函式从 `atlas.js` 原地抽出来重放事件或开 headless Chrome 量版面，改到相关的地方时 CI 会执行它们。另有修正海缆走廊坐标的辅助脚本与发布数据用的 shell 脚本，都不需要额外安装套件。

## 接下来

这是互动区的头三件作品，主题集中在 Tor。隐私领域中值得做成画面的题材仍然很多，元数据会泄漏什么、威胁模型如何随处境改变、匿名支付的资金流样貌，都在候补名单上。有想法或想一起参与，欢迎到[社群](../community/index.md)找我们。

<!-- 结构化数据。三件作品的 index.html 不经 mkdocs 模板，各自在 head 写了自己的
     JSON-LD，并用 isPartOf 指向 zh-TW 的 #collection。这一段把三件作品列成
     ItemList。@id 必须与各作品 index.html 里的一致。 -->

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://anoni.net/docs/zh-cn/games/#collection",
      "name": "互动与呈现",
      "url": "https://anoni.net/docs/zh-cn/games/",
      "description": "以 3D 影像与可操作的游戏呈现隐私与匿名技术。目前三件作品都以 Tor 为题，其中地球仪整合十余份公开数据。",
      "inLanguage": "zh-Hans",
      "publisher": { "@id": "https://anoni.net/#organization" },
      "mainEntity": { "@id": "https://anoni.net/docs/zh-cn/games/#works" }
    },
    {
      "@type": "ItemList",
      "@id": "https://anoni.net/docs/zh-cn/games/#works",
      "name": "作品",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "VideoGame",
            "@id": "https://anoni.net/docs/games/onion-routing/#work",
            "name": "Tor 路由解谜",
            "url": "https://anoni.net/docs/games/onion-routing/?lang=zh-cn",
            "image": "https://assets.anoni.net/games/onion-routing-zh-cn.png",
            "description": "可操作的解谜。自行挑选 3 个中继组成 Tor 的 guard、middle、exit 路径，避开被监听的节点、将 3 跳分散到不同 ASN，遇到封锁则改走网桥。"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "WebApplication",
            "@id": "https://anoni.net/docs/games/onion-rendezvous/#work",
            "name": "Tor 连线流量",
            "url": "https://anoni.net/docs/games/onion-rendezvous/?lang=zh-cn",
            "image": "https://assets.anoni.net/games/onion-rendezvous-zh-cn.png",
            "applicationCategory": "EducationalApplication",
            "description": "以观看为主的呈现。用发光粒子与残影表现 Tor 流量的两种路径，连线 .onion 服务时双方各建一条 3 跳线路，在随机挑出的会合点相遇。"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "WebApplication",
            "@id": "https://anoni.net/docs/games/tor-network/#work",
            "name": "Tor 中继地球仪",
            "url": "https://anoni.net/docs/games/tor-network/?lang=zh-cn",
            "image": "https://assets.anoni.net/games/tor-network-zh-cn.png",
            "applicationCategory": "EducationalApplication",
            "description": "以真实数据构成的地球仪。将全球正在运行的近万台 Tor 中继落在各自的国界之内，另外整合连线受阻观测、用户估计、断网事件、海底电缆与上网人口，放大到台湾还有县市界、海缆登陆点、变电站、发电厂与电网。"
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "文档", "item": "https://anoni.net/docs/zh-cn/" },
        { "@type": "ListItem", "position": 2, "name": "互动与呈现" }
      ]
    }
  ]
}
</script>
