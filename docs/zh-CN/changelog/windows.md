---
title: Windows 安全更新
description: Windows 每月更新的白话整理，说明这个月有没有正在被利用的漏洞、影响的是桌面还是服务器，以及需不需要马上更新。
icon: material/microsoft-windows
---

# :material-microsoft-windows: Windows 安全更新

Windows 每月更新的整理。微软固定在每月第二个星期二发布（社群惯称 Patch Tuesday），单月的项目数以千计，2026 年 8 月那一轮就有 1506 项，其中 359 项是从 Chromium 转载过来的 Edge 漏洞。逐条读完不可能，也没有必要。

这一页只回答三个问题：这个月有没有正在被实际利用的漏洞、那些漏洞影响桌面还是服务器、需不需要马上更新。新版本永远在最上面。

原始数据来自微软的 [MSRC 安全更新指南](https://msrc.microsoft.com/update-guide){target="_blank"}，数字是从它的 CVRF 数据整理的。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>该月有标为已被实际利用的漏洞，且影响范围包含桌面版 Windows。
- <span class="urg-tag urg-tag--soon">尽快</span>有标为已被实际利用的漏洞，但只影响服务器产品或自动更新的组件。桌面用户跟着平常节奏即可，管理服务器的人优先处理。
- <span class="urg-tag urg-tag--routine">一般</span>该月没有已被利用的项目。

微软自己有标 `Exploited:Yes`，这一页的分级就建立在那个字段上，再加一层「影响谁」的判断。

## 先看清楚受影响的是哪一种产品

每个月被实际利用的漏洞里，很大一部分落在 SharePoint、Exchange、Active Directory Federation Services 这类服务器产品上。用一般桌面 Windows 的读者不受那些影响，看到新闻标题写「微软修补正在被利用的重大漏洞」不必先紧张，要先确认的是那个漏洞在什么产品上。

另一个常见的误会是 Microsoft Defender。它的漏洞修补走的是杀毒定义文件的自动更新，不跟着 Patch Tuesday，也不需要用户做任何事。

在 Windows 上使用 Tor Browser 或其他匿名工具的人另外要知道：操作系统被取得权限之后，上面运行的任何工具都保护不了你。提权类的修补对这个情境的重要性不亚于浏览器本身的漏洞。

## 2026 年 8 月

> 2026-08-11 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>1506 个项目，721 个标为 Critical，一个标为已被实际利用。
- CVE-2026-68820：WinSock 的辅助功能驱动程序（Ancillary Function Driver）提权。影响 Windows 10 1809 以后的桌面版与 Windows Server 2019 以后，一般用户也在范围内。
- 提权类漏洞的典型用法是接在别的漏洞后面，先从浏览器或文档取得执行机会，再用它取得系统权限。单独看它需要本机执行条件，串起来就是完整的接管。

## 2026 年 7 月

> 2026-07-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>2003 个项目，是这五个月里最大的一轮，953 个标为 Critical，三个标为已被实际利用。
- 三个都在服务器产品上：Active Directory Federation Services 提权、SharePoint Server 提权、SharePoint 远程执行代码。
- 桌面用户不受这三个影响。管理 SharePoint 或 AD FS 的人要优先处理，SharePoint 的远程执行代码是不需要凭证就能触发的那一类。

## 2026 年 6 月

> 2026-06-09 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>1284 个项目，650 个标为 Critical，没有标为已被实际利用的项目。
- Critical 的数量高不代表紧急。微软的严重度评的是「如果被利用会多严重」，跟「有没有人在用」是两回事，这一页的分级看的是后者。

## 2026 年 5 月

> 2026-05-12 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>1129 个项目，318 个标为 Critical，三个标为已被实际利用。
- 两个在 Microsoft Defender 的防护引擎上（拒绝服务与提权），走定义文件自动更新，用户不需要做任何事。
- 一个是 Exchange Server 的伪冒漏洞，只影响自建 Exchange 的组织。

## 2026 年 4 月

> 2026-04-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>682 个项目，216 个标为 Critical，两个标为已被实际利用。
- CVE-2026-32202：Windows Shell 的伪冒漏洞，影响 Windows 10 1809 以后的桌面版与 Windows Server 2019 以后。Shell 是文件资源管理器与快捷方式处理的那一层，伪冒类问题让恶意文件在界面上看起来像正常的东西。
- 另一个是 SharePoint Server 的伪冒漏洞，只影响服务器。
