#!/usr/bin/env python3
"""把數位發展部的「海纜障礙狀況」整理成 JSON。

來源：https://moda.gov.tw/major-policies/subseacable/fault/1749

=== 這份跟 TeleGeography 那道牆是分開的兩件事 ===

那一頁底下標著「本網頁海纜圖資料來源：TeleGeography，採 CC BY-SA 4.0 授權」。那句話
涵蓋的是頁面上那幾張示意圖，不是這張表。TeleGeography 自己的引用條款寫得很清楚：
地圖影像與截圖採 CC BY-SA 4.0，而「Access to the underlying databases remains
restricted to paying subscribers」。所以海纜的路由幾何仍然拿不到，但「哪條纜線幾號
斷在哪裡、預計哪天修好」是 moda 與中華電信自己的營運資訊，不在那個範圍內。

這支只取表格，不碰任何圖。

=== 授權狀態：未標示 ===

那張表本身沒有標任何授權。著作權法第 9 條把「公文」排除在著作權標的之外，同條第二項
的公文包括「公務員於職務上草擬之文告、講稿、新聞稿及其他文書」，政府機關發布的營運
公告落在這個範圍是合理的解讀；退一步說，「哪條纜線幾號斷在哪」本身是事實，事實不受
著作權保護。

但這是解讀不是定論，所以輸出的 license 欄位據實寫「未標示」，不要自己替對方宣告一個
授權。要落地到畫面上之前，建議先透過政府資料開放平臺的「我想要更多」
（https://data.gov.tw/suggests）向 moda 確認授權，順便要求以 JSON 或 CSV 開放。
moda 同時是該平臺的主管機關與這份資料的擁有者，那個管道問得到人。

=== 剖析上的坑 ===

1. rowspan。同一條海纜可能有多筆障礙，第二筆之後的列會用 rowspan 省掉序號與海纜名稱，
   實測 TDM2 就是這樣，那一列只有 4 個 cell。天真的剖析器會把第二筆的日期讀成海纜名。
   這裡用 html.parser 讀出 rowspan 屬性逐格追蹤，不靠「欄數少就往前補」那種猜法。
2. 日期是民國年（114/10/7 即 2025-10-07）。
3. 海纜名稱同時有中文與英文簡稱，括號有全形也有半形。
4. 替代路由是頓號分隔的多值。
5. 障礙情形裡帶著概略位置，例如「距淡水沙崙約180公里處」。那是從一個具名地點起算的
   距離，能解出來就一併留著，畫面上要用的話口徑是概略範圍而不是精確點位。

沒有 API，這是在剖析一頁隨時可能改版的 HTML，所以欄位對不上就大聲失敗，不要安靜地
輸出半殘的檔案。

用法：
  python3 tools/gen_seacable_faults.py [輸出路徑]
"""
import json
import os
import re
import subprocess
import sys
import time
from html.parser import HTMLParser

# 網址可用環境變數覆寫，測剖析器對版面變動的反應時不必改檔案
URL = os.environ.get("MODA_FAULT_URL",
                     "https://moda.gov.tw/major-policies/subseacable/fault/1749")
# 海纜清單。障礙表只給中文名，替代路由那欄也是中文，簡中與英文版顯示起來會夾一段繁中。
# 這一頁有中文全名、英文簡稱、英文全名與連接國別的對照，拿來把名字正規化成簡稱。
LIST_URL = os.environ.get("MODA_LIST_URL",
                          "https://moda.gov.tw/major-policies/subseacable/1747")
# 表頭必須看得到這幾個詞，對不上就是頁面改版了
NEED = ("海纜名稱", "障礙", "修復")
# 零筆障礙是合法狀態，代表當下沒有海纜在修，不是剖析失敗。把關的是表頭那幾個關鍵字，
# 表頭認得出來就代表版面沒變，這時候沒有資料列就是真的沒有障礙。
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "play", "seacable.json")


class TableParser(HTMLParser):
    """抓出第一個 table 的所有儲存格，並把 rowspan 展開成完整的矩陣。"""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tables = []
        self._depth = 0      # 巢狀 table 的深度
        self._rows = None
        self._row = None
        self._cell = None
        self._span = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "table":
            self._depth += 1
            if self._depth == 1:
                self._rows = []
        elif self._depth and tag == "tr":
            self._row = []
        elif self._depth and tag in ("td", "th"):
            self._cell = []
            try:
                self._span = max(1, int(a.get("rowspan", "1")))
            except ValueError:
                self._span = 1

    def handle_endtag(self, tag):
        if tag == "table" and self._depth:
            if self._depth == 1:
                self.tables.append(self._rows)
                self._rows = None
            self._depth -= 1
        elif self._depth and tag == "tr" and self._row is not None:
            self._rows.append(self._row)
            self._row = None
        elif self._depth and tag in ("td", "th") and self._cell is not None:
            text = re.sub(r"\s+", " ", "".join(self._cell)).strip()
            self._row.append({"text": text, "rowspan": self._span})
            self._cell = None

    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data)


def expand_rowspan(rows):
    """把 rowspan 展開成每列都有完整欄位的矩陣。

    逐列處理，維護一份「還在跨列中的儲存格」清單。輪到某一欄還被上面佔著時，
    就把上面那格的值填進來，而不是從這一列剩下的 cell 裡取。
    """
    out = []
    pending = {}   # 欄索引 → [值, 還要佔幾列]
    for row in rows:
        line = []
        col = 0
        it = iter(row)
        while True:
            if col in pending:
                val, left = pending[col]
                line.append(val)
                left -= 1
                if left <= 0:
                    del pending[col]
                else:
                    pending[col] = [val, left]
                col += 1
                continue
            cell = next(it, None)
            if cell is None:
                break
            line.append(cell["text"])
            if cell["rowspan"] > 1:
                pending[col] = [cell["text"], cell["rowspan"] - 1]
            col += 1
        out.append(line)
    return out


def roc_date(s):
    """民國年轉西元。114/10/7 → 2025-10-07。認不出來就回原字串。"""
    m = re.match(r"^\s*(\d{2,3})[/\-.](\d{1,2})[/\-.](\d{1,2})\s*$", s or "")
    if not m:
        return s.strip() if s else ""
    y, mo, d = (int(x) for x in m.groups())
    return f"{y + 1911:04d}-{mo:02d}-{d:02d}"


def split_name(s):
    """「臺馬二號海纜 ( TDM2 )」→ ('臺馬二號海纜', 'TDM2')。括號全形半形都吃。"""
    m = re.search(r"[（(]\s*([A-Za-z0-9\-]+)\s*[）)]", s or "")
    abbr = m.group(1) if m else ""
    name = re.sub(r"[（(].*?[）)]", "", s or "").strip()
    return name, abbr


def parse_where(s):
    """從障礙情形裡取出「距 X 約 N 公里」。取不到就回 None，不要硬猜。"""
    m = re.search(r"距\s*(.+?)\s*約\s*([\d.]+)\s*公里", s or "")
    if not m:
        return None
    try:
        km = float(m.group(2))
    except ValueError:
        return None
    return {"from": m.group(1).strip(), "km": km}


def fetch_cables():
    """從海纜清單頁建對照表。回傳 中文全名 → {abbr, en, cc}，取不到就回空的。

    這一份是加分項不是必要項，抓不到就讓障礙表照原樣輸出中文名，不要讓整支失敗。
    """
    html_text = fetch(LIST_URL, quiet=True)
    if not html_text:
        print("  提醒：海纜清單頁取不到，替代路由會留中文全名", file=sys.stderr)
        return {}
    p = TableParser()
    p.feed(html_text)
    out = {}
    for tb in p.tables:
        grid = expand_rowspan(tb)
        # 第一列可能是標題橫幅（只有一格），表頭在下一列
        head = next((r for r in grid[:3] if len(r) >= 3 and "中文全名" in "".join(r)), None)
        if not head:
            continue
        def col(kw):
            return next((i for i, h in enumerate(head) if kw in h), None)
        c_zh, c_ab, c_en, c_cc = col("中文全名"), col("英文簡稱"), col("英文全名"), col("連接")
        if c_zh is None or c_ab is None:
            continue
        for line in grid[grid.index(head) + 1:]:
            if len(line) <= max(c_zh, c_ab):
                continue
            zh, ab = line[c_zh].strip(), line[c_ab].strip()
            if not zh or not ab:
                continue
            item = out.setdefault(zh, {"abbr": ab, "cc": []})
            if c_en is not None and len(line) > c_en and line[c_en].strip():
                item["en"] = line[c_en].strip()
            if c_cc is not None and len(line) > c_cc:
                v = line[c_cc].strip()
                if v and v not in item["cc"]:
                    item["cc"].append(v)
    return out


def fetch(url, quiet=False):
    for attempt in range(3):
        r = subprocess.run(["curl", "-sL", "--max-time", "120", "-A", "Mozilla/5.0", url],
                           capture_output=True, text=True)
        if r.returncode == 0 and "<table" in r.stdout:
            return r.stdout
        if not quiet:
            print(f"  第 {attempt + 1} 次取回失敗，等一下再試", file=sys.stderr)
        time.sleep(5)
    return None


def write_atomic(out, data):
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, out)


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    html_text = fetch(URL)
    if not html_text:
        raise SystemExit("moda 的海纜障礙頁取回失敗")
    cables = fetch_cables()

    p = TableParser()
    p.feed(html_text)
    if not p.tables:
        raise SystemExit("頁面裡找不到 table，版面可能改了")
    grid = expand_rowspan(p.tables[0])
    if not grid:
        raise SystemExit("table 是空的")

    header = grid[0]
    flat = "".join(header)
    for kw in NEED:
        if kw not in flat:
            raise SystemExit(f"表頭少了「{kw}」，欄位定義可能改了：{header}")
    # 欄序照表頭找，不要寫死索引
    def col(*keys):
        for i, h in enumerate(header):
            if all(k in h for k in keys):
                return i
        return None
    c_name = col("海纜名稱")
    c_start = col("障礙", "日期")
    c_desc = col("障礙", "情形")
    c_alt = col("替代")
    c_fix = col("修復")
    if None in (c_name, c_start, c_desc, c_fix):
        raise SystemExit(f"找不到必要欄位，表頭是：{header}")

    faults = []
    for line in grid[1:]:
        if len(line) <= max(c_name, c_start, c_desc, c_fix):
            continue
        name, abbr = split_name(line[c_name])
        if not name:
            continue
        desc = line[c_desc]
        item = {
            "name": name,
            "abbr": abbr,
            "start": roc_date(line[c_start]),
            "desc": desc,
            "fix": roc_date(line[c_fix]),
        }
        if c_alt is not None and len(line) > c_alt:
            alt = [x.strip() for x in re.split(r"[、,，]", line[c_alt]) if x.strip()]
            if alt:
                item["alt"] = alt
                # 對得到就換成英文簡稱。對照表缺的（或本來就是簡稱的）留原樣。
                item["altAbbr"] = [cables.get(a, {}).get("abbr", a) for a in alt]
        where = parse_where(desc)
        if where:
            item["where"] = where
        faults.append(item)

    data = {
        "source": "數位發展部　海纜障礙狀況",
        "sourceUrl": URL,
        # 那張表沒有標任何授權，不要自己替對方宣告一個。詳見本檔開頭的說明。
        "license": "未標示",
        "licenseUrl": "",
        "note": ("取自數位發展部公布的海纜障礙表。頁面上的示意圖來自 TeleGeography 且為 "
                 "CC BY-SA 4.0，這份只取表格不含圖。表格本身未標示授權，用於畫面之前"
                 "請先向 moda 確認。日期原為民國年，已轉為西元。障礙位置是從表格文字裡"
                 "解出的概略距離，不是精確座標。"),
        "faults": faults,
        # 中文全名 → 英文簡稱、英文全名、連接國別。給前端把名字正規化用，
        # 簡中與英文版才不會夾一段繁體中文的纜線名。
        "cables": cables,
    }
    write_atomic(out, data)

    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    named = sum(1 for f in faults if f.get("where"))
    if not faults:
        print("  0 筆障礙。表頭認得出來，所以這是「當下沒有海纜在修」而不是剖析失敗。",
              file=sys.stderr)
    print(f"  {len(faults)} 筆障礙，其中 {named} 筆解得出概略位置")
    print(f"  海纜對照表 {len(cables)} 條")
    for f in faults:
        w = f.get("where")
        loc = f"　距{w['from']} {w['km']} 公里" if w else ""
        alt = "　替代 " + "／".join(f["alt"]) if f.get("alt") else ""
        print(f"    {f['abbr'] or f['name']:<8} {f['start']} → 預計 {f['fix']}{loc}{alt}")
    print(f"  檔案 {os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
