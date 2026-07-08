---
title: Asian Diceware：带亚洲味的英文密语字典
description: 匿名网络社群参考 EFF Diceware 做的开源密语字典，把 tofu、boba、oolong、kimchi 这类有字典背书的亚洲外来语混进 7776 字英文词表，让华语圈与亚洲的读者更好记。这篇说明如何使用、何时使用、密语强度与随机性，并提供 A5 小册 PDF 下载。
icon: material/dice-multiple-outline
---

# :material-dice-multiple-outline: Asian Diceware：带亚洲味的英文密语字典

又长又随机的密码最安全，但人脑记不住，于是多数人改用生日加宠物名字，还一组到处重复使用。有个更省力的方法，掷几次骰子、从一份固定的词表里抽出几个英文字串起来，当成你的密码。这种「密语」（passphrase）好记、好输入，强度却远高于一般人手打的密码。这个做法你可能早就用过，下一节就列几个你大概见过的例子。我们做的是一份带亚洲味的版本，把已经进入英文字典的亚洲外来语混进去，对华语圈与亚洲的读者更好认、更好记。华语圈熟悉的 `oolong`（乌龙茶）、`boba`（珍珠奶茶，源自台湾）、`tofu`（豆腐）、`pinyin`（拼音）都在里面，也收了 `ramen`（拉面）、`matcha`（抹茶）、`kimchi`（泡菜）、`typhoon`（台风）这类日韩料理与亚洲风物，还有 `shampoo`（洗发，源自印地语）、`ketchup`（番茄酱，源头可追到闽南语）这种你未必发现源自亚洲的字。完整清单与挑字原则，后面〈我们做了什么〉会说明。动手前可以先看 [威胁模型如何建立](../basics/threat-model.md)，清楚自己要防范谁，再读 [密码管理器入门](./password-manager.md)，了解密语在整套密码防线里的位置。

## 你其实早就见过这个做法

把电脑产生的随机数换成几个好记、好抄的英文字，这套做法出现在很多你用过的场景：

- **加密货币钱包的助记词：**建立钱包时它要你抄下、收好的那 12 或 24 个英文字，就是这个做法最大规模的应用，把钱包的密钥变成一串你抄得下来的字（这套标准叫 BIP-39，连繁体中文词表都有）[^bip39]。背景可参考 [加密货币的隐私光谱](./crypto-privacy-spectrum.md)。
- **密码管理器内建的产生器：**Bitwarden 的「Passphrase」、1Password 的「Memorable Password」点一下就产生一组这种密语，底层用的就是同类词表，你现在打开手边的管理器就能试[^pwmgr]。
- **不留个资的匿名账号：**Tor 的 [AnonTicket](https://anonticket.torproject.org/){target="_blank"} 让人不必提供 email 就能匿名回报问题，账号代码就是六个随机英文字[^anonticket]。让记者接收爆料的 SecureDrop 平台，会为每位匿名来源产生一组「七个随机字」的登录代码[^securedrop]。
- **那张著名的漫画：**xkcd 的「correct horse battery staple」说的就是这件事，四个随机英文字串起来，电脑难猜、人却好记[^xkcd]。

Tails 在建立加密存储时也会直接建议一组这样的密语（5.12 起）[^tails]，要在电话里核对一长串密钥指纹时，把数字念成字也比念数字不容易出错（PGP word list 的既有做法）[^pgpwords]。

这套做法有个名字，叫 Diceware，由 Arnold Reinhold 在 1995 年提出[^reinhold]。原理很单纯，每个字配一组骰子点数，掷骰得到的数字去查表，查到的字就是密语的一部分，重复几次组成一句。随机数来自真实的掷骰、不经过你的手，所以结果无法被你的习惯或偏好猜中。EFF 在 2016 年发布的 7776 字词表，挑字时避开难拼字、脏话、容易混淆的同音字，是目前最常被推荐的英文版本[^eff]。我们做的，就是同一套做法、带亚洲味的版本。

## 我们做了什么：带亚洲味的英文字典

asian-diceware 是一份 7776 字、与 EFF 相容的密语词表，可以当成 EFF Large Wordlist 的直接替代品，安全性与可用性对齐。差别在用字，我们固定收录 292 个有字典背书（OED、Merriam-Webster、Cambridge 查证）的亚洲外来语，其余用最高频、好拼写的常见英文字填满。

这些外来语对华语圈与亚洲的读者特别好认：`tofu`、`ramen`、`miso`、`matcha`、`karaoke`、`tsunami`、`kimchi`、`bibimbap`、`typhoon`、`oolong`、`yoga`、`karma`、`curry`、`mango`。其中有不少华语圈的味道：`oolong`（乌龙茶）、`boba`（珍珠奶茶，源自台湾）、`ketchup`（源头可追到闽南语）、`pinyin`（拼音）。也有一些你可能没发现是亚洲外来语的字，像 `shampoo`、`bungalow`、`jungle`、`gecko`、`bazaar`、`guru`。

选字有两个刻意的限制。第一，外来语一律收已经进英文字典的单一英文 token，不收 `feng shui`、`kung fu`、`dim sum` 这类有空格的词。第二，我们不自己音译华语，因为华语圈用过汉语拼音、威妥玛、通用拼音几套标准，香港等地另有粤语拼音（Jyutping）等系统，拼法会打架，所以只收英文拼法已被字典固定下来的字。

这份词表开源（代码采 MIT、词表资料采 CC-BY-4.0），原始码与完整词表在 [GitHub anoni-net/asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"}。词表的功能是让抽字这一步更好认好记，本身不涉及加密。真正的安全来自你如何产生、保管与使用密语。

社群接下来也想做一个类似 [AnonTicket](https://anonticket.torproject.org/){target="_blank"} 的匿名服务平台（还在规划阶段），账号代码就用一组随机英文字、而非 email。这份 asian-diceware 词表正是为了当未来这类服务的代码字源而准备。AnonTicket 本身如何用在与 Tor 上游协作，见 [Tor Project 生态与对接](../community/tor-project-ecosystem.md)。

## 为什么亚洲外来语只占约 3.8%

词表里的亚洲外来语约占 3.8%（7776 字中 292 个）。这个比例可以比照啤酒的酒精浓度（ABV）来看，是刻意挑过的数字。比例的上限取决于英语实际吸收成「单一字典词」的可辨识亚洲外来语有多少。把 OED、Merriam-Webster、Cambridge 查过一轮，华语圈读者认得出来的大约 330 个，其中 292 个纳入清单，另外约 40 个留作备援，可辨识的外来语几乎就到顶了。

想再往上拉（例如 10%、约 778 个字），只会逼出两种做法，两种我们都不采用：

- **拿冷僻词充数**（`puttee`、`howdah`、`nilgai`、`maund`），多数人拼不出、念不准、也记不住。这会破坏这份清单要守住的 EFF 特性，也就是抄得下来、念得回去、不容易出错。
- **改用罗马拼音的官话或注音音节**，那属于另一个项目。华语圈用过汉语拼音、威妥玛、通用拼音几套拼法，彼此打架、容易产生歧义。

酒精浓度的比喻到这里就不成立了。比例拉高，密语并不会更强。无论抽到 `tofu` 还是 `the`，每个字都带一样的 12.925 bits。强度来自清单恰好 7776 字、每次掷骰概率均匀，跟字的来源无关。亚洲外来语的比例只改变这份表的风味与好认程度，不影响安全性。所以跟啤酒不一样，这里「浓度更高」并不会多给你什么。当文化覆盖和好用性冲突时，好用性优先。

## 如何使用

掷骰子查表是最直觉的方式，一把骰子加一张表就能开始，不必懂编程。要查的那张表有两种取得方式。印一本 A5 小册最方便（[直接下载 PDF](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.4.0.pdf){target="_blank"}，更多说明见下方〈[印一本小册带着走](#印一本小册带着走)〉），或直接开启 GitHub 上的 dice 档 [`asian_diceware_7776_dice.txt`](https://raw.githubusercontent.com/anoni-net/asian-diceware/main/output/asian_diceware_7776_dice.txt){target="_blank"}。

**方法一，用实体骰子查表：**掷 5 颗骰，由左到右读成一个五位数（每颗 1 到 6）。那张表是照代码从小到大排列的，翻到、或用搜索找到开头是你这五位数的那一行，后面接的字就是抽到的字。重复 6 次，把 6 个字用 `-` 接起来。例如掷出 `6 3 4 4 4`，读成 `63444`，查到 `tofu`。

没有骰子也不必却步。五颗骰子很便宜，文具店、便利店、桌游店都买得到，网络上买一组也不贵，临时没有也能向人借，或用离线的掷骰 app（使用前先关闭网络）。骰子加一张表（印一本小册就好）就是完整的做法，全程不需要电脑。真的想跳过掷骰、又懂一点编程，才需要看下面的捷径。

??? note "给会写程序的人：不用骰子的两种捷径"
    Python 的 `secrets` 是密码学安全随机数，适合用来抽字。

    ```python
    import secrets

    words = open("asian_diceware_7776.txt").read().split()
    assert len(words) == 7776
    phrase = "-".join(secrets.choice(words) for _ in range(6))
    print(phrase)        # 例如 tofu-ramen-bazaar-oolong-gecko-haiku
    ```

    请用 `secrets`，不要用 `random`，后者不是密码学安全的，产出的密语可能被预测。

    不必 clone，也可以直接下载 GitHub 上发布的词表来抽字：

    ```bash
    curl -s https://raw.githubusercontent.com/anoni-net/asian-diceware/main/output/asian_diceware_7776.txt \
      | python3 -c "import secrets,sys;w=sys.stdin.read().split();print('-'.join(secrets.choice(w) for _ in range(6)))"
    ```

词表有两种大小，正式用途一律用预设的 `7776`（每字掷 5 颗骰）。另一份 `1296` 是它的子集、只要 4 颗骰，清单较短、适合测试、示范、教学。两份的骰子代码不同，用哪一份就查哪一份的表，不要拿错。

网站若要求数字或符号，加入一个即可。想更强就多加几个字，每多一个字就难猜得多。

## 哪些情况下使用

密语不只用来登录，这份「号码对字」的表还能用在许多地方。

!!! note "还没用密码管理器？先把最重要的几个账号换成密语"
    我们还是建议用密码管理器，它能为每个网站各产生一组不重复的随机密码。但如果你一时还跨不过那道门槛，也别因此就放弃加强密码。至少把最重要的几个账号（电子邮件、能重设其他账号的那一个、网银）各设一组不重复的密语、记在脑中，这不靠管理器也做得到，而且比多数人惯用的密码强得多。密语解决不了「几十个网站各要一组不重复密码」的问题，那是密码管理器的工作。可以先把这几个重要账号改成密语，之后有机会再导入密码管理器。

- **密码管理器的主密码：**主密码是整套密码系统的单一支点，值得用一组好记又够强的密语。其余每个网站的密码交给管理器产生随机长密码即可，细节见 [密码管理器入门](./password-manager.md)。
- **要自己手动输入的密码：**家里 Wi-Fi 密码、电视或游戏主机上登录串流账号、与家人共用的设备，这些得一个字一个字敲进去的场合，一串乱码很难输入，密语好输入又好念。
- **加密磁盘、备份与密钥的口令：**全盘加密、加密备份、PGP 私钥这类「打错就解不开、外泄就全暴露」的口令，适合用密语。
- **把号码念成字、不会听错：**要核对密钥指纹、安全码这类一长串数字时，先用这张表把号码换算成字，念字比念数字不容易出错。这也是 PGP word list 的做法[^pgpwords]。
- **和信任的人约定暗号：**把词表当成只有你们懂的暗号本，用来确认身分或传递约定好的信号，展开见下一节〈和信任的人约定一组暗号本〉。

## 六个字大概多强

六个随机字串成的密语，强度与一串你根本记不住的乱码相当，攻击者只能逐一尝试，几乎试不完。EFF 把六个字订为一般用途的基本建议，主密码这种最重要的，可以增加到七、八个字。

如果你平常习惯 12 到 16 字符的密码，可以这样对照（左栏假设是密码管理器产生的真随机字串，含大小写、数字与符号）：

| 随机字符密码 | 强度相当的 Asian Diceware 密语 |
|---|---|
| 12 字符 | 6 个字 |
| 14 字符 | 7 个字 |
| 16 字符 | 8 个字 |

到同样强度，两种方式相当，差别在于好不好记。12 到 16 字符的真随机字串记不起来，需要靠密码管理器保存。六到八个密语字达到一样的强度，你却记得住、也打得出来。密语适合少数必须用脑记的密码（密码管理器的主密码、磁盘加密口令），其余每个网站交给管理器产生随机字符密码即可，见 [密码管理器入门](./password-manager.md)。主密码与磁盘加密口令这两种，密码管理器本身帮不上忙，主密码不能存进它自己保管的金库，开机解盘也在管理器启动之前。所以无论你用不用管理器，这份词表都会派上用场。

上面的强度，你用骰子或程序掷出来的密语就算数，照这篇的方法做即可。要避免的是自己挑字、或把抽到的字改成顺口的句子，那会让强度大打折扣。自己凭空想的密码（把 a 换成 @、字尾加个 1 那种）也因为有规律可循，通常比表上的数字弱得多。

??? note "想看背后的数字"
    密语的强度看「熵」（entropy，可以理解成攻击者要猜中得试多少种可能）。每个字从 7776 个里随机抽，贡献 `log2(7776)` ≈ 12.925 bits，六个字约 77.5 bits，等于 2 的 77.5 次方种组合[^eff]。即使一台机器每秒能试几千亿组（实际速率因哈希算法与硬件而差异很大）[^proton]，平均也要上千年才试得到。每多一个 `7776` 的字，多约 12.9 bits。

    含位数的完整对照（字符密码假设约 94 种可打字符）：

    | 随机字符密码 | 熵 | Asian Diceware 密语 | 熵 |
    |---|---|---|---|
    | 12 字符 | 约 79 bits | 6 个字 | 约 77.5 bits |
    | 14 字符 | 约 92 bits | 7 个字 | 约 90.5 bits |
    | 16 字符 | 约 105 bits | 8 个字 | 约 103 bits |

    自己想的密码有规律可循，实际熵往往远低于同长度的真随机密码。

## 随机性才是关键

词表再好，抽字若不够随机，整组密语就不堪一击。

- **一定用真随机数：**实体骰子，或密码学安全的随机数（Python 的 `secrets`、`/dev/urandom`）。不要用 `random` 这类非密码学安全的随机数，不要自己挑字，也不要挑「看起来很随机」的字。人挑的字猜起来容易得多。
- **不要改成有意义的句子：**抽到 `tofu-ramen-gecko` 觉得不顺，想调成一句通顺的话，这个动作会破坏随机性。顺序与用字都照抽到的结果。
- **不要重用：**一组密语只用在一个地方，主密码尤其不能与任何其他服务共用。除非可能外泄，否则不必定期更换，频繁换反而容易换成记不住、或偷懒重用。日后某个服务传出外泄，再换掉那一个账号的密语即可。
- **产生后立刻收好：**别截图存在云端相簿，别贴到聊天室。产出后立刻存进密码管理器金库，或写在纸上锁好。掷骰时也留意身后是否有人窥看（肩窥）。

## 和信任的人约定一组暗号本

想提升日常密码的强度，读到上一节就够了。这节介绍这份词表的进阶用法，给有需要的人。

这份骰子表本质上是一份「号码对字」的对照本，所以除了产密语，也能用来和信任的人约定一套只有你们懂的暗号。事先当面约定哪个字代表什么意思，之后在公开渠道（电话、短信、社交平台私信）报那个字，旁人看到的是一个再普通不过的英文字，你们却知道它代表什么。

!!! warning "先认清它的界线"
    这种暗号是混淆，不是加密。它能挡住随意旁观的人，挡不过会把信息录下来慢慢比对、或事后取得你们约定内容的对手，更挡不住国家级的监控。内容确实不能外泄、或人身安全要靠它，就不要只靠它，务必搭配端对端加密的工具（见 [匿名通讯工具比较](./messaging-comparison.md)、[端对端加密如何运作](../advanced/e2ee.md)）与完整的安全计划。下面的用法都建立在这个前提上。

日常、低风险的用法：

- **确认对方是不是本人：**见面时一起掷一组字、各自记住，日后在电话或短信里互报，确认没被冒充。最好一次性使用，或分开报（你报前三个字，对方回后三个字）。
- **给人、文件、项目取中性代号：**公民团体与记者常要替消息来源、敏感文件、进行中的项目命名。用随机抽的字当代号，比「某官员爆料文件」这种一看就懂的名字更不容易泄露线索，名单万一被看到也猜不出对应谁。

下面几种用在高风险的人身上，更要记得上面那则界线，暗号只是辅助，真正的内容与行踪靠加密工具与安全计划保护：

- **记者和消息来源的接头信号：**第一次见面时约定几个字，例如某个字代表「现在方便、可以联系」，另一个代表「我被盯上了，先别找我」。日后一通电话说一个字就带过，不必在不安全的渠道说白话。对应 [记者保护消息来源](../scenarios/journalist.md)。
- **行动现场的报平安与求救字：**社运行动者、选举观察员出勤时，向后勤约定一个报平安的字，定时回报。需要时换成另一个字，等于「情况不对，启动应变」。因为字会换，逼你回报的人也无从假冒。对应 [社运行动者的数位准备](../scenarios/activist.md)、[选举观察员的自保](../scenarios/election-observer.md)。
- **危险关系里的求救暗号：**正在脱离加害者的人，可以和信任的朋友约定一个求救字，传出去就代表「请打给我」或「请报警」，不必在可能被翻看的手机上留下明显字句。对应 [家暴受害者的数位准备](../scenarios/domestic-violence.md)。

想让暗号本可靠，有几点要记住。约定的意思当面说、别写在会被翻阅的地方。用在小范围、知道的人越少越安全。能换就换，尤其当你怀疑暗号可能被识破时。同一个字不要又当密语又当暗号，两种用途分开。

## 印一本小册带着走

我们把 7776 词表排成一本 A5 掷骰查表小册，含封面、使用教学、QR 与版权页。这就是上面〈如何使用〉方法一要查的那张表的纸本版，不必安装软件、只想掷骰的人，印一本就能上手。

社群在台湾参加工作坊、小聚、研讨会这类实体活动时，也会带几本印好的小册到现场发送。如果你在活动里拿到一本、或刚好遇到我们，非常欢迎过来聊聊，问密语、问匿名网络，或只是打声招呼都可以。想知道我们最近会出现在哪，见 [活动参与](../activity/index.md)。想直接找我们，可以到社群的 Matrix（入口见 [沟通与协作工具](../community/tools.md)），或 [持续关注](../contact.md) 我们的后续消息。

!!! tip "下载 A5 小册（PDF）"
    [asian_diceware_7776_booklet_a5_v0.4.0.pdf](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.4.0.pdf){target="_blank"}（约 36 页，用家里或便利店的打印机打印 A4、对折成册即可）。词表资料采 CC-BY-4.0，欢迎自行打印、发放与再利用，请保留版权页的出处标注。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-key-variant: 密码管理器入门](./password-manager.md)
- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-lock-outline: 端对端加密如何运作](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-source-branch: Tor Project 生态与对接](../community/tor-project-ecosystem.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)
- [:material-hand-coin-outline: 匿名支付研究专题](../community/payments-research.md)

</div>

[^bip39]: [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039.mediawiki){target="_blank"} - Bitcoin Improvement Proposals（含多语词表，繁体中文涵盖台湾、香港、澳门）
[^pwmgr]: [Bitwarden Passphrase Generator](https://bitwarden.com/password-generator/){target="_blank"} 与 [1Password Password Generator](https://1password.com/password-generator/){target="_blank"}
[^anonticket]: [Anonymous GitLab Ticketing: An Exciting New Project at Tor](https://blog.torproject.org/anonymous-gitlab/){target="_blank"} - The Tor Project
[^securedrop]: [SecureDrop](https://securedrop.org/){target="_blank"} - Freedom of the Press Foundation
[^xkcd]: [Password Strength（xkcd 936）](https://xkcd.com/936/){target="_blank"} - xkcd
[^tails]: [Creating the Persistent Storage](https://tails.net/doc/persistent_storage/create/){target="_blank"} - Tails
[^eff]: [EFF Dice-Generated Passphrases](https://www.eff.org/dice){target="_blank"} - Electronic Frontier Foundation
[^reinhold]: [The Diceware Passphrase Home Page](https://theworld.com/~reinhold/diceware.html){target="_blank"} - Arnold G. Reinhold
[^proton]: [What is password entropy?](https://proton.me/blog/what-is-password-entropy){target="_blank"} - Proton
[^pgpwords]: [PGP word list](https://en.wikipedia.org/wiki/PGP_word_list){target="_blank"} - Wikipedia
