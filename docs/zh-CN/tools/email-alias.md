---
title: 邮件别名怎么用，以及它把信任交给谁
description: 转发别名、自有域名 catch-all 与加号子地址的差别，别名在什么场合有效、什么场合接不上，以及台湾的实际情境。
icon: material/email-multiple-outline
---

# :material-email-multiple-outline: 邮件别名怎么用，以及它把信任交给谁

「每个身分要有自己的 email」是 [怎么维持多个网络身分](../basics/multiple-identities.md) 的第一条要求，照字面执行会卡住，五个身分代表五个信箱、五组密码、五组两步验证，多数人开到第三个就放弃。邮件别名把要求降到可执行的程度，一个信箱底下产生任意多个对外地址，每个服务给一个，需要时单独关掉。代价是往来记录集中到转发商手上。

别名处理的是同一个地址在多个服务之间被串连，以及泄露之后查不出责任方。收件箱已经被诈骗信与钓鱼信淹没的话，别名帮不上忙，换一个地址也躲不掉已经流出去的名单，辨识与处置的做法在 [一般人平常该做到什么](../scenarios/everyday-baseline.md)。挑之前可以先看 [威胁模型如何建立](../basics/threat-model.md)，确认自己在抗谁。

!!! tip "时间有限的话，先看这几点"

    - 一个信箱底下产生多个对外地址，每个服务给一个。泄露时看收件地址就知道是哪一家流出去的
    - 加号子地址（`you+shop@gmail.com`）挡不住任何人，把加号后面删掉就还原成本尊
    - 转发服务把往来记录集中到一家运营商手上，信任的总量没有变少，换了受托对象
    - 自有域名的 catch-all 门槛最高，而且域名注册资料公开可查，等于把真名贴在所有别名旁边
    - 银行、券商、政府这类已经掌握你实名资料的服务，别名换不到身分隔离

## 别名运作起来是什么样子

你想订某个环境团体的电子报，表单要填 email。你到转发服务按一下产生，取得 `amaze-gem-spider@duck.com`，填进表单送出。

对方的名单里从此只有 `amaze-gem-spider@duck.com`，你真正的 `wang.xiaoming@gmail.com` 没有出现过。电子报寄出来之后由转发服务接收，再原封转进你平常的 Gmail 收件箱。你在同一个 App 里读信，不必多开一个信箱、不必记第二组密码。

半年后，寄到 `amaze-gem-spider@duck.com` 的健身房广告与投资诈骗信开始出现。地址只给过那个团体，你当下就知道名单从哪里流出去。

你到转发服务的后台把它关掉。之后寄到该地址的信一律退回，收件箱安静下来。整个过程不必联络任何人、不必找退订链接、不必删掉在该团体的账号，而你的 Gmail 地址从头到尾没有离开自己手上。

要主动回信给该团体会多一道手续，见后面的「别名接不上的场合」。

## 别名解决的三件事

### 减少服务之间的比对支点

[社交平台怎么收集你的数据](../basics/platform-tracking.md) 里列了一项挡不掉的比对，平台之间靠 email 与手机号互相对照，把你在不同服务的账号串成同一个人。二十家服务收到二十个不同地址之后，email 这条线就对不起来了。手机号、[设备与浏览器指纹](../basics/browser-fingerprinting.md)、通讯录上传仍然存在，别名只处理其中一条。

### 泄露可以指名道姓

[一般人平常该做到什么](../scenarios/everyday-baseline.md) 的第一步是到 [Have I Been Pwned](https://haveibeenpwned.com/){target="_blank"} 查自己被哪几次泄露波及。查得到事件，查不到是谁把地址流出去的。

虾皮、超市 App、健身房会员各给一个别名，之后收到一封假冒某品牌、内容却精准对得上你姓名与消费记录的诈骗信，看收件地址就知道名单是哪一家流出去的，不必等对方自己公告。

### 撤销不需要对方配合

关掉一个别名不必经过服务商同意，也不会通知对方。退订钮失效、客服不回、账号删不掉的时候，关别名是你单方面就能完成的动作。

报名一场活动之后被加进主办方的长期电子报，信末的退订链接却指回一个要先注册账号才能操作的后台，关掉当初给出去的别名比走完对方的流程快得多。

## 三种做法

技术门槛差很多。转发服务与信箱内建的别名注册完就能用，自有域名那一种需要你能自己登录域名注册商的后台改设置。

不想读完整个取舍空间的话，照这四行挑：

- 只想少收垃圾信、少被数据中介串连，用转发服务，免费额度就够
- 已经有 Proton、Fastmail 或 iCloud+ 账号，先用它内建的，不必多开一家
- 要经营好几年、不愿意受制于某一家运营商，而且你管得动 DNS，用自有域名
- 要对外公开一个窗口让陌生人写信进来，先看 [记者保护消息来源](../scenarios/journalist.md)，别名在该用途上只是垫底选项

### 转发服务

由第三方运营。你在它的界面产生别名，别人寄到别名的信由它转进你原本的信箱，你的真实地址不会出现在对方手上。

| 服务 | 免费额度 | 付费方案 | 加密转发 | 运营者与管辖地 |
|---|---|---|---|---|
| [DuckDuckGo Email Protection](https://duckduckgo.com/email/){target="_blank"} | 不限数量，地址在 `@duck.com` | 没有付费方案 | 没有，改以不保存信件与标头的声明代替[^ddg-privacy] | DuckDuckGo，美国 |
| [SimpleLogin](https://simplelogin.io/){target="_blank"} | 10 个别名、1 个收件信箱 | 每年 36 美元，解锁无限别名、自有域名、catch-all[^sl-pricing] | 付费方案支持 PGP | Proton，瑞士 |
| [addy.io](https://addy.io/){target="_blank"} | 10 个别名、每月 10 MB 转发流量 | Lite 每月 1 美元、Pro 每月 3 美元 | 所有方案都支持[^addy-faq] | 准据法英格兰与威尔士，服务器在荷兰[^addy-legal] |
| [Firefox Relay](https://relay.firefox.com/){target="_blank"} | 5 个遮罩地址 | 分两级，低阶给无限遮罩与自定子域名，高阶再加号码遮罩。供应范围 34 个国家与地区，不含台湾[^relay] | 没有 | Mozilla，美国 |
| Apple Hide My Email | 没有，需要 iCloud+ 订阅 | 随 iCloud+ 提供[^apple-hme] | 没有 | Apple，美国 |

免费额度够不够用，DuckDuckGo 不限数量，其余是 5 到 10 个。要不要加密转发，addy.io 免费方案就有，SimpleLogin 要付费，其余三家没有。受托对象落在哪一国，担心对手走司法途径调数据的话，这一栏比价格重要。

DuckDuckGo 另外会移除信件里的追踪像素，也就是嵌在信里的一张看不见的图片，用来回报你有没有打开信件。addy.io 官方声明里「不留存」的对象是信件内容，转发服务要运作就得知道哪个别名收到谁寄来的信，收发记录那一层的保留期限要另外看隐私政策。addy.io 也能自建，前提是你维护得动一台装了 Postfix（处理收发信的服务器软件）的机器，官方另提供 Docker 容器版本，没有服务器经验就用官方托管的版本，功能一样。

Apple 的 Hide My Email 整合在 Safari 的表单自动填入、Mail 与「用 Apple 账号登录」的流程里，五家里操作最顺。代价是把身分绑在 Apple ID 底下，[怎么维持多个网络身分](../basics/multiple-identities.md) 里对第三方登录按钮的警告同样适用。

### 自有域名的 catch-all

三种做法里门槛最高的一种，需要你能登录域名注册商的后台修改 DNS 设置。没有操作过的话跳过本节，前两种已经够用。

做法是自己注册一个域名，把寄给该域名的信件全部收进同一个信箱，这种全部照收的设置叫 catch-all。地址随手编，`bank@example.com`、`shop@example.com` 不必事先建立就直接生效。

好处是不依赖任何转发商，对方停止运营或封锁你的账号都不会让你失去全部地址。换信箱服务时，到当初买域名的平台的 DNS 设置页面，把 MX 记录（指定某个域名的信要送去哪台服务器的一项设置）改指向新服务就完成搬家。

catch-all 对还没被使用的地址一律照收，机器人随机猜测的地址寄来的信会全数落地，垃圾信量通常比原本的信箱高出一截。原本的困扰就是收件箱太吵的话，catch-all 会让情况变糟。

域名注册资料（WHOIS）默认公开可查，注册人姓名、地址与联络信箱都在里面，等于把真名贴在所有别名旁边。需要隐藏身分的话，注册时务必加购注册商提供的隐私保护，或改用默认就代为隐码的注册商，确认过再开始用。

同一个域名底下的别名彼此可连。`bank@example.com` 与 `dating@example.com` 共用一个域名，看到其中一个的人就知道另一个存在，加上公开的注册资料与有服务专门保存的域名设置变更历史，整组地址可以连回同一个人。抗垃圾信与泄露溯源时无所谓，做身分隔离时会直接毁掉隔离。[怎么维持多个网络身分](../basics/multiple-identities.md) 的次要层要用自有域名的话，域名必须另外注册、注册人资料独立、且不与长期层共用。

### 信箱服务内建的别名

信箱或密码管理器本身就附别名功能，例如 Fastmail 的 Masked Email、Proton Pass 内建的别名（底层即 SimpleLogin）与 iCloud+ 的 Hide My Email。设置成本最低，代价是别名与该服务绑在一起，离开时别名一并消失。

### 三种做法的取舍

| 面向 | 转发服务 | 自有域名 catch-all | 信箱内建 |
|---|---|---|---|
| 起步成本 | 注册即用 | 买域名、改 DNS 设置 | 已有账号就能用 |
| 谁看得到往来记录 | 转发商 | 你的信箱服务商 | 信箱服务商 |
| 搬家难度 | 换转发商等于换掉所有地址 | 改 MX 指向新服务 | 别名跟着账号一起消失 |
| 被服务商挡掉 | 常见，共用域名被个别网站误判 | 少见 | 视域名而定 |
| 别名彼此可连 | 随机字符串产生时不易连 | 同域名，可连 | 视产生方式而定 |
| 注册资料是否公开 | 否 | 是，WHOIS 查得到注册人姓名与地址 | 否 |
| 适合 | 一般日常账号隔离 | 长期经营且能管 DNS 的人 | 已在该生态系内的使用者 |

## 加号子地址挡不住任何人

`you+shop@gmail.com` 常被当成免费的别名，实际上防护力接近零。在邮件规格里，加号后面那一段本来就是可有可无的备注，前面那一段才是真正的账号[^rfc5233]。任何取得地址的人把加号后面删掉，就还原出本尊 `you@gmail.com`。

你在虾皮用 `you+shopee@gmail.com` 注册，虾皮的会员名单泄露后被整理转卖，取得名单的人删掉 `+shopee` 就得到你的正式地址。会卖名单与会被入侵的对象，正好是最有动机去删的一方。

加号子地址适合的用途是收件分类与规则设置，把订阅信自动归档进文件夹。拿它做身分隔离无效，[怎么维持多个网络身分](../basics/multiple-identities.md) 那套分层需求它一项都满足不了。

## 别名把往来记录集中到一家

改用转发之后，二十家服务各自只留下你的一个别名，转发商的记录里有全部二十家、每封信什么时候到、以及没有加密时的信件内容。信任的总量没有变少，换了受托对象。

要压缩转发商看得到的范围，有几种做法。addy.io 全方案与 SimpleLogin 付费方案支持用你自己的 PGP 公钥加密转发内容，转发商就读不到内文。前提是你已经有一组自己的 PGP 密钥对并且保管得住私钥，站上目前还没有产生密钥的教学，没有密钥的话这条路等于关着，改从司法管辖地与服务商的留存政策去挑，门槛低很多。收发双方、时间与信件大小仍然留在转发商手上，[Metadata 是什么](../basics/metadata.md) 描述的外围信息照样完整。DuckDuckGo 的说明页写的是连标头都不保存，你信不信任那份声明是另一回事。自建 addy.io 把受托对象换成你自己，代价写在前面那一节。

受托对象落在哪个司法管辖地也要算进去，前面表格最后一栏就是这一项。对手要透过司法途径向转发商调数据时，走哪一国的程序、需要多久、你会不会被告知，都取决于受托对象落在哪一国。

选择之前先问自己抗的是谁。抗数据中介与垃圾信，转发服务绰绰有余。抗有能力对转发商调数据的对手，加密转发或自建才有意义，[威胁模型如何建立](../basics/threat-model.md) 有判断流程。

### 别人主动写信进来时，暴露的是对方

上面谈的都是你去注册服务时留下什么。把别名当成公开的联络窗口、让陌生人主动写信进来，暴露的对象就换成寄信的那一方。转发商收到的是对方的原始发件地址、寄信时间与来源 IP，你这端的别名反而是被保护的一边。

替二十个消息来源各建一个别名也解决不了问题，因为二十个别名全部指向同一个信箱，转发商的记录看得出它们属于同一个人。转发商被要求交出数据或本身遭到入侵时，二十个来源的关联性会一次暴露给同一个对象。

需要对外挂一个公开收件窗口的话，邮件别名的位置比直接给主信箱好，比专为此设计的管道差。完整取舍见 [记者保护消息来源](../scenarios/journalist.md)，该篇有 SecureDrop、Signal、Tor 上的隐蔽收件箱与 PGP 四种入口的比较，也有消息来源不熟工具时的处理方式。

## 别名接不上的场合

- **需要验证身分的服务**：银行、券商、电信、政府系统本来就掌握你的身分证号与手机号（金融业把这套查验称为 KYC，认识你的客户），别名在这些地方换不到身分隔离，顶多帮你抓出泄露是从哪一家来的
- **有强制力的对手**：法院命令、检警调查或公司内部调查可以直接向转发商索取数据，别名挡不住。要看的是转发商在哪个司法管辖地、有没有开加密转发，见上一节
- **被服务商挡掉**：转发服务的共用域名常被误判为一次性信箱。SimpleLogin 为此设了回报管道，收到回报后逐一与网站联系要求解除封锁，官方文件里写的绕法是改用自己的子域名或自有域名[^sl-block]。主流的 `disposable-email-domains` 封锁清单有意区隔两者，收录的 8,347 个域名里（2026-08-24 查）不含 `duck.com`、`addy.io`、`mozmail.com` 等转发域名。该项目要求提交者附上「该域名可产生一次性地址」的截图才收[^ded]。挡人的是各家自定的规则，不是这份公开清单
- **回信路径**：直接在自己的信箱按回复会露出真实地址。转发商的做法是给每个通信对象一组代发地址（reverse-alias），你回信给它、它再用你的别名转出去，位置在转发商的别名管理页面，转发进来的信件里通常也附了一个可直接回复的地址
- **账号救援**：拿别名当救援信箱的服务，别名一关就救不回账号。关闭之前先确认没有服务依赖它
- **转发商本身的存续**：服务停止运营或封锁你的账号时，共用域名的地址全部失效。长期经营的身分放自有域名比较安全

## 台湾的几个实际情境

电子发票手机条码申请时要填手机号与 email 两项，email 收验证信[^einvoice]。手机号在台湾已经实名，别名在这里换不到身分隔离，换到的是财政部系统泄露时你知道是它流出去的。对方已经握有你的实名资料，别名剩下的价值就是溯源。

个资法 2025 修法给了个人更明确的查询、更正、删除权，以及向个保会申诉的管道（见 [台湾个资法 2025 修法](../taiwan/pdpa-2025.md)）。查询、更正、删除权要行使得出来，前提是你说得出对象是谁。别名把「我的地址不知道被谁卖了」变成「这个地址只给过某某公司」，是行使权利时拿得出来的具体事证。

电商、外卖、购票、健身房会员这类会发促销信也会泄露的服务，每家一个别名收益最高。银行、券商、报税、医保这类需要长期稳定且不能失联的服务，用本尊地址，别为了隔离让自己收不到重要通知。

## 已经在用 Proton Mail 的话

手上已经有 Proton 账号的话，不必再去注册一家转发服务，多一家等于多一个受托对象。Proton 的别名额度按方案切得很细。

| 方案 | hide-my-email 别名 | 说明 |
|---|---|---|
| Proton Free | 10 个 | 账号本来就附 Proton Pass，不必另外注册[^proton-alias] |
| Mail Plus | 10 个 | 与免费版相同。买它换到的是信箱地址数与自有域名，别名数量原地不动[^proton-plans] |
| Proton Unlimited | 无限 | 单独订阅 Pass Plus 也是无限 |
| Mail Essentials（商务入门） | 没有 | 不含 Proton Pass，等于不含别名[^proton-business] |
| Workspace Standard 以上 | 无限 | 加购 Pass for Business（最低 3 席）也可以 |

开别名的位置在 Proton Mail 网页版右侧的 Security Center（盾牌图示），或 Proton Pass 的 App 与浏览器扩展，两边共用同一份额度，底层就是前面提过的 SimpleLogin。

加号子地址在所有方案都能用，而且不占那 10 个额度。前面说过它挡不住任何人，拿来做收件分类仍然有效，可以跟别名并用，别名给会外流的对象，加号地址给只需要分流归档的内部用途。

付费方案配上自有域名之后可以设 catch-all，免费版不行[^proton-catchall]，代价与前面写过的一样。

既有的独立 SimpleLogin 账号可以连结到 Proton 账号。订阅属于 Unlimited、Proton for Business、Family 这几种的话，连结后会自动升级成 SimpleLogin Premium，含无限别名、最多 5 个 catch-all 子域名与 PGP 加密转发。原本另外付费订阅过的人记得取消，避免重复扣款[^proton-simplelogin]。

### 商务方案最容易误判的一点

Mail Essentials 那一列最容易被误判。组织升上商务方案之后，成员能用的别名还是各自免费账号附带的那 10 个，组织层级没有任何整合管理。要在组织层级取得别名，路径是 Workspace Standard 以上的整套方案，或加购 Pass for Business。

Proton 有非营利组织折扣，涵盖 Mail、Drive、VPN、Pass 的商务版。官方页面只写「registered nonprofit organizations with proper documentation」，没有指名国家、没有指定认证机构、也没有公布折扣幅度，全部要联系业务才拿得到报价[^proton-nonprofit]。注册地在哪一国会不会影响资格，公开信息答不出来。折扣影响的是价格，不改变别名功能的规则。

### 多人共用与人员流动

组织如果是全体共用一组账密，10 个别名会全部挂在同一组账号上，没有分权限机制，交接的风险等同交接整个信箱。

用 Pass for Business 的组织要注意密钥库归属。共享密钥库的拥有者删除自己的 Proton 账号时，该密钥库连同里面所有项目一并删除，被分享的人也拿不回来[^proton-vault]。官方文件没有写明成员被管理员移除账号时，他个人密钥库里建的别名会怎么处理。组织共用用途的别名一律建在共享密钥库，导入前先实测一次离职流程。

## 撤销一个别名的流程

底下的流程针对某个服务的通知信箱，不涵盖你长期对外公开的主要地址。已经印在名片、网站与报名表单上多年的组织联络信箱，换掉的成本落在找不到你的人身上，属于改变对外联络方式，要另外规划公告与并行期，别套用底下的步骤。

顺序错了会把自己锁在门外：

1. 先查有没有其他服务拿它当救援信箱或两步验证的备援管道。查法是在信箱里搜索这个地址收过的验证信与密码重设信，发件方就是依赖它的服务，逐一登录把联络地址换掉
2. 到该服务把账号地址改成新别名，完成验证信确认新地址真的收得到
3. 回转发商把旧别名设成停用，不要删除。停用的别名继续挡住寄信，删除之后共用域名的字符串有机会被别人重新注册
4. 自有域名的话，到信箱服务的收件规则设置加一条把该地址丢进垃圾箱，catch-all 不会因为你不再使用就停止接收

[家暴幸存者的数字准备](../scenarios/domestic-violence.md) 描述的离开后重建身分，用得上同一套流程。停用一个别名不会产生任何通知，对方看到的现象是信件退回，看不到你在什么时候做了什么。

## 怎么开始

不必一次处理完所有账号。先开一个转发服务的账号，门槛最低的是 DuckDuckGo Email Protection，免费、数量不限、不需要填付款信息。接着挑一家最常寄促销信的电商，把账号的通知信箱换成新产生的别名，观察两周。

习惯之后照 [一般人平常该做到什么](../scenarios/everyday-baseline.md) 的顺序，趁密码管理器逐站更换密码时顺手把地址一起换掉。

产生别名的部分可以交给密码管理器。开源密码管理器 Bitwarden 的用户名产生器内建六家转发服务的整合[^bw-gen]，SimpleLogin、addy.io、Firefox Relay、Fastmail、Forward Email、DuckDuckGo 都在里面。清单里的 Forward Email 是另一家开源转发服务，前面没有单独介绍。

设置时要先到转发服务的账号设置页面，找「API」或「开发者」分类产生一组密钥，贴进 Bitwarden。之后新增登录项目时就能直接产生别名并存进密钥库。

密钥库本身要备份好。别名散在各处而你只记得几个的状况下，密钥库是唯一一份记录哪个地址对应哪个服务的完整索引，备份与恢复的具体做法见 [密码管理器入门](./password-manager.md) 的「备援与恢复策略」一节。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-account-multiple-outline: 怎么维持多个网络身分](../basics/multiple-identities.md)
- [:material-chat-question: Metadata 是什么](../basics/metadata.md)
- [:material-key-variant: 密码管理器入门](./password-manager.md)
- [:material-newspaper-variant-outline: 记者保护消息来源](../scenarios/journalist.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 个人隐私指引研究专题](../community/privacy-guide.md)
- [:material-lifebuoy: 紧急求救](../help/index.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^sl-pricing]: [SimpleLogin Pricing](https://simplelogin.io/pricing/){target="_blank"} - 免费与付费方案的别名数、信箱数、自有域名与 PGP 支持范围在此页。运营者 Proton 注册于瑞士，写在 [SimpleLogin 首页](https://simplelogin.io/){target="_blank"}。
[^addy-faq]: [addy.io FAQ](https://addy.io/faq/){target="_blank"} - GPG 加密转发的方案范围、自建所需的 Postfix 设置与信件留存政策在此页。方案限额见 [addy.io 首页](https://addy.io/){target="_blank"}。
[^addy-legal]: [addy.io Terms](https://addy.io/terms/){target="_blank"} 与 [Privacy](https://addy.io/privacy/){target="_blank"} - 准据法为英格兰与威尔士法律，数据存放于荷兰的服务器，两项分别写在这两页。
[^relay]: [Firefox Relay](https://relay.firefox.com/){target="_blank"} - Mozilla，免费方案 5 个遮罩、付费两级的功能差异与 34 个供应国家与地区的清单在此页。
[^ddg-privacy]: [Does DuckDuckGo save my email messages?](https://duckduckgo.com/duckduckgo-help-pages/email-protection/privacy/does-duckduckgo-save-my-messages){target="_blank"} - DuckDuckGo 说明页，不保存信件与标头的说明在此页。地址型态见 [Duck Addresses](https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses){target="_blank"}。
[^apple-hme]: [Set up and use Hide My Email in iCloud+](https://support.apple.com/guide/icloud/set-up-hide-my-email-mm9d9012c9e8/icloud){target="_blank"} - Apple Support，需要 iCloud+ 订阅与可产生地址的位置在此页。
[^rfc5233]: [RFC 5233: Sieve Email Filtering: Subaddress Extension](https://www.rfc-editor.org/rfc/rfc5233.html){target="_blank"} - IETF 的邮件规格文件，把加号前的部分定名为 user、加号后的部分定名为 detail。
[^sl-block]: [Report blocking website](https://simplelogin.io/docs/report-blocking-website/){target="_blank"} - SimpleLogin 文件，回报流程与改用自有域名的建议在此页。
[^ded]: [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains){target="_blank"} - 社区维护的一次性信箱域名清单，提交新域名需附上可产生一次性地址的截图。
[^einvoice]: [手机条码申请](https://www.einvoice.nat.gov.tw/accounts/signup/mw){target="_blank"} - 财政部电子发票整合服务平台，手机号与 email 两项验证流程在此页。
[^proton-alias]: [Hide-my-email aliases](https://proton.me/support/pass-email-alias){target="_blank"} - Proton 支持文件，免费方案与 Mail Plus 各 10 个、Pass Plus 与 Unlimited 无限，以及建立别名的界面位置在此页。
[^proton-plans]: [Proton plans](https://proton.me/support/proton-plans){target="_blank"} - Proton 支持文件的方案对照表，各方案的信箱地址数与 hide-my-email 额度在此页。
[^proton-catchall]: [Catch-all addresses](https://proton.me/support/catch-all){target="_blank"} - Proton 支持文件，catch-all 需搭配自有域名且限付费方案。
[^proton-business]: [Proton for Business](https://proton.me/support/proton-for-business){target="_blank"} - Proton 支持文件，Mail Essentials 的地址数与自有域名数，以及 Proton Pass 只在 Workspace 与 Pass for Business 方案的分野在此页。
[^proton-simplelogin]: [Link your SimpleLogin account to your Proton Account](https://proton.me/support/link-simplelogin-account-proton-account){target="_blank"} - Proton 支持文件，自动升级的方案清单、SimpleLogin Premium 的内容与重复扣款提醒在此页。
[^proton-nonprofit]: [Nonprofit discount](https://proton.me/business/nonprofit-discount){target="_blank"} - Proton 商务方案的非营利折扣页，资格叙述与需联系业务取得报价在此页。
[^proton-vault]: [Share vaults in Proton Pass](https://proton.me/support/pass-browser-share){target="_blank"} - Proton 支持文件，共享密钥库拥有者删除账号会连带删除整个密钥库的说明在此页。
[^bw-gen]: [Username Generator](https://bitwarden.com/help/generator/){target="_blank"} - Bitwarden 说明文件，六家转发服务的整合清单在此页。
