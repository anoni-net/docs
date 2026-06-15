---
title: 專案研究預先準備
description: 加入 anoni.net 文件站、Pulse、ASN Coverage 等專案開發前的環境設定指南，包含 git、GitHub、本機開發環境基礎。給想實際動手協作的台灣志工。
icon: octicons/mark-github-24
---
# :octicons-mark-github-24: 專案研究預先準備

## 你需要先準備什麼

anoni.net 的文件站、Pulse、ASN Coverage 都放在 GitHub（[anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}），用 git 做版本控制、用 Pull Request 收貢獻。動手前你需要：

- 一個 [GitHub 帳號](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github){target="_blank"}
- 本機裝好 git、Python、uv 與一個編輯器（下面逐項說明）

沒用過 git 或 GitHub 也沒關係，不必先變成高手。先看懂「fork 別人的 repo、開分支、commit、發 PR」這一條流程就能開始貢獻。下面幾份入門資料夠用。

!!! info "git / GitHub 入門"

    - [什麼是 Git？為什麼要學習它？ - 為你自己學 Git | 高見龍](https://gitbook.tw/chapters/introduction/what-is-git){target="_blank"}
    - [Git 基礎要點 - Git 官方文件](https://git-scm.com/book/zh-tw/v2/%E9%96%8B%E5%A7%8B-Git-%E5%9F%BA%E7%A4%8E%E8%A6%81%E9%BB%9E){target="_blank"}
    - [如何 Fork 一個專案](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo){target="_blank"}
    - [如何在 GitHub 上編輯文件](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files){target="_blank"}
    - [如何建立 Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request){target="_blank"}

## 開發環境安裝

### Python

anoni.net 的 Pulse 與 ASN Coverage 都用 Python 寫，文件站的建置腳本也是。三個子專案都要求 Python 3.12 以上，先依下面的指引把 Python 裝起來。

!!! tip "安裝指引"

    === "Windows"

        1. 下載安裝程式：[前往 Python 的官方網站](https://www.python.org/){target="_blank"}。
        2. 執行安裝程式：
            - 下載完成後，執行下載的安裝程式。
            - 在安裝開始畫面，務必勾選 "Add Python to PATH" 選項，這會將 Python 加入系統的環境變數中。
            - 選擇 "Customize installation" 以檢視或修改安裝選項，或直接點選 "Install Now" 以進行預設安裝。
        3. 驗證安裝：
            - 完成安裝後，打開命令提示字元（Command Prompt），輸入 `python --version` 或 `python`。如果安裝成功，應該會顯示 Python 的版本號。

    === "macOS"

        1. 使用 Homebrew 安裝（推薦）：
            - 打開「終端機（Terminal）」。
            - 確保你已經安裝了 Homebrew，如果沒有，請先安裝 Homebrew。
            - 輸入 `brew install python` 來安裝 Python。
        2. 從官網安裝：
            - 同樣地，可以從 Python 的官方網站[下載 macOS 版本](https://www.python.org/){target="_blank"}的安裝。
            - 開啟下載的 `.pkg` 文件，按照引導進行安裝。
        3. 驗證安裝：
            - 開啟終端機，輸入 `python3 --version`。

    === "Linux"

        1. 使用套件包管理器（以 Ubuntu 為例）：
            - 打開一個終端機。
            - 輸入以下指令以更新套件列表：`sudo apt update`
            - 安裝 Python：`sudo apt install python3`
        2. 驗證安裝：
            - 在終端機中輸入 `python3 --version` 以驗證安裝。

### uv

[uv](https://docs.astral.sh/uv/){target="_blank"} 是 Python 的套件與虛擬環境管理工具，anoni.net 各專案統一用它管理依賴。在子專案目錄執行 `uv sync` 就會建立隔離的虛擬環境並裝好所有套件，專案間的依賴不會彼此衝突。

!!! tip "如何安裝 uv"

    - 如何安裝請參考[官方文件說明](https://docs.astral.sh/uv/getting-started/installation/){target="_blank"}。

### VS Code

[Visual Studio Code](https://code.visualstudio.com/){target="_blank"}（常簡稱 VS Code）是微軟開發的跨平台編輯器，內建 Git 支援，擴充套件也涵蓋 Python、Markdown 等本專案會用到的格式。你不一定要用它，習慣其他編輯器就用順手的，這裡只是給沒有偏好的人一個建議。

!!! tip "如何安裝 VS Code"

    - 如何安裝請參考[官方文件說明](https://code.visualstudio.com/){target="_blank"}。

## Fork 專案

Fork 是在分散式版本控制平台（如 GitHub）上複製他人儲存庫至自己帳戶的一個過程，主要用於在不影響原始專案的情況下個別進行修改和實驗。Forking 是開源項目協作的一個常見做法，允許開發者在獨立的儲存庫中探索新想法或解決問題。

要進行 Fork，請登入你的 GitHub 帳戶，然後連結到你想 Fork 的儲存庫。點擊儲存庫右上角的 "Fork" 按鈕，GitHub 便會將該儲存庫複製到你的帳戶下。

在完成 Fork 之後，通常會想要在這個 Fork 來的儲存庫上建立一個新的分支，這樣便可以在不影響主分支的情況下進行更改。要建立新的分支，首先將儲存庫 `git clone` 到本地。然後在命令列中進入專案資料夾，使用以下指令建立並切換到新分支：

    git checkout -b 新分支名稱

在新分支上工作時，可以做出程式碼的修改。當修改完成後，使用下面的命令將修改提交（commit）到該分支：

    git add .
    git commit -m "你的修改描述"

這些指令會將你工作目錄的變更暫存並提交到本地的 Git 儲存庫中。之後，將已更改項目推送回 GitHub 儲存庫上你的分支：

    git push origin 新分支名稱

一旦修改推送到你的 GitHub 儲存庫，你可以提交 Pull Request（PR）來建議將這些更改合併至原始儲存庫。在你的 GitHub 儲存庫頁面中，會看到一個 "Compare & pull request" 的按鈕，點擊後輸入詳細的更改說明，然後按下 "Create pull request" 提交你的 PR。專案管理者將查看這些更改，並在批准後將其合併至專案主線上。

透過進行 Fork、建立分支、Commit 和提交 PR，可以有效地參與開源專案，貢獻你的想法和更改，這是一個學習和成長的寶貴過程。

!!! note "關於後續的學習與應用"

    - 建議可以花點時間跟著學習[如何使用 Git](https://gitbook.tw/){target="_blank"}，不論在程式碼的管理或未來與文件版本管理來說都相當有幫助。
    - Python 也是一個不錯上手的程式語言，也建議可以學起來好好應用，推薦閱讀「[為你自己學 Python](https://pythonbook.cc/){target="_blank"}」。
