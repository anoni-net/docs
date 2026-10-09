---
title: 文档站的视觉规范
description: 只在 anoni.net/docs 用到的视觉规格：侧栏的指南分类色、Material 的界面色、示意图的用色与制作方式，以及社群分享卡的版型。给要画示意图或调整文档站样式的贡献者。
icon: material/vector-square
---

# :material-vector-square: 文档站的视觉规范

这一页收录只在文档站用到的视觉规格：侧栏的指南分类色、Material 主题的界面色、示意图的用色与制作方式，以及社群分享卡的版型。logo、wordmark 与共用色票属于整个社群，写在 anoni.net 的[品牌素材](https://anoni.net/zh-cn/brand/){target="_blank"}。

<style scoped>
.color-swatch { display: inline-block; width: 18px; height: 18px; border: 1px solid #cdcdcd; border-radius: 3px; vertical-align: middle; margin-right: 8px; }
</style>

## :material-palette: 文档站专用的配色

### 指南分类色（侧栏导览）

桌面版左栏「指南」tab 底下的五个分类 chip（概念、工具、场景、进阶、报告）各用一个颜色区隔，文字、图标与框同色。这组是导览界面的识别色，跟[品牌素材](https://anoni.net/zh-cn/brand/){target="_blank"}的结构性次色属于不同层级，两组不要互相挪用。

| Token | 亮色 | 暗色 | 分类 |
|---|---|---|---|
| `--guide-basics`    | `#0079a3` | `#4dbfff` | 概念，品牌 cyan 深一阶以过 AA 对比 |
| `--guide-tools`     | `#2e7d32` | `#66bb6a` | 工具，比隐私绿 `#4caf50` 深 |
| `--guide-scenarios` | `#ad1457` | `#f06292` | 场景 |
| `--guide-advanced`  | `#4527a0` | `#b39ddb` | 进阶，暗色提亮以过 AA 对比 |
| `--guide-reports`   | `#946c00` | `#e0b020` | 报告，琥珀金，刻意离开蓝色系 |

暗色变体在 CSS 里命名为 `--guide-*-d`。

- 只用在 `extra.css` 的侧栏分类 chip。内容标签、admonition 与三大主题标记用 `--cat-*`
- 避开保留的紫 `#7b1fa2` 与紧急红 `#d32f2f`
- 五色的亮色在白底、暗色在 slate 底都过 WCAG AA 的 4.5:1。报告原本是蓝色，跟概念的 cyan 在三种色盲模拟下几乎同色（ΔE 最低 2.7），改成琥珀金之后，在红绿色盲下与概念完全分开（ΔE 60 以上）。概念与进阶在第一型色盲下偏近，工具与报告在红绿色盲下偏近，这两组靠图标与文字标签区分，颜色只是辅助线索（WCAG 1.4.1）
- CSS 依位置上色（`:nth-of-type(1)` 到 `(5)`，概念是 1、报告是 5），顺序对应 `mkdocs.yml` 指南 tab 底下的分类排序，改排序时要同步调整 CSS

### 亮色模式的界面色

Material 默认的 light blue 当主色时，在白底的对比只有 2.71:1，过不了 WCAG AA。亮色模式把正文链接、accent、header 与面包屑改用 cyan-800 `#006d99`（白底 5.76:1）。暗色模式维持 Material 默认，因为 cyan-800 在 slate 底只有 2.27:1。内容里的小色标签（首页公告、活动页徽章）也都调到 4.5:1 以上。

### 示意图用色

`docs/diagrams/` 的手写 SVG 是被 `img` 标签引用的独立文件，取不到页面的 CSS 变量，所以下面这一组没有写成 `var(--x)`，是直接抄 hex 进 SVG 的 `<style>`。class 名称也照抄，三十几张图用的是同一套，换图的人才不用重新认。

语义色，每一格是底色加框色：

| class | 用在哪 | 亮色 底 | 亮色 框 | 暗色 底 | 暗色 框 |
|---|---|---|---|---|---|
| `.card-c1` | 这一行是重点、主线路径 | <span class="color-swatch" style="background:#e0f4ff"></span>`#e0f4ff` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` | <span class="color-swatch" style="background:#0d2b38"></span>`#0d2b38` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` |
| `.card-ok` | 可以、低成本、风险低 | <span class="color-swatch" style="background:#e8f5e9"></span>`#e8f5e9` | <span class="color-swatch" style="background:#4caf50"></span>`#4caf50` | <span class="color-swatch" style="background:#17301a"></span>`#17301a` | <span class="color-swatch" style="background:#4caf50"></span>`#4caf50` |
| `.card-w1` | 有条件、要注意、中等 | <span class="color-swatch" style="background:#fdf0e4"></span>`#fdf0e4` | <span class="color-swatch" style="background:#f8b878"></span>`#f8b878` | <span class="color-swatch" style="background:#2b1f16"></span>`#2b1f16` | <span class="color-swatch" style="background:#8a5420"></span>`#8a5420` |
| `.card-no` | 不行、高成本、风险高 | <span class="color-swatch" style="background:#fdecea"></span>`#fdecea` | <span class="color-swatch" style="background:#d32f2f"></span>`#d32f2f` | <span class="color-swatch" style="background:#35181a"></span>`#35181a` | <span class="color-swatch" style="background:#e57373"></span>`#e57373` |
| `.card` | 没有好坏判断的一般卡片 | <span class="color-swatch" style="background:#ffffff"></span>`#ffffff` | <span class="color-swatch" style="background:#cfd8dc"></span>`#cfd8dc` | <span class="color-swatch" style="background:#23292e"></span>`#23292e` | <span class="color-swatch" style="background:#4b565e"></span>`#4b565e` |
| `.card-n` | 弱化、次要、已排除 | <span class="color-swatch" style="background:#f4f6f7"></span>`#f4f6f7` | <span class="color-swatch" style="background:#b0bec5"></span>`#b0bec5` | <span class="color-swatch" style="background:#1c2226"></span>`#1c2226` | <span class="color-swatch" style="background:#46515a"></span>`#46515a` |

分层图用的 cyan 三阶，由浅到深对应由下到上或由外到内：

| class | 层级 | 亮色 底 | 亮色 框 | 暗色 底 | 暗色 框 |
|---|---|---|---|---|---|
| `.card-c1` | 最浅，第一层 | <span class="color-swatch" style="background:#e0f4ff"></span>`#e0f4ff` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` | <span class="color-swatch" style="background:#0d2b38"></span>`#0d2b38` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` |
| `.card-c2` | 中间层 | <span class="color-swatch" style="background:#b3e3ff"></span>`#b3e3ff` | <span class="color-swatch" style="background:#26b3ff"></span>`#26b3ff` | <span class="color-swatch" style="background:#10394b"></span>`#10394b` | <span class="color-swatch" style="background:#26b3ff"></span>`#26b3ff` |
| `.card-c3` | 最深，顶层 | <span class="color-swatch" style="background:#80d1ff"></span>`#80d1ff` | <span class="color-swatch" style="background:#0089bf"></span>`#0089bf` | <span class="color-swatch" style="background:#14495f"></span>`#14495f` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` |

橙色三阶给警示或成本递增的分层，结构跟 cyan 三阶一样：

| class | 层级 | 亮色 底 | 亮色 框 | 暗色 底 | 暗色 框 |
|---|---|---|---|---|---|
| `.card-w1` | 最浅 | <span class="color-swatch" style="background:#fdf0e4"></span>`#fdf0e4` | <span class="color-swatch" style="background:#f8b878"></span>`#f8b878` | <span class="color-swatch" style="background:#2b1f16"></span>`#2b1f16` | <span class="color-swatch" style="background:#8a5420"></span>`#8a5420` |
| `.card-w2` | 中间层 | <span class="color-swatch" style="background:#f8b878"></span>`#f8b878` | <span class="color-swatch" style="background:#ef6c00"></span>`#ef6c00` | <span class="color-swatch" style="background:#7d4b19"></span>`#7d4b19` | <span class="color-swatch" style="background:#ff8c1a"></span>`#ff8c1a` |
| `.card-w3` | 最深，饱和底 | <span class="color-swatch" style="background:#ef6c00"></span>`#ef6c00` | <span class="color-swatch" style="background:#c85a00"></span>`#c85a00` | <span class="color-swatch" style="background:#ff8c1a"></span>`#ff8c1a` | <span class="color-swatch" style="background:#ffa64d"></span>`#ffa64d` |

底色越深，能放上去的文字色越少：

| 卡片 | 亮色 | 暗色 |
|---|---|---|
| `.card`、`.card-n`、`.card-c1`、`.card-w1`、`.card-ok`、`.card-no` | `.t-main` 与 `.t-mute` 都可以 | 同左 |
| `.card-c2`、`.card-c3`、`.card-w2` | 只用 `.t-main` | 只用 `.t-main` |
| `.card-w3` | `.t-onfill` <span class="color-swatch" style="background:#212121"></span>`#212121` | `.t-onfill` <span class="color-swatch" style="background:#241708"></span>`#241708` |

`.t-mute` 的 `#546e7a` 在 `.card-c2` 是 3.95:1、`.card-c3` 是 3.21:1、`.card-w2` 是 3.12:1，三个都过不了 AA，所以那三种底只放 `.t-main`（9.3 到 11.8:1）。

`.card-w3` 两个模式要往相反方向走。亮色底 `#ef6c00` 配白字只有 3.08:1，配 `#212121` 是 5.23:1。暗色底 `#ff8c1a` 配 `#eceff1` 只有 2.02:1，配 `#241708` 是 7.51:1。旧的 `.t-inv` 是亮色白字配暗色 `#241708`，亮色那一半不够，2026-09-19 的竖式改版已经全部换成 `.t-onfill`，77 个手写文件零残留。

`.t-onfill` 在亮色模式的值跟 `.t-main` 相同，都是 `#212121`，只有暗色模式才分岔成 `#241708`。两个 class 不能合并，合并之后暗色模式的 `.card-w3` 会掉到 2.02:1。

文字与线：

| class | 用途 | 亮色 | 暗色 |
|---|---|---|---|
| `.t-main` | 主要文字 | <span class="color-swatch" style="background:#212121"></span>`#212121` | <span class="color-swatch" style="background:#eceff1"></span>`#eceff1` |
| `.t-mute` | 次要文字、说明 | <span class="color-swatch" style="background:#546e7a"></span>`#546e7a` | <span class="color-swatch" style="background:#b0bec5"></span>`#b0bec5` |
| `.t-onfill` | 饱和底色上的文字，见上方配对表 | <span class="color-swatch" style="background:#ffffff"></span>`#ffffff` | <span class="color-swatch" style="background:#241708"></span>`#241708` |
| `.rule` | 分隔线 | <span class="color-swatch" style="background:#cfd8dc"></span>`#cfd8dc` | <span class="color-swatch" style="background:#46515a"></span>`#46515a` |
| `.arrow` | 流程箭头 | <span class="color-swatch" style="background:#90a4ae"></span>`#90a4ae` | <span class="color-swatch" style="background:#6b7780"></span>`#6b7780` |

同一个角色的卡片与标签不要叠在一起。`.card-w1` 的标签放进 `.card-w1` 的卡片里，两者底色相同，只剩框线在撑，换一个角色或者把外层改成 `.card-n`。

颜色不能是唯一的语义载体。每一个色块里的文字要把语义写完整，例如标签写「匿名度 高」而不是只靠绿色。红配绿是色盲最难分的一组，文字写完整之后颜色只是辅助，看不出颜色差别的人照样读得到内容。

对比实测，文字那几组都过 WCAG AA 的 4.5:1：`#212121` 在六种亮色底上是 14.1 到 16.1，`#eceff1` 在六种暗色底上是 12.3 到 14.0，`#546e7a` 在白底 5.4、在中性卡 5.0、在 cyan 卡 4.8，`#b0bec5` 在暗色卡是 7.7 到 8.4。

`.t-mute` 订为 `#546e7a`，它同时也是品牌素材中性色那一组的 `--neutral-muted`。旧值 `#607d8b` 在白底只有 4.37:1，AA 差一点，2026-09-19 的竖式改版已经全部换掉，77 个手写文件零残留。

框色对页面底色多半在 1.5 到 2.8:1，没有到 WCAG 1.4.11 的 3:1。这一组的判断是框色属于加强，语义由框内的文字承担，所以不强求。真的要靠颜色分辨的图（散点图、条形图）不适用这个判断，那种图的每一个数据点都要标到文字。

## :material-share-variant-outline: 社群分享卡（Open Graph）

把文件站的任何一页贴到 Mastodon、LinkedIn、X、Bluesky 或聊天室，对方看到的预览图由构建流程自动生成，三个语系各一份，不需要人工做图。

版面沿用[品牌素材](https://anoni.net/zh-cn/brand/){target="_blank"}的色票。cyan-900 当底色，左缘三段色块由上而下是 cyan-300、cyan-500、cyan-700，对应 logo 三个六角形的层次。左上角是 mono white logo 与站名，中间是页面标题，下方依序是页面描述与网址。页面 front matter 有 `icon` 时，那个图示会放大成 10% 透明的底纹摆在右侧，没有的话用 `material/hexagon-multiple-outline`，也就是 logo 的来源图示。

底色没有用品牌主色 cyan-500，理由是读得到字。白字放在 cyan-500 上对比只有 2.5:1，缩到社交平台的预览尺寸就糊成一团，换到 cyan-900 之后是 11.5:1。描述用 cyan-100，对比 8.4:1，页尾网址用 cyan-300，对比 5.6:1。

版式文件是 `docs/layouts/anoni.yml`，三个语系共用同一份。语系差异只有字体（Noto Sans TC、Noto Sans SC、Public Sans）与版面上显示的站名，分别写在 `mkdocs.yml`、`mkdocs_cn.yml`、`mkdocs_en.yml`。要调整版面就改那一份版式，不要各语系各存一份。

### 中文标题的换行

生成卡片的插件只在空白处换行。一整句中文没有空白，会被当成一个词，超过一行就切在画布边缘，连省略号都不会有。改版之前，站上最长的那个文章标题只显示得出前半段。

现在的作法是在全角逗号、顿号、冒号、句号、感叹号、问号后面补一个半角空白，给换行算法可以断的位置，补上的空白落在行尾就会被吃掉。代价是句子中间偶尔看得到多出来的空隙，换来的是三个语系目前每一则标题与描述都完整显示。标题 14 字以内不处理，那个长度本来就放得下一行。

### 单页换掉卡片内容

某一页需要不一样的标题、描述或底色时，在该页 front matter 覆写：

```yaml
social:
  cards_layout_options:
    title: 卡片上要显示的标题
    description: 卡片上要显示的描述
    background_color: "#003e57"
```

底图也走同一个选项。`background_image` 的路径相对于执行 mkdocs 的目录，也就是 `docs/`，写成 `zh-TW/assets/images/xxx.png` 这种形式，文件找不到时构建会失败。只填底图的话，底色自动变成 80% 的 cyan-900 遮罩，白字在任何一张图上都读得到。想要原图直出就多填一行 `background_color: transparent`，代价是浅色的图会让标题与页尾网址消失。

整张图要自己做的场合（活动主视觉、互动区）走另一种写法，front matter 填 `og.enabled: true` 与 `og.image`，文件站的模板会改用指定的图片，并跳过自动生成的那一张。COSCUP 活动页与互动区目前就是这样做。

## :material-vector-square: 贡献技术图示

技术图示（流程图、架构图、对照矩阵、时间轴）有两种做法：

- **drawio**：节点与连线多、结构复杂的图，存成 `.drawio.svg` 双重格式文件
- **手写 SVG**：版型规则的图，例如矩阵、分层、时间轴。直接写比在画布上拖拉快，文件也小一到两个数量级

两种都是 SVG，浏览器、mkdocs、IPFS 镜像、Onion 镜像都直接渲染。

### 图档放在 assets.anoni.net

图档不进 `docs/<lang>/assets/images/`。三个语系的 `assets/images/` 是三份各自独立的实体文件，同一张图要复制三次，漏掉一个语系就是一页破图，而且构建不会报错。zh-CN 的七张 drawio 图就是这样坏了一段时间都没有人发现。

| 东西 | 位置 |
|---|---|
| 原始文件（进版控，可 review、可回溯） | `docs/diagrams/` |
| 发布出去的副本 | m6 的 `/srv/images-anoni-net/diagrams/` |
| 文章里引用的网址 | `https://assets.anoni.net/diagrams/<文件名>` |

`docs/diagrams/` 不在 `docs_dir` 底下（`docs_dir` 设成各语系自己的目录），所以它不会被构建成产物，纯粹是原始文件的存放处。

读者不会直接连到 assets.anoni.net。mkdocs-material 的 privacy 插件在构建时把外部资产抓成本地文件，产物里的 `img src` 是 `assets/external/assets.anoni.net/...` 这样的相对路径。Onion 版与 IPFS 镜像照样自足，不会有读者向 clearnet 发请求。

代价是构建时 assets.anoni.net 必须连得到。privacy 插件下载失败时仍会把该文件登记进 files，接着 `copy_static_files` 找不到文件就让整个构建失败，插件本身没有重试。

### 文件名带语系

图里有中文字就要分语系，文件名写成 `<slug>.<lang>.svg`：

- `anonymity-visibility-matrix.zh-TW.svg`
- `anonymity-visibility-matrix.zh-CN.svg`
- `anonymity-visibility-matrix.en.svg`

图里只有英文术语或完全没有文字，三个语系共用一份，文件名就不带语系，写成 `<slug>.svg`。

还没补齐三个语系的图，先让另外两个语系引用 zh-TW 那一份，站上至少看得到图。`docs/diagrams/` 底下带 `.zh-TW.` 的文件被 zh-CN 或 en 的页面引用，就代表那张还没补。

### 发布

```bash
./tools/publish_diagrams.sh --dry-run   # 只检查 SVG 语法
./tools/publish_diagrams.sh             # 检查、上传、验证每个网址回 200
```

顺序不能反过来。先发布图、确认网址回得了 200，才改 Markdown 的引用。反过来做会让下一次构建直接失败。

改同名文件还要清 Cloudflare 缓存，edge 的 max-age 是 12 小时。设好 `CF_ZONE_ID` 与 `CF_PURGE_TOKEN` 环境变量，发布脚本会顺手清掉。

没清缓存就推 `docs` 分支的后果比「站上暂时看到旧版」严重。CI 构建时 privacy 插件是从 edge 抓图，抓到的旧版会被烘进 S3 产物，之后 edge 缓存自己过期也不会修正站上的内容，因为站上读的是产物那一份。

补救也比想像中难。清掉 edge 缓存再重新构建一次是救不回来的：CI 另外缓存了 `docs/.cache/plugin/privacy`（理由见 `build_docs.yml` 的注释），同一个网址在那里已经有文件，privacy 插件就不会再去下载。要靠清缓存解决，得把 GitHub Actions 上全部 `mkdocs-privacy-*` 的项目删掉，restore-keys 会 fallback 所以只删最新的没有用，而代价是下一次构建要重新对十几个外部主机碰运气。

所以规则是不要覆盖同名文件。图有实质改动就换一个文件名，连同 Markdown 的引用一起改，整条路径上没有任何一层会取得旧的。

这一轮在 2026-08-28 完整踩过：矩阵图的配色改过并重新上传，edge 还在 max-age 内，推了 `docs` 之后站上是旧版。清掉 edge 缓存、`workflow_dispatch` 重建一次，站上仍是旧版，因为 CI 的 privacy 缓存命中，产物内容没变连上传都被跳过。最后把文件名从 `anonymity-vs-privacy-matrix` 换成 `anonymity-visibility-matrix` 才修好。

### 如何储存才会有 embedded XML

drawio.svg 与纯 SVG 的关键差别，在于 drawio.svg 的 `<svg>` 根标签上多了一个 `content="..."` 属性，里面是 escape 过的 drawio mxfile XML。drawio 会读这个 XML 重建原本的结构化编辑体验。没有它，drawio 只能把 SVG 视为一堆独立的 path / rect / text 散件，几乎没办法重编。

drawio Desktop 的 Save 对话框有两个关键栏位：

| 栏位 | 设定 |
|---|---|
| Filename | `xxx.drawio.svg`（双副档名，业界惯例） |
| Format dropdown | **Editable Vector Image (.drawio.svg)** |

**Format dropdown 才是决定性的设定**。如果 Filename 取 `xxx.drawio.svg` 但 Format 选了「SVG (.svg)」，会得到一个文件名长得像 `.drawio.svg`、但实际没 XML 的纯 SVG。最容易踩的雷。

drawio Desktop 默认 format 通常是 `.drawio`（纯 XML，浏览器看不到图），新建档时记得手动切到「Editable Vector Image」。或在 Preferences 改 Default save format 永久默认 `.drawio.svg`。

### 不要用 Export

drawio 有两个写档动作：

- **File → Save**（Cmd+S）：写回原档，**保留 XML**（前提是 format 是 `.drawio.svg`）
- **File → Export As → SVG**：产生新的纯 SVG，**剥掉 XML**

进 repo 的图示**只用 Save、不要用 Export**。Export As 是给「需要丢给 Photoshop 或其他 SVG viewer」这类场合用，不会放回文件站。

### 如何验证有 XML

存完之后，终端机执行：

```bash
grep -c mxfile your-diagram.drawio.svg
```

预期出现 1 或更多。如果是 0，这个文件没 embedded XML、不能重编，请开回 drawio Desktop 重存（记得 format dropdown 选对）。

### 配色一致性：drawio palette 默认

新图示用[品牌素材](https://anoni.net/zh-cn/brand/){target="_blank"}的 brand cyan 9 阶色票。建议在 drawio Desktop **Extras → Configuration** 贴上下方 JSON，把品牌色设为 picker 默认：

```json
{
  "presetColors": [
    "00aeff", "009ee6", "0089bf", "006d99", "003e57",
    "4dbfff", "26b3ff", "80d1ff", "b3e3ff", "e0f4ff",
    "ef6c00", "d32f2f", "4caf50", "7b1fa2", "546e7a", "cdcdcd"
  ],
  "defaultColors": [
    "00aeff", "009ee6", "ef6c00", "d32f2f",
    "4caf50", "7b1fa2", "546e7a", "ffffff"
  ]
}
```

设一次永久存入，画图时 picker 直接挑品牌色，不会误用 Material 默认色。

### 手写 SVG 的规则

手写的图是被 `img` 标签引用的独立文件，取不到页面的 CSS 变量，颜色只能写死 hex，照本页上方「示意图用色」那一组抄，class 名称也一起沿用。

#### 画布宽度照手机订

画布抓 400 宽，信息往下长。图在页面上被 `max-width: 100%` 夹进内容栏，缩放比只跟宽度有关，跟高度无关，所以画布越宽，字缩得越狠，而手机是缩放比最糟的那一端。量过文档站各个视窗宽度的内容栏：

| 视窗宽 | 内容栏 | 940 画布的缩放 | 400 画布的缩放 |
|---|---|---|---|
| 1920 | 855 | 0.91 | 1.20 |
| 1440、1280 | 668 | 0.71 | 1.20 |
| 1024 | 750 | 0.80 | 1.20 |
| 768 | 736 | 0.78 | 1.20 |
| 414 | 382 | 0.41 | 0.96 |
| 390 | 358 | 0.38 | 0.90 |
| 360 | 328 | 0.35 | 0.82 |

正文字级桌面 16 到 17.6px，手机 16px。940 的画布配 11.5px 的最小字，在 1440 渲染成 8.2px，在 360 的手机渲染成 4.0px，大约是旁边正文的四分之一。2026-09-19 用 headless Chrome 扫过 `docs/diagrams/` 全部 81 个文件，最小字在 360 手机上落在 3.5 到 5.0px，没有一张例外，而页面没有装 lightbox，读者只能整页 pinch-zoom 再平移。

400 的画布配 13px 的最小字，在 1440 渲染成 15.6px，在 390 手机是 11.6px，在 360 手机是 10.7px。桌面那一端靠 `.diagram-tall` 往上放大到 480px，用法见下方「套到 markdown 文章」。

字级与画布宽度的关系用这一条算：

```
画布宽 <= 手机内容栏 × 图内最小字级 / 目标渲染字级
```

要在 360 手机（内容栏 328）让最小字渲染到 11px 以上，12.5px 的字对应画布上限约 372，14px 的字约 417。

#### 横的东西都翻成竖的

左到右的流程改成上到下，并排的栏位改成堆叠的卡片，横向的时间轴改成竖向的时间轴。对照矩阵的栏位标题在 400 宽塞不下的时候，把标题搬进每一格里，例如四个评分栏改成卡片内的 2×2 标签。

图里不要放整句的脚注。那一两行散文是逼画布变宽的主因之一，而且烘进图片之后不能选取、不能被搜索，翻译的时候要整张重画。把它搬到 `figcaption` 或正文。

`<picture>` 加 `srcset` 分手机与桌面两份文件这条路走不通。privacy 插件只改写 `img src`、`script src`、`a href` 与 SVG 的 `image href`，`srcset` 不会被本地化，onion 与 IPFS 版会留下对 assets.anoni.net 的 clearnet 请求。

#### 版型范本

下面这张图把每个版型元件与每个色票 token 各用一次。做新图时照它抄，尺寸、内距与色值都在里面。

<figure markdown="span">
    <img class="diagram-tall" src="https://assets.anoni.net/diagrams/diagram-reference-v4.zh-CN.svg" alt="示意图版型范本，由上而下依序是六块。带 eyebrow、title、sub 与 lines 的卡片。两栏标签的卡片，四个标签分别是良好、中等、警示、中性。有小标分段的卡片。一个分节标题。上下流程的三个节点与居中连接线。cyan 三阶与橙色三阶各三张卡片。">
    <figcaption>每个元件与每个 token 各用一次，做新图时照这张抄</figcaption>
</figure>

固定的数字：画布 400 宽，外距 12，卡片内距 14，所以文字可用宽度是 348。卡片上缘到第一行文字 24px，行距 17px。

卡片之间的间距有三个值，依关系选：

| 间距 | 用在哪 |
|---|---|
| 8px | 同一族群的色阶变体堆叠，例如三阶分层的三张卡片 |
| 10px | 一般情况，语义不同的两张卡片之间 |
| 14px | 段落或族群的边界，例如从 cyan 三阶跳到橙色三阶 |

圆角有三个值，依形状选：

| rx | 用在哪 |
|---|---|
| 8 | 卡片 |
| 6 | 流程节点与卡片内的小方框 |
| 高度的一半 | 胶囊状标签。标签高 24 时 rx 是 12，不要写死 6 |

字级只有 15、14、13 三个值。这套阶层是「粗细乘颜色」两个轴叠出来的，不是一路递增的字级 scale：15 与 14 是粗体深色，13 同时出现在粗体（小标）与细体（正文）。想再加一层强调时改粗细或改颜色，不要插进 12.5 或 13.5 这种中间值，在 0.82 到 1.2 的缩放范围内那 0.5px 没有人看得出来。

#### eyebrow 用 muted，alt 是唯一的权威文字

卡片的 eyebrow 跟 sub 同一个颜色系（浅底用 `.t-mute`，`.card-c2`、`.card-c3`、`.card-w2` 用 `.t-main`，`.card-w3` 用 `.t-onfill`），只有 title 用深色。三行的层次是「淡的小标、深的标题、淡的副标」。eyebrow 跟 title 都用深色的话，两行只差 1px 字级，在 328 宽看起来像标题被拆成两行。

eyebrow 放的是分类或编号（「第一级」、「Send」、「环境层」），title 说明这一格的内容。如果某个字串单独看就是这张卡的主要信息，它应该是 title 而不是 eyebrow。

SVG 内只留一个简短的 `<title>`，给直接开启文件网址的情境用，不要写 `<desc>`。图是被 `img` 标签引用的，浏览器把它当成不透明的点阵图，SVG 内部的 `title`、`desc`、`role`、`aria-*` 都不会被辅助科技读到，读者听到的一律是 `img` 的 `alt`。完整的说明只写在 `alt` 那一份，两边各写一份的结果是内容各自漂移。

#### 流程用居中的连接线

上下流程的节点是满版的圆角矩形，文字靠左。节点之间留 18px，中间放一条居中在画布中线的连接线，线用 `.arrow`（stroke `#90a4ae`，暗色 `#6b7780`，宽 1.6），末端接一个 `.arrow-h` 的实心三角形。

不要拿「↓」这类文字字符当箭头。字符的基线、字重与字级都跟着正文走，位置也对不齐节点中线，看起来像漏字而不像流程。

```
节点 rect x=26 width=348 rx=6
连接线   M200 y V y+12
箭头     M196 y+11 L204 y+11 L200 y+18 Z
```

#### 断行交给版面算

英文版排不下的时候让图长高，不要让图变宽。三个语系共用同一组栏位坐标，长度差异靠折行吸收。数据里一句就是一句，断行的位置交给版面算，手写断行加上折行会长出 `the`、`on` 这种单字孤行，中文那一侧则是整行只剩一个「。」，或者句号落在行首。`docs/diagrams/` 目前有 10 处这种痕迹，散在 `donation-channels`、`shutdown-levels`、`baseline-layers` 三组文件里。

定稿前用 headless 浏览器在 360 与 390 两个宽度各量一次实际渲染字级。只看 SVG 文件本身量不出来，字级要乘上缩放比才是读者看到的大小。

深色模式在 SVG 内用 `@media (prefers-color-scheme: dark)` 自己处理，色值照上方「示意图用色」的暗色那两栏抄。自己配的话原则是把主色提亮，例如 cyan-700 `#0089bf` 换成 cyan-300 `#4dbfff`。

站上的 palette 切换传得进独立的 SVG。Material 在 slate 主题下会对 `body` 设 `color-scheme: dark`，浏览器把这个值带进 `img` 载入的 SVG 文件，读者手动切到暗色的时候图会跟着换。2026-09-19 在 Chromium 与 Firefox 两边都验过：系统设亮色、文档站切 slate 的组合，图照样渲染成暗色那一组。七张 drawio 图没有这一段，在暗色底上会看到白底方块。

色块里的文字用中性深色 `#212121` 或白色，不要拿主色当文字色。`#ef6c00` 与 `#4caf50` 这类颜色在白底的对比度不到 4.5:1，语意靠框色与文字本身表达就够了。

`<style>` 区块里不要出现尖括号，连注释里都不行。注释写了带角括号的标签名，整份文件就不是合法 XML，而浏览器照样显示得出来，只有 XML parser 抓得到。`publish_diagrams.sh` 会挡这个。

手写的图自带外框与内距，不要再套 `.brand-frame`，那会变成双框。drawio 导出的图没有外框，维持套 `.brand-frame`。

图里的文字一样适用写作规范，但 `docs_style_lint.py` 只收 `.md` 与 `.js`，扫不到 SVG。文字定稿之前先自己对一次规范，口语词那几条最容易漏。发布之后才发现要改，就得换文件名，因为覆盖同名文件会撞上 edge 缓存。

### 套到 markdown 文章

drawio 图，套 `.brand-frame`：

```markdown
<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/<name>.zh-TW.drawio.svg" alt="图示说明">
</figure>
```

手写 SVG，自带外框，改用 figcaption，并且套 `.diagram-tall`：

```markdown
<figure markdown="span">
    <img class="diagram-tall" src="https://assets.anoni.net/diagrams/<name>.zh-TW.svg" alt="把图的内容用文字说完整">
    <figcaption>一句话说明这张图在讲什么</figcaption>
</figure>
```

`.diagram-tall` 做的事是 `width: 480px` 配 `max-width: 100%`，让 400 的画布在桌面放大到 480，在手机缩到内容栏宽。旧的横式图先不要套，它们的画布是 880 到 1000，套上去会被夹到 480，字比现在更小。

`.brand-frame` 是 anoni.net 图示的 utility class（cyan 边框加软阴影）。

alt 要把图的内容说完整，不要只写「示意图」三个字。语音朗读、Onion 版的低带宽情境、图抓不到的时候，读者手上只剩这一段文字。

示意图不要包 `<a>` 做点击放大。SVG 在页面里本来就看得清楚，而 `<a href>` 不会被 privacy 插件改写，Onion 版的读者点下去会跳出 Tor 连到 clearnet。截图那类需要放大的图才包 `<a>`，那些本来就是 PNG。

### 纯 SVG / PNG export 的场合

如果某张图也要做 SNS 卡片、印刷品、外部投影片用（不需要重编能力），再多 Export 一份纯 SVG 或 PNG 即可。**这份 export 不要进 repo**（避免重复），放本机或社群素材库即可。

## :material-link-variant: 接下来

- [贡献者百科](contributor-handbook.md)：整体贡献流程、PR 规范、翻译流程
- [品牌素材](https://anoni.net/zh-cn/brand/)：logo、wordmark、共用色票与各站的视觉分工
