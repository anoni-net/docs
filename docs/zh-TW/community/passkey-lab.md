---
title: passkey userHandle 實驗
description: 量一件很具體的事，建立 passkey 時放進 user.id 的那 32 個位元組，在別的裝置上驗證時拿不拿得回來。這是機制驗證頁，不是給讀者的工具。
search:
  exclude: true
hide:
  - navigation
---

# passkey userHandle 實驗

這一頁在量一件很具體的事：建立 passkey 時放進 `user.id` 的那 32 個位元組，之後在別的裝置、別的密碼管理器上驗證時，拿不拿得回來，而且一個位元組都不差。

## 為什麼要量

站上想做一個只要驗證、不必記密語的加密儲存。正規做法是 WebAuthn 的 PRF 擴充，可是 Apple 不把擴充的資料交給 iCloud 鑰匙圈以外的 provider，所以 iPhone 配 Bitwarden 那條路拿不到金鑰。

`user.id` 是 WebAuthn 的核心欄位而不是擴充，規格上每次驗證都會原樣回傳。如果實作真的照規格走，它就是那條繞得過去的路。規格說可以跟實作真的給是兩回事，所以先在真機上量。

<style>
/*
  這一頁原本一條樣式都沒寫。兩個按鈕靠 appendChild 接在一起，中間連空白字元都沒有，
  在手機上就是兩個緊貼的目標。按鈕之間留間距，觸控目標給到 2.75rem（約 44 px，
  觸控介面的建議下限），跟 vault-lab 那一頁同一個處理。
  貼字串的欄位也沒有字級，落在瀏覽器給 input 的預設 13 px。iOS Safari 在輸入框字級
  小於 16px 時一聚焦就放大整頁，而且不會縮回去，處理同 qrcode.js。
*/
#passkey-lab .pl-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.1rem 0;
  align-items: center;
}
#passkey-lab .pl-btn {
  min-height: 2.75rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.75rem;
  line-height: 1.4;
  border: 1px solid var(--md-default-fg-color--lighter);
  border-radius: 0.4rem;
  background: var(--md-default-bg-color);
  color: var(--md-default-fg-color);
  cursor: pointer;
}
#passkey-lab .pl-label {
  display: block;
  margin: 1.2rem 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
}
#passkey-lab .pl-expect {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.5rem;
  font-family: var(--md-code-font-family, monospace);
  font-size: max(16px, 0.78rem);
  border: 1px solid var(--md-default-fg-color--lighter);
  border-radius: 0.4rem;
  background: var(--md-default-bg-color);
  color: var(--md-default-fg-color);
}
</style>

<div id="passkey-lab"></div>
<script src="../../js/passkey-lab.js"></script>

## 怎麼用

在一台裝置上按「建立測試 passkey」，畫面會顯示剛才放進去的那 64 個十六進位字元。按「驗證並取回」確認同一台裝置拿得回來。

要驗跨裝置就把那串複製到另一台裝置，貼進欄位再按驗證。兩邊一致才代表這條路成立。

## 這一頁留下了什麼

它會在你的密碼管理器或鑰匙圈裡留下一筆 passkey，名字寫著「userhandle-lab（測試用，可刪）」。量完就可以刪掉，那把鑰匙沒有任何其他用途。

這一頁本身不寫入任何儲存空間。畫面上那串值重新整理就沒了，跨裝置比對要自己複製過去。

## 已知的結果

還沒有。量到什麼就記在這裡。
