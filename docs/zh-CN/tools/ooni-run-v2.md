---
title: OONI Run v2 操作说明
icon: material/help-network
description: 如何建立动态的 OONI Probe 检测名单，协助观察特定网站是否被审查或封锁。
---

# :material-help-network: OONI Run v2 操作说明

![OONI RUN v2 Header](https://assets.anoni.net/docs/ooni-run-v2-header.png){.brand-frame}

你想追踪一批网站是否被特定地区封锁，但又无法亲自到当地测试。OONI Run v2 的解法是：建立一个移动装置链接、把要测的网站列进去、分享给当地协助者，协助者用 [OONI Probe](https://ooni.org/install/mobile){target="_blank"} 开启链接就能跑测试，结果即时上传到 [OONI](./what-is-ooni.md) 的公开数据库。

[OONI Run](https://run.ooni.org/){target="_blank"} 是这个流程的入口。委内瑞拉、马来西亚、印度等地的社群长期[用它做审查测量活动](https://ooni.org/support/ooni-censorship-measurement-campaigns#examples-of-ooni-censorship-measurement-campaigns){target="_blank"}，把当地的封锁事件即时观测下来。OONI 团队在 2020 年根据[可用性研究](https://ooni.org/post/2020-06-09-ooni-run-usability-study-findings/){target="_blank"}的社群回馈推出 v2，链接变短、可动态更新、协助者已安装过就会自动同步新加的网站，不用重发。测量结果可以直接在 [OONI Explorer](https://explorer.ooni.org/zh-Hans){target="_blank"} 用链接 ID 搜寻。

## OONI Run v2 适合谁

OONI Run 适合需要追踪特定网站封锁状况的人：研究员针对个案做纵贯观察、记者要为其他国家的封锁事件取证、倡议者组织社群驱动的检测活动。透过 OONI Run，你可以**分享一个移动装置链接，让协助者用 OONI Probe 测试你选定的网站是否被审查**，测试结果会即时上传到 OONI 的公开数据库。

跟 v1 比，v2 的链接更短、更容易分享，也可以自定义链接要呈现给协助者的资讯。建立链接后，登录 OONI Run v2 平台就能编辑，把你想加进来的网站直接更新到既有链接，**不必另发一条新链接**。协助者只要在 OONI Probe 移动 App 内安装过你的链接，后续的更新会自动同步，链接内的网站也会持续被测试，覆盖量会随时间累积。所有测量结果即时公开在 OONI Explorer 上。

下面是建立、分享、使用、查看资料的完整流程。

## anoni.net 如何使用

社群维运的 OONI Run 链接 ID 是 `10328`，网址 [run.ooni.org/v2/10328](https://run.ooni.org/v2/10328){target="_blank"}，目前纳入 anoni.net 的官网、Cryptpad、Etherpad、SearXNG、Send、Matrix 与 docs 站。协助者用 OONI Probe 安装这条链接后，每次跑测试都会把这几个自架服务的可达性回传到 OONI 公开数据库。对社群来说，这是长期确认「我们的服务在台湾不同电信商眼中还连得上」的低成本方式。

链接之外，[OONI 网站检测清单](../taiwan/ooni-checklist.md) 整理了台湾脉络下值得长期观测的网站清单，配套的 [ASNs 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md) 把 OONI 全部结果按 ASN 切开，看不同电信商连到不同国际服务的状况。如果你想协助跑这条链接的测试，移动装置安装 OONI Probe 后点上面的网址即可。

## 你应该知道的事

建立或分享 OONI Run 链接之前，了解以下几点会更安心：

- **建立者的 email 会跟链接绑定**。OONI 用建立者的 email 作为协助者识别链接来源的依据，你的 email 会显示在链接卡片上，后端也会储存。
- **测试结果完全公开**。所有测量会出现在 [OONI Explorer](https://explorer.ooni.org/){target="_blank"}，含协助者所在的 ASN 与时间戳。OONI 不公开个人 IP，但 ASN 加时间已可推断协助者大致位置。
- **不要随便把链接传给高审查地区的协助者**。运行 OONI Probe 在某些地区可能违法或引起 ISP 注意，当地是否能安全运行请先评估。
- **VPN、Tor 同时开不会得到「当地的」测试结果**。OONI 测量的是测试装置实际走的网络，VPN 开着会测到 VPN 业者所在地的网络，不是协助者本地的封锁状况。
- **链接到期后资料仍保留**。OONI Run 链接是分发机制，到期后协助者就无法再加入测试，但已收集的测量资料留在 OONI 公开数据库永久保存。

要更系统地评估这些风险，可参考 [威胁模型如何建立](../basics/threat-model.md)。

## 操作说明

### 建立和分享链接

要开始使用 OONI Run v2，请连结到 OONI Run 网站：<https://run.ooni.org/>{target="_blank"}

你可以透过以下步骤来建立和分享 OONI Run v2 链接。

![取得 Log in 链接](https://assets.anoni.net/docs/ooni-run-v2-1.png){.brand-frame}

* **步骤 1.** 点击「**Log In To Create OONI Run Link**」按钮。
* **步骤 2.** 在电子邮件栏位中填入你的电子邮件地址。
* **步骤 3.** 点击「**传送链接给我**」按钮。

!!! info "关于电子邮件地址"

    当你登录时，OONI 网站不会储存电子邮件地址，只有在你建立 OONI Run 链接时才会储存。OONI 网站储存你的电子邮件地址，这样当 OONI Probe 用户收到你发送的 OONI Run 链接时，可以根据你的电子邮件地址来信任该链接（这会显示在你建立的 OONI Run 链接中），有助于降低执行恶意链接的风险。

送出后请到信箱中找到 OONI 团队寄来的信件：

``` txt
寄件人：admin@ooni.org
收件人：me
标题：OONI Account activation email

Welcome to OONI

**Please login here**

The link can be used on multiple devices and will expire in 24 hours.
```

* **步骤 4.** 点击发送到你电子邮件中的链接「**Please login here**」来登录 OONI Run v2 平台。登录 OONI Run 平台后，可以在「**Create OONI Run Link**」页面开始建立 OONI Run v2 链接。

![取得 Log in 链接](https://assets.anoni.net/docs/ooni-run-v2-2.png){.brand-frame}

你可以随意的透过挑选图标、颜色来自定义你的 OONI Run 链接。并完成页面中必要的资料栏位填写。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-4.png" alt="填写标题、说明文字" style="width:80%">
</figure>

* **步骤 5.** 为你的 OONI Run 链接建立一个标题。你也可以选择性地为你的标题增加翻译。「标题」将会显示在测试者安装于其 OONI Probe 移动应用程序内的 OONI Run 链接卡片中。建议使用一个简短且能清晰传达测试类型的标题。在上述范例中，我们将标题设为「**匿名网络社群 anoni.net**」，因为我们希望在 OONI Run 链接中纳入社群所建立的服务网站进行测试。
* **步骤 6.** 为你的 OONI Run 链接新增一个简短的描述。你也可以选择性地增加多语言的翻译。在上述范例中，我们已指定计划新增到 OONI Run 链接中的网站服务，并请求 OONI Probe 移动应用程序用户进行测试。我们建议具体标明测试的平台或新增其他有用的内容，以鼓励进行测试。
* **步骤 7.** 为你的 OONI Run 链接新增一个「较长的」描述。透过这样的方式来详细说明测试内容，以及为什么这些测试很重要。你也可以选择性地增加翻译。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-5.png" alt="新增到期日期、检测网址" style="width:80%">
</figure>

* **步骤 8.** 为你的 OONI Run 链接新增一个到期日期（Expiration Date）。根据你希望 OONI Probe 用户执行你的 OONI Run 链接的时间长度来决定到期日期。
* **步骤 9.** 点击「Add URL+」来开始将网址加入你的 OONI Run 链接。在开始增加网址之前，请确保每个网址输入正确。如果输入错误，OONI Probe 将无法测试预期的网站，这可能会导致测试结果不准确。

    ??? warning "网址格式"

        有几点需要注意：

        * 网站是使用 **HTTP** 还是 **HTTPS**？如果是后者，请在 `http` 后加一个 `s`。
        * 域名是否包含 `www`？如果有，请一并加上。
        * 如果网站是使用 HTTPS（例如：`https://www.hrw.org/`），你不需要指定网页（例如：`https://www.hrw.org/publications`），因为当网站使用 HTTPS 托管时，互联网服务提供商（ISP）通常无法只封锁特定网页。他们必须封锁整个网站的存取。

        为了确保每个网址输入正确，**请从浏览器中复制贴上**。

        建议可以**在文字编辑器中建立一个网站清单**，将每个网址分别写在单独一行。不需要用逗号或其他方式分隔网址。全选复制所有内容后，在第一个网址栏位贴上，表格会自动处理协助分别、分开、依序贴到多个栏位中。

* **步骤 10.** 点击「**Create link**」按钮，来建立你的 OONI Run 链接。将看到 OONI Run 链接页面，其中包括你新增的标题和描述、链接的到期日期，以及你新增的待测试网址清单。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-6.png" alt="建立完成的 OONI Run 链接页面">
</figure>

* **步骤 11.** 如果你想编辑你的 OONI Run 链接，请点击右上角的「Edit」按钮。或者，点击链接到期日期旁的「**Update Now**」按钮。这两种操作都能让你编辑你的 OONI Run 链接中的资料。
* **步骤 12.** 要**分享**你的 OONI Run 链接，在「**Share this link**」部分，点击你的 OONI Run 链接旁的「**:material-content-copy: 复制图标**」。然后将复制的链接分享给你想要进行测试的 OONI Probe 用户。

### 使用链接

![分享、安装页面](https://assets.anoni.net/docs/ooni-run-v2-7.png){.brand-frame}

在建立页面完成后取得的 <https://run.ooni.org/v2/10328>{target="_blank"} 链接，可以直接透过分享给协助者，透过链接可以带到一个简单的介绍页面，如果检测者没有安装 OONI Probe，页面的链接也会协助他们前往应用程序商店下载、安装。

对于有安装 OONI Probe 的协助者，则会开启 OONI Probe 应用程序，进入到询问是否加入此检测项目的徵询流程，按下「Install Link」确认安装。在安装前，请确认此检测名单的建立者是否正确无误。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-m1.png" alt="移动装置上的 Install Link 徵询画面" style="width:50%">
</figure>

透过 OONI Probe 安装完成后，在「仪表板」列表中可以找到标题为「**匿名网络社群 anoni.net**」的检测卡片。进入卡片后可以按下上方「**执行 :material-timer-outline:**」的按钮后，画面移动到最下方按下「**Run 1 tests**」的按钮开启执行检测。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-m2.png" alt="OONI Probe 仪表板上的检测卡片与执行按钮" style="width:50%">
</figure>

### 用 miniooni CLI 跑检测

移动装置之外，OONI 也有命令行版本 [miniooni](https://github.com/ooni/probe-cli){target="_blank"}，方便在服务器、研究脚本或自动化环境跑检测。把 OONI Run v2 链接喂给 CLI 有个容易踩到的雷，**不能直接把网页版的网址丢给 `-i`**。

```bash
# 不会 work，CLI 拿到 HTML，JSON 解析就会失败
miniooni oonirun -i https://run.ooni.org/v2/10328

# 正确用法，直接指向 API 的 descriptor JSON
miniooni oonirun -i https://api.ooni.org/api/v2/oonirun/links/10328
```

原因是 miniooni 的 `-i` 会把你给的网址当成 descriptor JSON 端点直接 GET，期望拿到 JSON 回来。`run.ooni.org/v2/<ID>` 是给浏览器看的网页，响应是 HTML，CLI 解析就会失败。实际的 descriptor 由 API 提供，网址格式为 `https://api.ooni.org/api/v2/oonirun/links/<LINK_ID>`，`<LINK_ID>` 直接从网页网址末段获取（社群链接为 `10328`）。

桌面版与移动 App 不受这个限制影响，操作系统会把 `https://run.ooni.org/v2/<ID>` 交给 OONI Probe 自行处理。这个限制目前只影响 miniooni CLI，upstream 已有 [TODO 标注](https://github.com/ooni/probe-cli/blob/master/internal/oonirun/link.go){target="_blank"}，后续可能会补上自动转换。

## 观察资料

所有的检测资料最后都会上传到 OONI 的公开数据库中，在 [OONI Explorer](https://explorer.ooni.org/zh-Hans/chart/mat?test_name=web_connectivity&axis_x=measurement_start_day&since=2025-09-01&until=2025-10-16&time_grain=day&ooni_run_link_id=10328){target="_blank"} 的搜寻接口中，可以直接在「OONI Run Link ID」栏位输入分享链接的编号，例如范例为 `https://run.ooni.org/v2/10328`，其编码为 `10328`，就可以输入此编码搜寻协助者的检测结果。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-8.png" alt="OONI Explorer 用 OONI Run Link ID 搜寻的结果">
</figure>

可以透过图表上的「[检视测量资料 >](https://explorer.ooni.org/search?since=2025-09-15&until=2026-04-16&test_name=web_connectivity&failure=true&ooni_run_link_id=10328){target="_blank"}」，输入 `10328` 后看到每一笔检测结果的详细资料。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-9.png" alt="OONI Explorer 列出每一笔检测结果的详细资料">
</figure>

## 常见问题

??? question "名单更新后，需要重新发布吗？"

    当更新名单后，之前已经安装的用户不需要重新安装，在开启 OONI Probe 应用程序的时候会检查 OONI Run 的名单并完成更新。

??? question "可以开着 VPN 执行 OONI Probe 吗？"

    不建议在开启 VPN 的情况下执行 OONI Probe。这是因为在使用 VPN 执行测试时，所测量的将不再是您本地的网络环境，而是 VPN 提供者的网络。如要捕捉当地用户的网络审查情况，您需要在执行 OONI Probe 测试前关闭 VPN 或其他翻墙软件。

??? question "如果检测出来发现网站有问题，我还可以做什么？"

    如果你透过 OONI Probe 检测发现网站有问题，可以采取以下步骤：

    1. 确认问题：使用 [OONI Explorer](https://explorer.ooni.org/zh-Hans){target="_blank"} 进一步调查，查询具体的测量结果，了解该网站是否已被确认封锁或出现异常情况。
    2. 分析结果：根据测量结果分析问题类型，看是否是暂时性的网络问题或是内容审查所导致。
    3. 分享测试结果：考虑将你的测试结果分享给 [OONI 社群](https://slack.ooni.org/){target="_blank"}和[其他](../about/index.md){target="_blank"}关注**网络自由**的组织，帮助更多人了解问题的范围和严重性。
    4. 报告问题：若确认为网络封锁，你可以向相关监督机关或法律顾问反映问题，探索进一步的合法行动。
    5. 尝试解决方法：如果你需要访问该网站，可尝试透过 VPN 换区域、Tor 浏览或其他绕过审查的方法来解决访问限制问题。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 网络自由为什么重要](../basics/internet-freedom.md)
- [:material-chat-question: 什么是 OONI？](./what-is-ooni.md)
- [:material-chat-question: 什么是 Tor？](./what-is-tor.md)
- [:material-snowflake: Tor Snowflake](./tor-snowflake.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-list-status: OONI 网站检测清单](../taiwan/ooni-checklist.md)
- [:material-access-point-network: ASNs 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)

</div>
