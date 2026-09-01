---
title: Windows 安全更新
description: Windows 每月更新的白话整理，说明这个月有没有正在被利用的漏洞、影响的是桌面还是服务器，以及需不需要马上更新。
icon: material/microsoft-windows
---

# :material-microsoft-windows: Windows 安全更新

Windows 每月更新的整理。微软固定在每月第二个星期二发布（社群惯称 Patch Tuesday），单月的 CVE 数以千计，2026 年 8 月那一轮有 1506 个。

那个数字涵盖微软整个产品线，跟桌面 Windows 直接相关的只是其中一小部分。8 月的 1506 个里，Windows 本体占 248 个，Azure Linux（Mariner，用在云端与容器）占 698 个，从 Chromium 转载的 Edge 漏洞占 362 个，其余是别的微软产品。看到「单月上千个漏洞」的说法时，要先知道这件事。

这一页只回答三个问题：这个月有没有正在被实际利用的漏洞、那些漏洞影响桌面还是服务器、需不需要马上更新。新版本永远在最上面。

原始数据来自微软的 [MSRC 安全更新指南](https://msrc.microsoft.com/update-guide){target="_blank"}，数字是从它的 CVRF 数据整理的。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>该月有标为已被实际利用的漏洞，且影响范围包含桌面版 Windows。
- <span class="urg-tag urg-tag--soon">尽快</span>有标为已被实际利用的漏洞，但只影响服务器产品或自动更新的组件。桌面用户跟着平常节奏即可，管理服务器的人优先处理。
- <span class="urg-tag urg-tag--routine">一般</span>该月没有已被利用的项目。

微软自己有标 `Exploited:Yes`，这一页的分级就建立在那个字段上，再加一层「影响谁」的判断。

要注意这一页的「尽快」也可能代表已经有人在利用，只是打不到桌面用户。看到琥珀色不要理解成「还没有人在用」，那一级的证据有时候比其他页面的「立刻」更硬，差别在关不关你的事。判断不确定时以较高一级为准。

## 先看清楚受影响的是哪一种产品

每个月被实际利用的漏洞里，很大一部分落在 SharePoint、Exchange、Active Directory Federation Services 这类服务器产品上。用一般桌面 Windows 的读者不受那些影响，看到新闻标题写「微软修补正在被利用的重大漏洞」不必先紧张，要先确认的是那个漏洞在什么产品上。

另一个常见的误会是 Microsoft Defender。它的漏洞修补走的是杀毒定义文件的自动更新，不跟着 Patch Tuesday，也不需要用户做任何事。

在 Windows 上使用 Tor Browser 或其他匿名工具的人另外要知道：操作系统被取得权限之后，上面运行的任何工具都保护不了你。提权（让程序取得比原本更高的系统权限）类的修补对这个情境的重要性不亚于浏览器本身的漏洞。

## 2026 年 8 月

> 2026-08-11 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>1506 个 CVE（Windows 本体 248 个），134 个被评为 Critical，一个标为已被实际利用。
- CVE-2026-68820：WinSock 的辅助功能驱动程序（Ancillary Function Driver）提权。影响 Windows 10 1607 以后的桌面版与 Windows Server 2012 以后，范围一路涵盖到现行版本，还在用旧机的人不要以为与自己无关。
- 提权类漏洞的典型用法是接在别的漏洞后面，先从浏览器或文档取得执行机会，再用它取得系统权限。单独看它需要本机执行条件，串起来就是完整的接管。

## 2026 年 7 月

> 2026-07-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>2003 个 CVE（Windows 本体 439 个），是这五个月里最大的一轮，106 个被评为 Critical，三个标为已被实际利用。一般桌面用户不受那三个影响，管理服务器的人要优先处理。
- 三个都在服务器产品上：Active Directory Federation Services 提权、SharePoint Server 提权、SharePoint 远程执行代码。微软的受影响清单里，AD FS 那个也列了桌面版的 build，因为它们共用同一份文件，而 AD FS 这个角色只存在于服务器，桌面版没有可利用的路径。
- 桌面用户不受这三个影响。管理 SharePoint 或 AD FS 的人要优先处理，SharePoint 的远程执行代码是不需要凭证就能触发的那一类。

## 2026 年 6 月

> 2026-06-09 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>1284 个 CVE（Windows 本体 123 个），82 个被评为 Critical，没有标为已被实际利用的项目。
- Critical 的数量高不代表紧急。微软的严重度评的是「如果被利用会多严重」，跟「有没有人在用」是两回事，这一页的分级看的是后者。这里的 Critical 数以相异 CVE 计，微软原始数据是每个受影响的产品各记一笔，直接数会膨胀成好几倍。

## 2026 年 5 月

> 2026-05-12 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>1129 个 CVE（Windows 本体 74 个），58 个被评为 Critical，三个标为已被实际利用。一般桌面用户这个月跟着平常节奏即可，三个都打不到你。
- 两个在 Microsoft Defender 的防护引擎上（拒绝服务与提权），走定义文件自动更新，用户不需要做任何事。
- 一个是 Exchange Server 的伪冒漏洞，只影响自建 Exchange 的组织。

## 2026 年 4 月

> 2026-04-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>682 个 CVE（Windows 本体 139 个），32 个被评为 Critical，两个标为已被实际利用。
- CVE-2026-32202：Windows Shell 的伪冒漏洞，影响 Windows 10 1607 以后的桌面版与 Windows Server 2012 以后。Shell 是文件资源管理器与快捷方式处理的那一层，伪冒类问题让恶意文件在界面上看起来像正常的东西。
- 另一个是 SharePoint Server 的伪冒漏洞，只影响服务器。
