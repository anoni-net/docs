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

## :material-translate: 日本語版について

日本語版は、繁体字中国語版（zh-TW）から**日本の読者に価値があると考えたページだけを選んで訳す**方式で運用しています。全ページの対訳ではありません。

この方式を選んだ理由は 2 つあります。第一に、繁体字中国語版は 2026 年時点で 168 ページあり、90 日で 99 ページ増えるペースで更新されています。全訳を宣言すると必ず追いつかなくなり、訳されていないページがあること自体を、読者に訳し漏れだと受け取られてしまいます。第二に、このサイトの内容は台湾の法制度や中国語圏の検閲観測に強く紐づいており、日本の読者にとっての価値はページごとに大きく異なります。選んで訳すほうが誠実です。

収録されていないページは、[英語版](https://anoni.net/docs/en/){target="_blank"} または[繁体字中国語版](https://anoni.net/docs/){target="_blank"}でお読みいただけます。日本語版の URL で存在しないページを開いた場合は、404 ページが英語版と繁体字中国語版の対応ページを自動で案内します。

!!! tip "翻訳の品質について、力を貸してください"

    日本語版の初稿は原文の文脈を踏まえて書き起こしていますが、日本語母語話者による校正を経ていません。技術用語の訳し分けや言い回しに違和感があれば、[GitHub の Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> までお知らせください。

    すでに私たちの記事をご自身で訳して読んでくださっている方には、その作業を繰り返す代わりに、こちらの初稿を直す形で関わっていただけると助かります。

## :material-compass-outline: このサイトの位置づけ

OONI のネットワーク観測、Tor リレーの監視、そして現地で活動している人が書く文脈を組み合わせています。対象地域は中国大陸、香港・マカオ、シンガポール、マレーシア、台湾、および中国語圏のディアスポラです。

プライバシー入門サイトではありません。Tor、Tails、OONI、Signal などの基礎的な解説や一般的なデジタルセキュリティについては、[EFF Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}、[Privacy Guides](https://www.privacyguides.org/){target="_blank"}、[Tor Project サポートポータル](https://support.torproject.org/){target="_blank"} といった定評のある資料があり、私たちはその仕事を重複させません。私たちが付け加えられるのは、それらのサイトの体制では生み出しにくい地域固有の文脈と、現地からの観測です。

## :material-map-outline: 日本の読者にとっての接点

日本語版を作っている直接のきっかけは、日本の読者から「内容を自分で訳して読んでいる」という声が届いたことです。ここでは、日本から読む際に接点になりやすい点を挙げます。

<div class="grid cards" markdown>

- :material-server-network:{ .lg .middle style="color: var(--brand-cyan-500);" } **日本は観測対象に含まれています**

    ---

    私たちが運用している Tor リレー監視システム Pulse は、台湾、香港、**日本**、韓国のリレーについて、稼働状況、バージョン、ASN、ノード種別、フラグの分布を継続的に記録しています。[Tor リレー観測](./regional/tor-relay-watcher.md)は日本語版では**日本を既定表示**にしているので、日本のリレー事情はそのまま読み取れます。

- :material-earth:{ .lg .middle style="color: var(--brand-cyan-500);" } **地域の検閲動向は地続きです**

    ---

    中国大陸の検閲技術が国外へ輸出される動き、香港の国家安全維持法以降の変化、越境時の端末検査といった論点は、日本の事業者、研究者、報道関係者にとっても無関係ではありません。私たちは中国語の一次情報を読める位置からこれらを追っています。

- :material-account-multiple-outline:{ .lg .middle style="color: var(--neutral-muted);" } **道具とその限界をめぐる議論は共通です**

    ---

    匿名性、プライバシー、仮名性、機密性をどう区別するか、メタデータが何を漏らすか、脅威モデルをどう立てるかといった話は地域を問いません。日本語版はまずこの層から収録を始めています。

</div>

## :material-book-open-page-variant-outline: 現在収録しているページ

<div class="grid cards" markdown>

- [:material-lightbulb-outline: 基本概念](./basics/index.md)

    ---

    道具を選ぶ前に必要な語彙と枠組み。[匿名・プライバシー・仮名・機密](./basics/anonymity-vs-privacy.md)、[メタデータはなぜ危険か](./basics/metadata.md)、[脅威モデルの立て方](./basics/threat-model.md)の 3 本。この順に読むと噛み合います。

- [:material-map-outline: 地域観測](./regional/index.md)

    ---

    アジア太平洋の中国語圏で何が起きているかの記録。[Tor リレー観測](./regional/tor-relay-watcher.md)は Pulse の実データで、**日本を既定表示**にしています。

- [:material-account-box-outline: 私たちについて](./about/index.md)

    ---

    運営体制、提携先、公開しているもの、そして私たちの主張を外から検証する方法。

- [:material-email-fast-outline: 連絡先](./contact.md)

    ---

    ニュースレター、暗号化メール、PGP 公開鍵、Matrix への参加方法。

</div>

収録ページは順次追加していきます。この記事の日本語版が欲しい、という希望があれば優先順位の判断材料にしますので、お知らせください。
