#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的上網人口比例（docs/zh-TW/games/tor-network/play/netusers.json）。

這份資料的用途是當分母。地球儀原本只講「這一國有幾人用 Tor」，那個數字幾乎等於在比
人口大小，印度一定贏過愛沙尼亞。除以該國實際上網的人口之後，比較的才是「在能上網的人
裡面，有多少比例走 Tor」，那才是想問的問題。

=== 兩個來源，兩份授權 ===

主來源是 World Bank 的 IT.NET.USER.ZS（Individuals using the Internet，占人口百分比），
CC BY 4.0，免金鑰、JSON。

**World Bank 沒有收錄台灣。** 217 個經濟體裡一個都找不到，台灣不是世界銀行會員。對一個
以台灣為重心的網站來說那格空著是最糟的結果，所以台灣單獨取自數位發展部的「國家數位近用
調查」（前身是國發會的數位機會調查、數位發展調查），授權是政府資料開放授權條款-第1版。

兩份的方法論不同，World Bank 那份源頭是 ITU 彙整各國通報，台灣這份是對 12 歲以上人口的
電話抽樣調查（2025 年樣本 15,142、抽樣誤差 ±0.8%）。所以台灣那個數字**不應該跟其他國家
直接比較**，畫面上要標示它來自不同的調查。json 裡把它放在 alt 底下就是為了讓前端沒辦法
不小心把兩者混在同一個色階上。

=== 更新頻率 ===

World Bank 一年更新一次，台灣的調查也是一年一次。變動以年計，所以不進
publish_games_data.sh，跟 cables、ooni、shutdowns 一樣產生一次就 commit 進 repo，
跟著文件站發布。

=== 抓取注意 ===

1. World Bank 的 indicator 端點會把區域聚合（East Asia & Pacific、World 之類）跟真實
   國家混在一起回，要先用 /v2/country 拿到 region.id != "NA" 的名單去濾，不然畫面上
   會冒出「撒哈拉以南非洲」這種不存在的國家。
2. 各國最新有值的年份不一樣，所以要抓一段區間再逐國取最新的非空值，不能寫死某一年。
3. moda 的檔案網址是 File/Get 加一段不透明 ID，是從
   https://moda.gov.tw/digital-affairs/digital-service/operations/208 頁面上
   「歷年調查彙整資料(csv檔案)」那個連結抄來的。網站改版時這個 ID 會失效。失效時這支
   不會整個失敗，會沿用輸出檔裡既有的 alt 區塊並加上 alt.stale=true，同時印出警告。
   這是刻意的：無聲地用「缺台灣」的新檔覆蓋掉「有台灣」的舊檔，是這支最容易造成的
   實質損害。看到 stale 標記就回上面那頁重抄網址。
4. moda 那份 CSV 是 Big5，標稱 UTF-8 的那個連結實測內容一樣。年度欄是民國年。

用法：
  python3 tools/gen_netusers_snapshot.py [輸出路徑]
"""
import csv
import io
import json
import os
import subprocess
import sys
import time
from datetime import date

WB_API = "https://api.worldbank.org/v2/"
INDICATOR = "IT.NET.USER.ZS"
YEAR_FROM = 2015          # 往前抓這麼多年，逐國取最新有值的那年
MODA_CSV = "https://www-api.moda.gov.tw/File/Get/moda/zh-tw/1Mo5V2PopJbp81g"
MODA_PAGE = "https://moda.gov.tw/digital-affairs/digital-service/operations/208"
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "play", "netusers.json")


def write_atomic(out, data):
    """先寫暫存檔再 rename。同一顆檔案系統上的 rename 是原子操作，中途失敗不會留下
    半截的 json 蓋掉本來好的那份。publish_games_data.sh 對它負責的兩份也是這樣做。"""
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, out)


def fetch(url, binary=False, want=None):
    """用 curl 取回。跟這個 repo 其他產生腳本一樣只依賴 python3 與 curl。

    want 是「內容看起來像不像預期」的檢查函式。只看 stdout 非空是不夠的，
    暫時性的錯誤頁、速率限制頁也是非空的，那會被當成成功、跳過重試，
    等到下游 json.loads 才炸開。同目錄其他腳本都有這道檢查。
    """
    for attempt in range(3):
        r = subprocess.run(["curl", "-sL", "--max-time", "120", "-A", "Mozilla/5.0", url],
                           capture_output=True)
        if r.returncode == 0 and r.stdout:
            out = r.stdout if binary else r.stdout.decode("utf-8", "replace")
            if want is None or want(out):
                return out
        print(f"  第 {attempt + 1} 次取回失敗，等一下再試：{url[:70]}", file=sys.stderr)
        time.sleep(5)
    return None


def real_countries():
    """World Bank 的國家清單，濾掉區域聚合。回傳 ISO2 小寫 → 名稱。"""
    raw = fetch(f"{WB_API}country?format=json&per_page=400", want=lambda t: t.lstrip().startswith("["))
    if not raw:
        raise SystemExit("World Bank 國家清單取回失敗")
    meta, body = json.loads(raw)[0], json.loads(raw)[1]
    # per_page 給得夠大就會單頁拿完，但那是「目前資料量還小」而不是保證。
    # 哪天筆數超過 per_page，回應會安靜地只給第一頁，濾出來的國家數就會少一截。
    if int(meta.get("pages", 1)) > 1:
        raise SystemExit(f"World Bank 國家清單有 {meta.get('pages')} 頁，per_page 要調大")
    out = {}
    for c in body:
        # region.id 是 NA 的那些是聚合區域，不是國家
        if c.get("region", {}).get("id") == "NA":
            continue
        cc = (c.get("iso2Code") or "").lower()
        if len(cc) == 2:
            out[cc] = c.get("name", "")
    return out


def worldbank_pct(valid):
    """逐國取最新有值的上網比例。回傳 ISO2 小寫 → [百分比, 年份]。"""
    url = (f"{WB_API}country/all/indicator/{INDICATOR}"
           f"?format=json&date={YEAR_FROM}:{date.today().year}&per_page=20000")
    raw = fetch(url, want=lambda t: t.lstrip().startswith("["))
    if not raw:
        raise SystemExit("World Bank 指標取回失敗")
    body = json.loads(raw)
    if len(body) < 2 or not body[1]:
        raise SystemExit("World Bank 指標回應沒有資料")
    if int(body[0].get("pages", 1)) > 1:
        raise SystemExit(f"World Bank 指標有 {body[0].get('pages')} 頁，per_page 要調大")
    best = {}
    for r in body[1]:
        if r.get("value") is None:
            continue
        cc = (r.get("country", {}).get("id") or "").lower()
        if cc not in valid:
            continue
        try:
            year = int(r["date"])
            val = round(float(r["value"]), 1)
        except (KeyError, TypeError, ValueError):
            continue
        if cc not in best or year > best[cc][1]:
            best[cc] = [val, year]
    return best


def taiwan_pct():
    """台灣的個人上網率，取自 moda 的歷年調查彙整。回傳 [百分比, 西元年] 或 None。"""
    raw = fetch(MODA_CSV, binary=True, want=lambda b: b"," in b[:4096])
    if not raw:
        print(f"  警告：moda 的 CSV 取不到，台灣會缺一筆。請到 {MODA_PAGE} 重抄連結",
              file=sys.stderr)
        return None
    text = None
    for enc in ("big5", "cp950", "utf-8-sig", "utf-8"):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        print("  警告：moda 的 CSV 編碼認不出來", file=sys.stderr)
        return None
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        return None
    # 表頭欄名帶換行與括號說明，所以用「開頭是不是個人上網率」判斷，不做完全比對
    header = [h.replace("\n", "").strip() for h in rows[0]]
    col = next((i for i, h in enumerate(header) if h.startswith("個人上網率")), None)
    if col is None:
        print("  警告：moda 的 CSV 找不到個人上網率欄位，欄名可能改了", file=sys.stderr)
        return None
    best = None
    for r in rows[1:]:
        if len(r) <= col or not r or not r[0].strip():
            continue
        try:
            year = int(r[0].strip()) + 1911    # 年度欄是民國年
            pct = float(r[col].strip())
        except ValueError:
            continue
        if best is None or year > best[1]:
            best = [round(pct, 1), year]
    if best is None:
        print("  警告：moda 的 CSV 找得到欄位但每一列都解析失敗，資料列格式可能改了",
              file=sys.stderr)
    return best


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()

    valid = real_countries()
    pct = worldbank_pct(valid)
    if len(pct) < 100:
        raise SystemExit(f"World Bank 只取到 {len(pct)} 國，數量不對，先確認 API 有沒有改")
    tw = taiwan_pct()

    data = {
        "source": "World Bank",
        "sourceUrl": f"https://data.worldbank.org/indicator/{INDICATOR}",
        "license": "CC BY 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "indicator": INDICATOR,
        "note": ("各國最新有值的年份不同，每一筆都帶自己的年份。World Bank 沒有收錄台灣，"
                 "台灣那一筆在 alt 底下，來自另一份調查，方法論不同，不宜直接比較。"),
        "pct": pct,          # ISO2 → [百分比, 年份]
    }
    if tw:
        data["alt"] = {
            "source": "數位發展部　國家數位近用調查",
            "sourceUrl": MODA_PAGE,
            "license": "政府資料開放授權條款-第1版",
            "licenseUrl": "https://data.gov.tw/license",
            "note": ("World Bank 沒有收錄台灣，這一筆取自數位發展部的國家數位近用調查，"
                     "對 12 歲以上人口電話抽樣。跟 World Bank 那份的方法論不同，"
                     "放在一起看可以，直接比大小不行。"),
            "pct": {"tw": tw},
        }

    # 台灣抓不到時，沿用舊檔裡的 alt 區塊。moda 的網址是不透明 ID，失效是預期會發生的事，
    # 而這個網站最在意的就是台灣那一筆。無聲地用「缺台灣」的新檔覆蓋掉「有台灣」的舊檔，
    # 執行者只要沒盯著 stderr 就會直接 commit 出去。寧可留舊值並標記出來。
    if not tw and os.path.exists(out):
        try:
            with open(out, encoding="utf-8") as f:
                prev = json.load(f)
            if prev.get("alt", {}).get("pct"):
                data["alt"] = prev["alt"]
                data["alt"]["stale"] = True
                print("  台灣沿用舊檔的數值，已標記 alt.stale=true", file=sys.stderr)
        except (OSError, ValueError):
            pass
    if not data.get("alt"):
        print("  警告：這份沒有台灣。要接受請確認過再 commit", file=sys.stderr)

    write_atomic(out, data)

    years = sorted({y for _, y in pct.values()})
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  World Bank｜{len(pct)} 國｜年份分布 {years[0]} 到 {years[-1]}")
    for cc in ("us", "de", "ir", "cn", "ru", "in"):
        if cc in pct:
            print(f"    {cc.upper()}：{pct[cc][0]}%（{pct[cc][1]}）")
    print(f"  台灣（moda）：{tw[0]}%（{tw[1]}）" if tw else "  台灣：缺")
    print(f"  檔案 {os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
