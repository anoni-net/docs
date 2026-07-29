---
title: ネットワークの自由
description: このサイトが何を見ているのか。接続、個人データ、資金の流れという 3 つの層。
icon: material/chat-question
---

# :material-chat-question: ネットワークの自由はなぜ重要か

ここでいう**ネットワークの自由**とは、不当な干渉を受けずに、必要な情報にたどり着き、公の場で発言し、信頼できる道具と接続経路を自分で選べるかどうかを指します。匿名性、プライバシー、検閲回避と重なりますが、力点はそれぞれと違います。

このページは、anoni.net がこの概念をどう捉えているのか、そしてなぜアジア太平洋の中国語圏について追う価値があるのかを説明します。**このサイトの他のページが何を前提に書かれているかは、ここに書いてあります。**

!!! info "このサイトについて"

    anoni.net は台湾を拠点とするボランティアコミュニティです。ネットワークの自由を地域の問題として扱い、台湾はその中の一例として位置づけています。対象は中国大陸、香港・マカオ、シンガポール、マレーシア、台湾、および中国語圏のディアスポラです。地域ごとに状況は異なるため、ここでの枠組みは現地の条件と照らし合わせて読んでください。

## 3 つの層で考える

ネットワークの自由は、ひとつの層だけで争われることはほとんどありません。私たちは 3 つに分けて捉えています。

**接続の層。** 使いたいサービスに、信頼できる道具で、身元が特定される痕跡を残さずにたどり着けるかどうか。Great Firewall、ISP レベルのフィルタリング、DPI（深層パケット検査）、そして Tor / OONI / Snowflake による検閲回避の仕事は、すべてこの層にあります。このサイトの計測の大半は接続層の計測です。

**個人データとアイデンティティの層。** 自分に関するデータがどこへ流れ、誰が持ち、どういう時間軸で消せるのか、そしてその答えにどれだけ影響を及ぼせるのかを知れるかどうか。実名基盤（Singpass、iAMSmart、中国大陸の電話番号と身分証の紐づけ）、プラットフォームの削除規則、電子身分証の拡大、データ保護法（台湾の個人資料保護法 2025 年改正、地域内の比較可能な枠組み）がここに入ります。

**資金の流れの層。** 支払いが、実名の身元、長い保存期間、機関をまたいだ突き合わせに不必要に縛られずに済むかどうか。カード決済はメッセージより多くの行動メタデータを漏らします。そのメタデータをどう規制するかは、いま争点になりつつあります。台湾の VASP 法（2026 年）はひとつの事例で、シンガポールの銀行と Singpass の統合は別の形です。

この 3 層が、このサイトの構成そのものであり、[地域観測](../regional/index.md)セクションの組み立て方でもあります。

!!! tip "日本から読む場合"

    この枠組みが対象にしているのは中国語圏で、日本は入っていません。それでも読む価値があるとすれば、**3 つの層のうち少なくとも 2 つが国境を越えるから**です。

    ひとつは接続の層です。中国大陸で開発された検閲装置は他国へも売られており、その調達先と機能は 2025 年の漏洩資料で具体的に確認できます。買った国で何が起きるかは、装置の仕様からある程度予測できます。

    もうひとつは資金とデータの層です。同じ地域で事業を営む日本の企業は、香港の国家安全維持法以降の要請対応や、越境時の端末検査といった論点に実務として直面します。プラットフォームの多くは地域共通で、DPI 装置、実名システム、決済網といった技術基盤も国境をまたいで広がっています。

    日本国内の状況そのものは、私たちの観測対象ではありません。[脅威モデルの立て方](./threat-model.md)を使って、自分の場合はどの層が問題になるのかを判断してください。

## 東アジア

中国大陸の Great Firewall は、20 年にわたって国際的なウェブサイトとサービスを遮断し、政治、宗教、社会問題に関するコンテンツ統制のもとで国内プラットフォーム環境を形づくってきました[^1]。**これらのシステムが技術として輸出されていることは、一国の話ではなく地域の話です。** 2025 年の InterSecLab による Geedge Networks と MESA Lab の資料漏洩が、この点を最も明確に記録しています[^2]。北朝鮮はさらに極端な位置にあり、一般市民は世界のインターネットからおおむね切り離され、アクセスは国内イントラネットの光明（Kwangmyong）に限られています[^3]。

香港の環境は 2020 年の国家安全維持法以降、大きく変わりました。同法第 43 条により、警察は DNS 改ざんを通じて ISP にウェブサイトの遮断を命じることができ、この権限は HKChronicles や Hong Kong Watch を含むサイトに対してすでに行使されています。2024 年の国家安全条例（長く保留されていた第 23 条立法）は、捜査と削除の権限をさらに広げました[^hk-snso]。市民空間の縮小、電子身分証 iAMSmart の拡大と HKID との統合、そして記者やプラットフォーム利用者に対する一連の事件が、現地の状況を形づくり続けています[^4]。マカオは並行しつつ、より静かな軌跡をたどっています。

地域内の条件は大きく異なります。比較的開かれているとされる法域（中国語圏では台湾がその一例[^10]）でも、実務者は越境するプラットフォーム統治、情報セキュリティと政治的影響工作、そして報道とアドボカシーへの法的および評判上の圧力に直面しています。年ごとの比較には Freedom House の [Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"} の国別章が使えます。

<figure markdown="span">
    <a href="https://freedomhouse.org/explore-the-map" target="_blank">
        <img src="../../assets/images/freedom_house_explore_the_map.png"
            alt="Freedom House — Freedom on the Net の対話型マップ"
            title="Freedom House — Freedom on the Net の対話型マップ"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Freedom House — Freedom on the Net の対話型マップ（例示。最新のデータと国別章は freedomhouse.org にあります）</capture>
</figure>

## 東南アジア

ベトナムはこの 10 年、政治的に批判的なコンテンツの削除を国際プラットフォームに求める圧力を強め、同時に国内でもブロガーや記者への摘発を進めてきました[^5]。インドネシアは Permenkominfo 5/2020 と関連規則によってプラットフォームの登録とコンテンツ削除を義務づけ、ゲーム、決済、成人向けサービスといった分類ごとの遮断を随時行っています[^6]。マレーシアは調査報道の媒体を遮断し、ブロガーを起訴してきました。オンラインコンテンツをめぐる規制は現在も流動的です[^7]。フィリピンでは、とくに選挙の時期に、独立系メディアとオンライン上の発言への圧力が続いており、Rappler に対する長期の法的追及はその代表例です[^8]。タイは刑法 112 条（不敬罪）の適用を続けており、王室に関するオンラインの発言に対して非常に長い刑期が科されています[^9]。

2021 年 2 月のクーデター以降のミャンマーは、地域で最も極端です。全国規模および輪番のインターネット遮断が繰り返され、プラットフォームが遮断され、独立系の記者が訴追され、通信の遮断そのものが弾圧の道具として使われています[^11]。

**これらは同じ体制ではありません。** ひとつの連続体の上に並んでおり、その上での移動は速く起こりえます。まとめて追う理由は、中国語圏のディアスポラがこれらの間を移動していること、そこで動いているプラットフォームがおおむね同じであること、そして技術基盤（DPI 装置の供給元、実名システム、決済網）が国境をまたいで広がりつつあることにあります。

## 何をどう計測しているか

地域の枠組みを具体的にするのは、公開され検証できる計測です。[OONI](https://ooni.org/){target="_blank"} はボランティアによる観測を運用し、ウェブサイトと検閲回避ツールの到達性をグラフと公開データとして示しています。下の図は例示で、最新のデータと国の選択は [OONI Explorer](https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW){target="_blank"} にあります。

<figure markdown="span">
    <a href="https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW" target="_blank">
        <img src="../../assets/images/ooni_chart_circumvention.png"
            alt="OONI Explorer — 検閲回避ツールの到達性（CN、HK、TW の例示）"
            title="OONI Explorer — 検閲回避ツールの到達性（CN、HK、TW の例示）"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>OONI Explorer — CN、HK、TW における検閲回避ツールの到達性（例示。最新データは OONI のサイトにあります）</capture>
</figure>

[Tor](https://www.torproject.org/){target="_blank"} は多段の匿名経路と、リレーおよびブリッジのネットワークを提供しており、圧力の強い環境で接続を保つ助けになります。リレー網はボランティアによる分散したインフラで、Tor Metrics が国ごとのリレー数とガード数を公開しています。

<figure markdown="span">
    <a href="https://metrics.torproject.org/rs.html#search/country:tw" target="_blank">
        <img src="../../assets/images/tor_relay_tw.png"
            alt="Tor Metrics — 台湾地域のリレーとガードノード"
            title="Tor Metrics — 台湾地域のリレーとガードノード"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Tor Metrics — 台湾地域のリレーとガードノード（このコミュニティが活動する中国語圏の拠点。例示のスナップショット）</capture>
</figure>

これらのデータを読むだけでなく、anoni.net は [Pulse](https://github.com/anoni-net/docs/tree/main/pulse){target="_blank"} を運用して台湾、香港、日本、韓国の Tor リレーの分布を追跡し、[ASN カバレッジ](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} のツールで地域の自律システムにおける OONI の観測充足度を可視化しています。日本のリレーの実データは[Tor リレー観測](../regional/tor-relay-watcher.md)で見られます。

## この先の読みどころ

- [地域観測](../regional/index.md) — 実証的な観測作業と国ごとの記録
- [Tor リレー観測](../regional/tor-relay-watcher.md) — 日本を含む 4 地域の実データ
- [脅威モデルの立て方](./threat-model.md) — ここでの枠組みを自分の状況に落とすための手順
- [私たちについて](../about/index.md) — コミュニティの運営と協働の方法
- [OONI Explorer](https://explorer.ooni.org/){target="_blank"} と [Tor Metrics](https://metrics.torproject.org/){target="_blank"} — 上流の計測ポータルへ直接

[^1]: [Great Firewall — Wikipedia](https://en.wikipedia.org/wiki/Great_Firewall){target="_blank"}（英語）。学術および報道の記述への出典が豊富にあります。
[^2]: [Inside China's Surveillance Industry: Leaked Files Show How Beijing's Internet Crackdown Tools Are Built and Sold Abroad](https://www.amnesty.org/en/latest/news/2025/09/the-great-firewall-comes-to-life-in-leaked-document/){target="_blank"}（英語）— InterSecLab による Geedge / MESA 漏洩に関するアムネスティ・インターナショナルの報道（2025 年 9 月）。
[^3]: [北朝鮮の光明（Kwangmyong）イントラネット](https://en.wikipedia.org/wiki/Kwangmyong_(network)){target="_blank"}（英語）。継続的な分析は [38 North](https://www.38north.org/){target="_blank"}（英語）にもあります。
[^4]: [Hong Kong: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/china/hong-kong){target="_blank"}（英語）。
[^5]: [Vietnam: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/vietnam){target="_blank"}（英語）。
[^6]: [Indonesia's Online Crackdown — Permenkominfo 5/2020 に関する Article 19 の分析](https://www.article19.org/resources/indonesia-the-impacts-of-permenkominfo-5-2020/){target="_blank"}（英語）。
[^7]: [Malaysia: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/malaysia){target="_blank"}（英語）。
[^8]: [Philippines — Reporters Without Borders](https://rsf.org/en/country/philippines){target="_blank"}（英語）。報道の自由と Rappler の訴追について。
[^9]: [Thailand — Human Rights Watch](https://www.hrw.org/asia/thailand){target="_blank"}（英語）。不敬罪による訴追について。
[^10]: [Freedom House — 台湾の国別ページ（Freedom on the Net）](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"}（英語）。年と URL は版ごとに変わります。
[^11]: [Myanmar: World Report 2024 — Human Rights Watch](https://www.hrw.org/world-report/2024/country-chapters/myanmar){target="_blank"}（英語）— 2021 年のクーデター以降のインターネット遮断と独立系メディアへの弾圧について。
[^hk-snso]: [Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"}（英語）— Hong Kong Free Press。HKChronicles や Hong Kong Watch を含むサイトへの第 43 条による DNS 遮断命令について。[Hong Kong: New Security Law a Full-Scale Assault on Rights](https://www.hrw.org/news/2024/03/19/hong-kong-new-security-law-full-scale-assault-on-rights){target="_blank"}（英語）— Human Rights Watch。2024 年の国家安全条例について。

---

原文：[Why networked freedom matters](https://anoni.net/docs/en/basics/internet-freedom/){target="_blank"}（英語）／[網路自由為什麼重要](https://anoni.net/docs/basics/internet-freedom/){target="_blank"}（繁体字中国語）

この日本語訳は初稿で、日本語母語話者の校正を経ていません。気になる箇所は [Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> へ。方針は[訳語の方針](../translation-glossary.md)にあります。
