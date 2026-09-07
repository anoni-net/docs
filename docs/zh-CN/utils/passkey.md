---
title: passkey 钥匙
description: 创建一把 anoni.net 的 passkey，存进你的密码管理器或钥匙串，试一次解锁，再生成备援密钥。没有账号、没有服务器，站上什么都不存。
icon: material/fingerprint
offline_assets:
  # typage 與相依的 noble、scure 由 import map 接到 vendor/age/，hooks/offline_index.py 只認
  # <script src>，所以逐一列在下面。清單由 tools/test_agecrypt.mjs 對照 vendor 目錄。
  - utils/vendor/age/age-encryption/dist/armor.js
  - utils/vendor/age/age-encryption/dist/cbor.js
  - utils/vendor/age/age-encryption/dist/format.js
  - utils/vendor/age/age-encryption/dist/index.js
  - utils/vendor/age/age-encryption/dist/io.js
  - utils/vendor/age/age-encryption/dist/recipients.js
  - utils/vendor/age/age-encryption/dist/stream.js
  - utils/vendor/age/age-encryption/dist/webauthn.js
  - utils/vendor/age/age-encryption/dist/x25519.js
  - utils/vendor/age/noble-ciphers/_arx.js
  - utils/vendor/age/noble-ciphers/_poly1305.js
  - utils/vendor/age/noble-ciphers/chacha.js
  - utils/vendor/age/noble-ciphers/utils.js
  - utils/vendor/age/noble-curves/abstract/curve.js
  - utils/vendor/age/noble-curves/abstract/edwards.js
  - utils/vendor/age/noble-curves/abstract/fft.js
  - utils/vendor/age/noble-curves/abstract/hash-to-curve.js
  - utils/vendor/age/noble-curves/abstract/modular.js
  - utils/vendor/age/noble-curves/abstract/montgomery.js
  - utils/vendor/age/noble-curves/abstract/oprf.js
  - utils/vendor/age/noble-curves/abstract/weierstrass.js
  - utils/vendor/age/noble-curves/ed25519.js
  - utils/vendor/age/noble-curves/nist.js
  - utils/vendor/age/noble-curves/utils.js
  - utils/vendor/age/noble-hashes/_md.js
  - utils/vendor/age/noble-hashes/_u64.js
  - utils/vendor/age/noble-hashes/hkdf.js
  - utils/vendor/age/noble-hashes/hmac.js
  - utils/vendor/age/noble-hashes/pbkdf2.js
  - utils/vendor/age/noble-hashes/scrypt.js
  - utils/vendor/age/noble-hashes/sha2.js
  - utils/vendor/age/noble-hashes/sha3.js
  - utils/vendor/age/noble-hashes/utils.js
  - utils/vendor/age/noble-post-quantum/_crystals.js
  - utils/vendor/age/noble-post-quantum/hybrid.js
  - utils/vendor/age/noble-post-quantum/ml-kem.js
  - utils/vendor/age/noble-post-quantum/utils.js
  - utils/vendor/age/scure-base/index.js
---

# :material-fingerprint: passkey 钥匙

创建一把 anoni.net 的 passkey，存进你的密码管理器或钥匙串。之后站上要保护你的数据时，就请这把 passkey 开锁，每一次都要你用指纹、脸或 PIN 同意。没有账号、没有服务器、没有任何识别码离开设备。只用准备清单这类工具的话，下面「怎么用」的第一步按一次就够。钥匙的强度等于保管它的地方：知道你手机解锁密码、或能打开你密码管理器的人，一样开得了。同一把 passkey 在站上有两种用法，下面分开讲。passkey 是什么、两种用法各靠什么机制、限制在哪，见[什么是 passkey](../tools/what-is-passkey.md)。

<script type="importmap">
{
  "imports": {
    "age-encryption": "../vendor/age/age-encryption/dist/index.js",
    "@noble/ciphers/chacha.js": "../vendor/age/noble-ciphers/chacha.js",
    "@noble/curves/abstract/edwards.js": "../vendor/age/noble-curves/abstract/edwards.js",
    "@noble/curves/abstract/fft.js": "../vendor/age/noble-curves/abstract/fft.js",
    "@noble/curves/abstract/montgomery.js": "../vendor/age/noble-curves/abstract/montgomery.js",
    "@noble/curves/abstract/weierstrass.js": "../vendor/age/noble-curves/abstract/weierstrass.js",
    "@noble/curves/ed25519.js": "../vendor/age/noble-curves/ed25519.js",
    "@noble/curves/nist.js": "../vendor/age/noble-curves/nist.js",
    "@noble/curves/utils.js": "../vendor/age/noble-curves/utils.js",
    "@noble/hashes/hkdf": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hkdf.js": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hmac": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/hmac.js": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/scrypt.js": "../vendor/age/noble-hashes/scrypt.js",
    "@noble/hashes/sha2": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha2.js": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha3.js": "../vendor/age/noble-hashes/sha3.js",
    "@noble/hashes/utils": "../vendor/age/noble-hashes/utils.js",
    "@noble/hashes/utils.js": "../vendor/age/noble-hashes/utils.js",
    "@noble/post-quantum/hybrid.js": "../vendor/age/noble-post-quantum/hybrid.js",
    "@scure/base": "../vendor/age/scure-base/index.js"
  }
}
</script>

<div id="passkey-tool"></div>
<script src="../../js/vault.js"></script>
<script src="../../js/passkey.js"></script>

## 怎么用

1. 按「创建 passkey」，浏览器会问你要存到哪里。存到会同步的地方（iCloud 钥匙串、Google 密码管理器、Bitwarden、1Password），其他设备才能用同一把。创建前先确认要存的那个账号没有跟你要防的人共用，共用的 iCloud 或 Google 账号会把这把 passkey 同步到对方的设备上，见[家暴受害者的数位准备](../scenarios/domestic-violence.md)。iPhone 没有另外装密码管理器的话，「iCloud 钥匙串」就是手机平常替你记密码的那个功能，选它就好。Android 的 Chrome 会列出手机上启用的密码管理器，选单里没有你要的 Bitwarden 这类 app，先到系统设置的「密码与账号」把它开起来再回来创建。Windows 上的浏览器会先提议存在这台电脑（Windows Hello），只用这台电脑的话维持默认就好，要同步就改选你的密码管理器或 Google 账号那一项。窗口由系统显示，语言跟系统一样，最后会要你输入登录用的 PIN、指纹或脸。创建好之后画面会列出它能做哪些事，你的密码管理器里也会多一笔名字叫 anoni.net 的项目，翻得到密码管理器的人看得到这个名字，「站上什么都不存」说的是服务器那一端。
2. 要用清单那类工具，到这里就好。打开[我的准备清单](checklist.md)按「用我已有的钥匙开」。
3. 要用本机文件加密，先按「试解锁」确认这个环境算得出密钥，再按「生成备援密钥」，把私钥存进密码管理器、放在跟密文不同的地方。做完到[本机文件加密](age.md)选「passkey」模式。

## 这把钥匙能做什么

同一把 passkey 在站上有两种用法，机制不同，能用的环境也不同。

### 暂存区

创建时站上生成一把数据密钥，放进 passkey 里跟着它走。之后在任何有这把 passkey 的设备上验证一次，数据密钥就回来，站上用它解开存在你设备里的密文。[我的准备清单](checklist.md)、[威胁模型清单](threat-model.md)的存档、本机文件加密里的收件人簿都放在这个暂存区，三个共用同一份密文。规格要求任何保管方式都把它交回来，我们在 iPhone 配 Bitwarden 与电脑的 Chrome 上验过。数据密钥跟着 passkey 存在密码管理器里，安全等于那个管理器的安全：知道你屏幕锁或主密码的人、共用的 vault、导出文件，都拿得到，细节见[什么是 passkey](../tools/what-is-passkey.md)。

passkey 丢了，暂存区就无法解开。清单重勾就好，威胁模型存档与收件人簿会一起没，要留退路就用清单页的「导出」或「传到另一台」多放一份。

### 文件加密

[本机文件加密](age.md)请 passkey 用 PRF 现场算出密钥。跟暂存区的差别：数据密钥是凭证里的一个字段，密码管理器看得到，导出文件可能也带着。PRF 的秘密只以算出来的结果离开验证器，网页与画面上都看不到原始秘密。密码管理器本身被打开的话，两种用法都守不住。代价是只有部分保管方式做得到，见下面的表格。加密时预设同时加密给 passkey 与备援密钥，两把任何一把都开得了。备援那一把可以取消，取消之后只有 passkey 开得了，代价写在加密工具的画面上。

有几种情况还是该用密语模式：

- 要在别台电脑用 age 命令行解开，而那台电脑没有你的 passkey
- 要给别人，对方不可能有你的 passkey
- 你用 Tor Browser，它整个关闭 WebAuthn
- 你要用的设备无法算出密钥，见下面的表格

两种模式输出的都是标准 age 文件，差别只在收件人是谁。同一份数据两种各做一份、放在不同地方，也是可以的。

## 存到哪里

别的网站用 passkey 登录，需要的只是签个名证明是你，任何保管方式都做得到，暂存区也只需要这个能力。文件加密要它多做一件事，算出一把加密密钥，那个能力要保管方式另外实现才有。所以同一把 passkey 在别的网站与暂存区好好的，文件加密却可能无法算出密钥。下面这张表列的就是哪些做得到。只用清单这类暂存区工具的话，每一行都可以，看第三栏就好，第四栏只跟文件加密有关。

| 存放位置 | 会不会同步到其他设备 | 暂存区 | 文件加密算得出密钥吗 |
|---|---|---|---|
| iCloud 钥匙串 | 会，Apple 设备之间 | 可以 | macOS 15、iOS 18.4 以上 |
| Google 密码管理器 | 会 | 可以 | Android 的 Chrome |
| Bitwarden、1Password、Dashlane | 会 | 可以 | 电脑上的浏览器扩展可以，iPhone 与 iPad 的 app 不行，Android 的 app 没测过 |
| Windows Hello | 只在这台电脑 | 可以 | Windows 11 加 2026 年 2 月更新之后 |
| USB 安全密钥 | 带着走 | 本页不支持 | 本页不支持，它需要另一种保管方式 |

这张表只列我们测过的组合。没列到的保管方式，例如 KeePassXC 这类桌面密码管理器，暂存区一样能用，文件加密算不算得出密钥，用「怎么用」第三步的「试解锁」当答案。

### 只有文件加密要在 iPhone 与 iPad 上选 iCloud 钥匙串

只用暂存区的话，存哪里都行。要用文件加密的话，创建时选 iCloud 钥匙串。Apple 的实现不把算密钥要用的数据传给 iCloud 钥匙串以外的保管方式，选了第三方密码管理器的 app，passkey 创建得起来，钥匙页会说这一把只给暂存区用。在另一台设备上扫 QR code 创建的那条路也一样拿不到。要在哪一台设备上做文件加密，就在那一台上直接创建。

## 两台以上的设备

三条路，对应不同的处境。

### 让 passkey 跟着你走

存在会同步的地方，另一台设备上这把 passkey 已经在了，不用再创建一把。跟着过去的是钥匙，暂存区的数据还留在原来那台，要用清单页的「导出」或「传到另一台」搬过去，另一台再用同一把解开。文件加密的文件本来就是文件，带到哪台都用同一把开。代价是那个密码管理器的账号变成单点，账号没了，所有设备上的钥匙一起没。

### 登录另一台设备

passkey 不会同步过去的第二台（例如手机用 iCloud 钥匙串、电脑用 Windows Hello，或两台同类设备没登录同一个密码管理器账号），在[我的准备清单](checklist.md)解开后按「登录另一台设备」，另一台按「用另一台的钥匙登录这台」拍 QR code 或贴上字串，另一台就创建出一把用同一份数据密钥的 passkey。这条路只给暂存区。画面上那串就是数据密钥本身，只在自己的两台设备之间用。暂存区的数据再用「传到另一台」搬。那串一旦被拍到就收不回来，也没有换掉的功能，只能清掉暂存区、重建一把 passkey 再把数据搬回来。创建了不只一把 passkey 的话，密码管理器里只看得到创建的日期与时间，分不出哪把做得到文件加密。创建好当下钥匙页会念出名字并说这一把能不能，到密码管理器把它改名（例如加上「文件加密」），选单里才分得出来，之后也可以靠「试解锁」分辨。

### 用备援私钥开文件

Windows Hello 这种只留在本机的环境，另一台设备上没有那把 passkey，解密时把备援私钥贴进去。这条路只给文件加密，不依赖任何云端账号，代价是私钥会比较常出现在剪贴板与屏幕上，它一旦外流，加密就等于没做。

主力设备用会同步的 passkey，备援私钥收在密码管理器里当最后一道，两者放在不同地方，是多数人适用的安排。

## 注意

- passkey 绑在 `anoni.net` 这个域名。镜像站、onion 地址无法使用，Tor Browser 整个关闭 WebAuthn。
- passkey 丢了、密码管理器的账号没了，用它加密的文件只剩备援密钥可以解开，备援密钥也丢了就永远无法打开，没有任何人能救。暂存区只剩你用导出或传到另一台多放的那一份。
- 站上不会存任何跟 passkey 有关的东西，也查不出你有没有建过。页面每次打开都是空的，刻意如此。
- 第一次使用需要联网把程序抓回来，之后会留在设备上。
- 要删掉这把 passkey：iPhone 在设置的「密码」里搜 anoni.net，Android 在 Google 密码管理器，Bitwarden 与 1Password 在它们的项目里，其他密码管理器在它们的项目里搜 anoni.net。清单页的「清除这台设备的暂存区」只删这台设备上的密文，passkey 要另外删。
- 密码管理器的导出文件与共享的 vault 会带着 passkey，也就带着暂存区的数据密钥，留意它们的去向。
- 清单页闲置 5 分钟会自动锁上，离开前还是按一下「锁上」。
