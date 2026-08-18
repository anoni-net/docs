---
title: Tor 连线流量
description: 以观看为主的呈现。用发光粒子与残影表现 Tor 流量的两种路径，连线 .onion 服务时双方各建一条 3 跳电路在会合点相遇，连线明网网站则经 3 跳出口后原路往返。
icon: material/lan
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/onion-rendezvous-zh-cn.png
  image_width: 2560
  image_height: 1440
---

# :material-lan: Tor 连线流量

![Tor 连线流量的画面，多条发光曲线在深色背景中交织，白色的会合点与红色的有害节点散布其间](https://assets.anoni.net/games/onion-rendezvous-flow-zh-cn.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

不用操作也能看的一件作品。画面上呈现的是 Tor 的两种流量路径，用细小的发光粒子与残影画出来，看得出数据包在哪几站之间移动。

<a href="../../games/onion-rendezvous/play/index.html?lang=zh-cn" class="md-button md-button--primary">:octicons-arrow-right-24: 开始观看</a>

## 两种路径

两种流量都走 3 跳中继，差别在后半段。

连线 .onion 服务时，你和服务各自建一条 3 跳电路，在随机挑出的会合点相遇，全程共 6 跳。会合点只负责转发，看不到双方交换的内容，两边也都不知道对方的真实位置。画面上这一种是你的电路走青色、服务的电路走紫色，交会的那个白点就是会合点。

连线明网网站时只有一条电路。你走 3 跳到出口，出口直接连上网站，响应再原路传回。画面上这一种走绿色，回程带亮头的彗星代表响应正在传回。

红色的是已经被标记的有害节点，电路会绕开它们。

## 可以调的四项

左下角的滑杆实时生效，改了画面立刻跟着变：

- **relay 节点**：场上有几台中继可选
- **电路数**：同时有几条连线在运行
- **有害节点**：红色节点的数量，看电路怎么绕
- **流量**：粒子的密度与速度

点画面任一处会多加一条连线，拖曳可以平移，滚轮或双指缩放。

## 跟真实的 Tor 差在哪

作品内的说明区也列了同一份，这里整理成三点。

介绍点被省略了。实际上服务会先把介绍点清单发布出去，你连线前要先查到这份清单，挑好会合点，再透过介绍点悄悄告知服务。画面为了干净，把介绍点与查询的过程整段拿掉。

每条连线的 3 跳都重新抽选。实际使用时你的入口节点（Guard）会固定用上数周才换，只有中间与出口经常变动。画面上全部重抽是为了同时呈现很多条。

红色节点代表已经被标记出问题的中继。真实的 Tor 选路径只排除已经被标记的节点，还没被抓到的恶意中继一样可能被选中。Tor 的安全靠的是把路径拆开，让任何一方都无法同时看到你是谁与你在连什么。

## 延伸阅读

- 三跳路由与匿名原理：[什么是 Tor](../tools/what-is-tor.md)
- 封锁时的网桥：[Tor Snowflake 网桥](../tools/tor-snowflake.md)
- 其他两件作品：[互动与呈现](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://anoni.net/docs/games/onion-rendezvous/#work",
      "name": "Tor 连线流量",
      "alternateName": ["Tor Traffic Flow", "Tor 連線流量"],
      "url": "https://anoni.net/docs/games/onion-rendezvous/play/?lang=zh-cn",
      "mainEntityOfPage": "https://anoni.net/docs/zh-cn/games/onion-rendezvous/",
      "description": "以观看为主的呈现。用发光粒子与残影表现 Tor 流量的两种路径，连线 .onion 服务时双方各建一条 3 跳电路，在随机挑出的会合点相遇。",
      "image": "https://assets.anoni.net/games/onion-rendezvous-zh-cn.png",
      "inLanguage": ["zh-Hans", "zh-Hant", "en"],
      "applicationCategory": "EducationalApplication",
      "browserRequirements": "需要支持 WebGPU 或 WebGL2 的浏览器，免安装",
      "isAccessibleForFree": true,
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
        { "@type": "ListItem", "position": 3, "name": "Tor 连线流量" }
      ]
    }
  ]
}
</script>
