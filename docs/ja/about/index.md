---
title: anoni.net について
description: 運営体制、提携先、公開しているもの、そして私たちの主張を外から検証する方法。
icon: material/account-box-outline
---

# :material-account-box-outline: anoni.net について

anoni.net は台湾を拠点とする小規模なボランティアコミュニティで、アジア太平洋の中国語圏におけるネットワークの自由を扱っています。2023 年ごろに台湾の OONI 観測カバレッジを中心テーマとして集まり、その後、地域観測、法制度の追跡、地域研究の選択的な翻訳へと範囲を広げてきました。

このページは海外の同業組織、報道関係者、研究者、資金提供者に向けて書いています。私たちの成果を引用したり、提携したり、他者に薦めたりする前に、「誰がやっているのか」を確認しておきたい方々を想定しています。

## 私たちの実像

- **ボランティアコミュニティです。** 有給スタッフはいません。このサイト、観測システム Pulse、ASN カバレッジ分析ツール、地域研究の翻訳は、いずれもコミュニティの参加者が自分の時間で、ときに仮名で作っています。
- **台湾を拠点にしています。** 活動の中核は台北にあります。将来的には地域各国からの参加者を迎えたいと考えていますが、現時点では他地域の協力者との交流は不定期かつ非公式なものにとどまります。
- **インフラを自前で持っています。** Matrix ホームサーバー（`im.anoni.net`）、Cryptpad、Etherpad、Send、SearXNG、Formbricks の各インスタンスを自分たちで運用しています。内部の調整は第三者プラットフォームではなくこれらの道具の上で行っています。
- **もともと中国語のコミュニティです。** 繁体字中国語版（zh-TW）が single source of truth です。簡体字中国語版（zh-CN）は再ローカライズしたもので、英語版は逐語訳ではなく国際読者向けの地域観測拠点として作り直している最中です。日本語版も同じく、選んで訳す方式で運用しています。

## 公開しているもの

- **anoni.net Docs** — [anoni.net/docs](https://anoni.net/docs/){target="_blank"} で公開している多言語ドキュメントサイト。Tor onion ミラーは [docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion](http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/){target="_blank"} にあります。ソースは [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} で公開しています。
- **Pulse** — 台湾、香港、日本、韓国の Tor リレーについて、稼働状況、バージョン、ASN、ノード種別、フラグの分布を追跡する監視システム。FastAPI と PostgreSQL によるオープンソースのサービスで、REST API と Vega-Lite チャート API を [api.anoni.net](https://api.anoni.net/api/readme){target="_blank"} で公開しています。
- **[ASN カバレッジ分析ツール](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"}** — OONI の S3 公開データを一括処理し、地域ごとに ASN 単位の観測充足度を可視化する Python の CLI です。観測が手薄なネットワークの特定と地域間比較に使っています。
- **地域レポートの翻訳（現時点で 1 件）** — 2025 年の InterSecLab による Geedge Networks / MESA Lab 漏洩レポートの繁体字中国語全訳を zh-TW 版で公開しています。今後の翻訳は、その地域レポートが中国語圏の空白を埋めるかどうかを見て個別に判断します。
- **ブログとコミュニティ更新** — コミュニティの活動報告、カンファレンス参加（RightsCon、COSCUP、ETHTaipei）の記録、Tor Project、OONI、Tails の上流アナウンスの翻訳を公開しています。

## ガバナンス

形式を最小限に抑えた合意形成モデルで運営しています。全文は[ガバナンス憲章](https://anoni.net/docs/en/community/governance/){target="_blank"}（英語、コミュニティレビュー中）にありますが、判断に必要な要点は以下に日本語でまとめてあるので、英語を読まずに済むはずです。

- **役割** — *コアメンバー*（自前インフラの運用権限と PR マージ権限を持つ長期メンテナ）、*貢献者*（実際に成果を出している人）、*オブザーバー*（ニュースレター購読者や Public Space の参加者）、*訪問者*（閲覧し `whisper@anoni.net` 経由で連絡してくる人）。
- **意思決定** — 原則は合意形成で、異議申し立てのための 3 日間の猶予期間を設けます。投票は合意が行き詰まったときと時間的な制約があるときに限ります。憲章の変更やコアメンバーの追加といった重要な決定は、活動中の貢献者の 3 分の 2 の賛成を要します。
- **紛争処理** — 内容に関する対立は提案プロセスに乗せます。対人的な対立はコアメンバーが扱い、ハラスメントや脅迫といった重大な事例では直ちにアクセス権を剥奪し、影響を受けた人への支援を個別に検討します。
- **行動規範** — 背景、技術レベル、政治的立場の違いを越えて敬意を保ちます。議論はアイデアに向け、人格には向けません。公開ルームでの透明性を保ちます。違法行為（マネーロンダリング、ハラスメント、児童性的虐待素材、外国政府の情報活動）への協力は明確に拒否します。

意思決定の履歴と重要な変更は、[GitHub リポジトリ](https://github.com/anoni-net/docs){target="_blank"} のコミットログとプロジェクトのブログで確認できます。

## 提携と協働

直接協働した組織の一覧です。掲載の基準は双方向の協働があることで、引用や参加だけのものは含めません。

- **[Tor Project](https://torproject.org/){target="_blank"}** — 翻訳への貢献、[Snowflake](https://snowflake.torproject.org/){target="_blank"} ブリッジの提供、台湾でのキャンパスリレー設置の継続的な取り組み。[国立台湾師範大学のリレー](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}は 2026 年 3 月に Tor Project ブログのゲスト記事として取り上げられました。
- **[OONI](https://ooni.org/){target="_blank"}** — OONI Probe のローカル運用、地域のテスト対象サイト一覧への貢献、OONI の方法論とアナウンスの中国語訳。
- **[Electronic Frontier Foundation](https://www.eff.org/){target="_blank"}** — Tor Relay on Campus の取り組みでの協働。EFF と Tor Project の共同企画である [Tor University Challenge](https://toruniversity.eff.org/zh-tw/){target="_blank"} の繁体字中国語訳を担当しました。
- **大学の受け入れ先** — 国立台湾師範大学（Tor リレーの設置）、国立台湾科技大学（2025 年に匿名ネットワークのワークショップを開催）。

方針として、協力者は明示的にクレジットします。

## その他の関与と貢献

提携と呼ぶには至らないものの、コミュニティの公開された足跡の一部を成す活動です。

- **[InterSecLab](https://www.interseclab.org/){target="_blank"} — 独立した翻訳作業**：2025 年の Geedge Networks / MESA Lab 漏洩レポートの繁体字中国語全訳を、出典を明記した上で公開しました。これは公開レポートに対する一方的な翻訳であり、InterSecLab との正式な協働ではありません。
- **[g0v](https://g0v.tw/){target="_blank"} — コミュニティへの参加**：メンバーが台北で定期開催される g0v のハッカソンに参加し、anoni.net の活動を発表し議論しています。参加と非公式な連携であって、組織間の提携ではありません。
- **カンファレンスへの参加**：2025 年から 2026 年にかけて、メンバーが RightsCon、COSCUP、ETHTaipei に参加しています。報告や記録は[更新情報](https://anoni.net/docs/en/blog/){target="_blank"}（英語）からたどれます。

## 資金と資源

現在はボランティア運営で、外部資金は受けていません。運営費（ドメイン登録料、Matrix とドキュメントサイトのサーバー費用、カンファレンスの旅費）はコアメンバーが負担しています。助成金や寄付を受け取る体制は整えておらず、そうする前に資金提供者と話をしたいと考えています。

アジア太平洋の中国語圏におけるネットワークの自由に関心のある資金提供者の方は、[コミュニティページ](https://anoni.net/docs/en/community/){target="_blank"}（英語）に記載の窓口からご連絡ください。

## ライセンス

プロジェクトの部分ごとにライセンスが異なります。

- **ドキュメントサイトの内容**（[github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}）— [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"} — 出典表示のうえで共有と改変が可能です
- **Pulse のコード** — [MIT License](https://github.com/anoni-net/docs/blob/main/pulse/LICENSE){target="_blank"}
- **ASN カバレッジ分析ツール** — [GPL-3.0](https://github.com/anoni-net/docs/blob/main/asn_coverage/LICENSE){target="_blank"}

- **Pulse API が返す観測データ** — 上流は Tor Project の [Onionoo](https://onionoo.torproject.org/){target="_blank"} で、その利用条件に従います。私たちが加えた集計結果の再利用は CC-BY 4.0 です。

ドキュメントを再利用する際の出典表示の書式は「anoni.net Docs Project, 該当ページの URL, CC-BY 4.0, 参照 2026-07-29」のように、参照日を添えてください。

!!! info "日本語訳の再利用について"

    日本語版のページも他の言語版と同じく CC-BY 4.0 です。出典を示していただければ、勉強会の資料や記事への引用に自由にお使いいただけます。訳文に手を入れて公開される場合は、改変した旨を添えていただけると、読者が原文との差分をたどれます。

## 私たちの主張を検証する方法

このページに書かれた主張とは独立に、次の点は外から確認できます。

- ドキュメントサイト、Pulse、ASN カバレッジ分析ツールの全ソースは [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} にあり、コミット履歴と貢献者一覧も公開されています
- Pulse のデータは [api.anoni.net](https://api.anoni.net/api/readme){target="_blank"} から誰でも読めます
- [Tor onion ミラー](http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/){target="_blank"}は clearnet 版と同じ内容を反映しています
- 最近の活動と対外的な参加は[更新情報](https://anoni.net/docs/en/blog/){target="_blank"}（英語）に、写真や記録とともに残しています

## 連絡方法

- **Matrix**（継続的な協働にはこちらが適しています）— Public Space は [`#community:im.anoni.net`](https://matrix.to/#/#community:im.anoni.net){target="_blank"}。アカウント申請は `whisper@anoni.net` へ（ホームサーバーを自前で運用しており、アカウントは個別に承認しています）
- **暗号化メール** — `whisper@anoni.net`。PGP 鍵は[連絡先ページ](../contact.md)にあります
- **ニュースレター** — [連絡先ページ](../contact.md)から登録できます
- **GitHub** — Issue と PR は [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} へ

日本語版で読めるのは[基本概念](../basics/index.md)と[地域観測](../regional/index.md)です。訳文を直してくださる方は[訳語の方針](../translation-glossary.md)をご覧ください。

紹介、提携の相談、研究協力については、用途ごとにどの窓口が適切かを[コミュニティページ](https://anoni.net/docs/en/community/){target="_blank"}（英語）に整理しています。

---

原文：[關於我們](https://anoni.net/docs/about/){target="_blank"}（繁体字中国語）

この日本語訳は初稿で、日本語母語話者の校正を経ていません。気になる箇所は [Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> へ。方針は[訳語の方針](../translation-glossary.md)にあります。
