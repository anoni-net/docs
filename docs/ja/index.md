---
title: ホーム
description: 台湾を拠点に、アジア太平洋の中国語圏におけるネットワークの自由を観測しているボランティアコミュニティです。
icon: material/home-circle
hide:
  - navigation
  - toc
---

# <img src="./assets/images/logo-tonal.svg" alt="anoni.net logo" class="hero-icon"> anoni.net Docs

> 台湾を拠点に、アジア太平洋の中国語圏におけるネットワークの自由を観測しているボランティアコミュニティです。

[:material-account-group: 私たちについて](./about/index.md){ .md-button .md-button--primary } [:material-email-fast-outline: ニュースレター](./contact.md){ .md-button } [:material-chat-processing-outline: Matrix](https://matrix.to/#/#community:im.anoni.net){ .md-button target="_blank" rel="noopener" }

## :material-compass-outline: このサイトの位置づけ

[OONI](https://ooni.org/){target="_blank"}（世界のネット検閲を計測している国際的な観測プロジェクト）のネットワーク観測、Tor リレーの監視、そして現地で活動している人が書く文脈を組み合わせています。対象地域は中国大陸、香港・マカオ、シンガポール、マレーシア、台湾、および中国語圏のディアスポラです。

プライバシー入門サイトではありません。Tor、Tails、OONI、Signal などの基礎的な解説や一般的なデジタルセキュリティについては、[EFF Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}、[Privacy Guides](https://www.privacyguides.org/){target="_blank"}、[Tor Project サポートポータル](https://support.torproject.org/){target="_blank"} といった定評のある資料があり、私たちはその仕事を重複させません。私たちが付け加えられるのは、それらのサイトの体制では生み出しにくい地域固有の文脈と、現地からの観測です。

日本語版に収録している概念の 3 本も、入門の代わりではありません。既存の教材が個別には丁寧に説明していても、並べて比べたところは手薄になりがちで、そこを埋めることを狙っています。

## :material-map-outline: 日本の読者にとっての接点

日本語版を作っている直接のきっかけは、日本の読者から「内容を自分で訳して読んでいる」という声が届いたことです。

<div class="grid cards" markdown>

- :material-server-network:{ .lg .middle style="color: var(--brand-cyan-500);" } **日本の Tor リレーは継続的に計測しています**

    ---

    Tor リレー監視システム Pulse は、台湾、香港、**日本**、韓国の 4 地域を対象に、稼働状況、バージョン、ASN、ノード種別、フラグの分布を記録しています。日本は監視 4 地域のうち最も規模が大きく、**稼働中 66 台、合計帯域 464.5 MB/s**（2026-07-03 時点）で、**31 の ASN に分散**しています（2026-07-06 時点）。同じ時期の韓国は 22 台、香港 21 台、台湾 13 台です。

    [:octicons-arrow-right-24: Tor リレー観測](./regional/tor-relay-watcher.md)

- :material-earth:{ .lg .middle style="color: var(--brand-cyan-500);" } **地域の検閲動向は地続きです**

    ---

    中国大陸で使われている検閲装置は国外へも輸出されており、その調達先と機能は漏洩レポートで具体的に確認できます。日本に拠点を置く事業者が同じ地域でサービスを出すとき、香港の国家安全維持法以降の要請対応や、越境時の端末検査は実務上の判断材料になります。

    [:octicons-arrow-right-24: 地域観測](./regional/index.md)

- :material-account-multiple-outline:{ .lg .middle style="color: var(--neutral-muted);" } **道具とその限界をめぐる議論は共通です**

    ---

    匿名性、プライバシー、仮名性、機密性をどう区別するか、メタデータが何を漏らすか、脅威モデルをどう立てるか。日本語版はまずこの層から収録を始め、日本の制度に接続する記述を加えています。

    [:octicons-arrow-right-24: 基本概念](./basics/index.md)

</div>

!!! info "日本は「計測対象」であって「観測対象」ではありません"

    紛らわしいので先に区切っておきます。私たちが日本について継続的に扱っているのは **Tor リレーの計測だけ**です。日本の法制度や言論環境は追っていません。地域観測のセクションが扱うのは中国大陸、香港・マカオ、シンガポール、マレーシア、台湾です。

## :material-book-open-page-variant-outline: 現在収録しているページ

<div class="grid cards" markdown>

- [:material-lightbulb-outline: 基本概念](./basics/index.md)

    ---

    道具を選ぶ前に必要な語彙と枠組み。[匿名・プライバシー・仮名・機密](./basics/anonymity-vs-privacy.md)、[メタデータはなぜ危険か](./basics/metadata.md)、[脅威モデルの立て方](./basics/threat-model.md)の 3 本。この順に読むと噛み合います。

- [:material-map-outline: 地域観測](./regional/index.md)

    ---

    アジア太平洋の中国語圏で何が起きているかの記録。[Tor リレー観測](./regional/tor-relay-watcher.md)は Pulse の実データで、日本を既定表示にしています。

- [:material-account-box-outline: 私たちについて](./about/index.md)

    ---

    運営体制、提携先、公開しているもの、そして私たちの主張を外から検証する方法。

- [:material-email-fast-outline: 連絡先](./contact.md)

    ---

    ニュースレター、暗号化メール、PGP 公開鍵、Matrix への参加方法。

</div>

## :material-translate: 日本語版について

日本語版は、繁体字中国語版（zh-TW）から**日本の読者に価値があると考えたページだけを選んで訳す**方式で運用しています。全ページの対訳ではありません。繁体字中国語版は 2026 年時点で 168 ページあり、全訳を宣言すると必ず追いつかなくなるからです。全訳をやめて、価値の高い順に厚くしていきます。

収録されていないページは、[英語版](https://anoni.net/docs/en/){target="_blank"} または[繁体字中国語版](https://anoni.net/docs/){target="_blank"}でお読みいただけます。日本語版の URL で存在しないページを開いた場合は、404 ページが英語版と繁体字中国語版の対応ページを自動で案内します。各ページの末尾には対応する原文へのリンクを置いています。

!!! tip "翻訳の品質について、力を貸してください"

    日本語版の初稿は原文の文脈を踏まえて書き起こしていますが、日本語母語話者による校正を経ていません。技術用語の訳し分けや言い回しに違和感があれば、[GitHub の Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> までお知らせください。

    すでに私たちの記事をご自身で訳して読んでくださっている方には、その作業を繰り返す代わりに、こちらの初稿を直す形で関わっていただけると助かります。訳語の判断基準は[訳語の方針](./translation-glossary.md)にまとめてあるので、直す前に見ておいてください。

### 次に訳す候補

優先順位はご要望を見て決めます。読みたいものがあれば [GitHub の Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> でお知らせください。

| 原文 | 内容 |
|---|---|
| ネットワークの自由がなぜ重要か | このサイトの主張の中核。東アジアと東南アジアの地域的な枠組みと、接続・個人データ・資金の流れという 3 つの観測軸 |
| メッセージングツールの比較 | Signal、Telegram、LINE などを、電話番号による登録が実在の身元を固定するという観点で比べたもの |
| Tor リレーの立て方 | 中継の種類ごとの手順と運用上の注意 |
| 暗号化 DNS の選び方と確認方法 | DoH / DoT / DoQ の違い、事業者の選択、各 OS での設定、壊れたときの挙動 |
| 記者のための場面別ガイド | 情報源の保護を主題にした実践編 |
| DV の場面 | 離れる前後の準備。日本の相談窓口はすでに[脅威モデルの立て方](./basics/threat-model.md)に収録済み |

---

原文：[匿名網路社群 anoni.net/Docs](https://anoni.net/docs/){target="_blank"}（繁体字中国語）

この日本語訳は初稿で、日本語母語話者の校正を経ていません。気になる箇所は [Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> へ。方針は[訳語の方針](./translation-glossary.md)にあります。
