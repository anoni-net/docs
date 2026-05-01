---
title: 專案研究預先準備
icon: octicons/mark-github-24
---
# :octicons-mark-github-24: 專案研究預先準備

## 什麼是版本控制器

版本控制器是一種用於管理和追蹤文件版本變化的系統，主要應用在軟體開發中，但也可以用於任何需要版本管理的文件工作。它的核心功能是記錄每個文件的修改歷史，讓使用者可以隨時查看過去的版本並了解具體的更改內容。這種記錄對於開發團隊尤為重要，因為它允許多位開發者同時對同一項目進行工作，而不會互相干擾。

在版本控制中，使用者可以創建分支來開展不同的工作，然後在必要時合併這些分支。這種方式允許開發者獨立地開發新功能或修理錯誤，並在確保一切正常後再整合到主要版本中。此外，版本控制器可以大大提升協作的效率，允許團隊成員間輕鬆分享和合併工作。

版本控制器一般可分為集中式和分散式兩種類型。集中式版本控制器，如 CVS 和 Subversion，需要一個中央伺服器來存儲所有的版本信息。分散式版本控制器，如 Git 和 Mercurial，則允許每個使用者在本地擁有完整的專案歷史副本，這提供了更多的靈活性和可靠性。

如果開發中的更改出現問題，版本控制器提供了回退功能，讓使用者可以迅速恢復到先前的穩定狀態。此外，還提供工具來比較和分析不同版本之間的差異，幫助開發者理解更改的原因和影響。

### Git

Git 是一個分散式的版本控制系統，常應用於軟體開發和其他需要追蹤文件修改的工作中。以下是一些基礎說明，可以幫助你了解 Git 的概念和使用：

1. **版本控制系統：**Git 是一種工具，能讓你和協作團隊追蹤和管理對程式碼或文件的更改，隨時查看某個時刻的版本紀錄。不僅限於程式碼，也能用在任何需要版本控制的文件，如文書檔案。
2. **分散式：**與集中式版本控制系統不同，Git 的每個使用者都擁有完整的版本庫的副本。這表示即使沒有網路連接，你也能在本地進行提交和檢視歷史記錄。
3. **主要功能：**
    - **儲存庫（Repository）：**這是一個專案的 Git 儲存空間，本地端或遠端儲存庫都能儲存專案的所有版本歷史和設定。
    - **提交（Commit）：**一次提交代表對專案的具體更改，通常附帶有意義的描述，幫助協作團隊成員了解其修改內容。
    - **分支（Branch）：**可讓開發人員獨立於主工作流程進行新功能的開發或錯誤修正，完成後再合併回主分支。
    - **合併（Merge）：**將一個分支的歷史和變更整合到另一個分支，通常是主分支。
    - **拓製（Clone）：**將遠端儲存庫的整個內容複製到本地，以便進行查看或編輯。
4. **使用場景：**Git 非常適合需要頻繁改動且多人協作的專案，如軟體開發。它能有效防止衝突，並提供強大的歷史追蹤功能。

!!! info "建議閱讀"

    - [什麼是 Git？為什麼要學習它？ - 為你自己學 Git | 高見龍](https://gitbook.tw/chapters/introduction/what-is-git){target="_blank"}
    - [Git 基礎要點 - Git](https://git-scm.com/book/zh-tw/v2/%E9%96%8B%E5%A7%8B-Git-%E5%9F%BA%E7%A4%8E%E8%A6%81%E9%BB%9E){target="_blank"}

### Github

GitHub 是一個基於 Git 的線上平台，專門用於版本控制和協作開發。它提供了一個網路平台，讓開發者可以在雲端儲存和管理自己的 Git 儲存庫，並且加入其他開發專案的協作。GitHub 的重要概念：

1. **儲存庫（Repository）：**在 GitHub 上，每個專案都存儲在一個儲存庫中。這是儲存專案所有文件及其修訂記錄的地方。你可以公開分享儲存庫或將其設為私密。
2. **協作：**GitHub 方便不同人員之間的合作，允許多個開發者提出和合併更改，並透過各項協作工具（如 Issues 和 Pull Requests）來管理項目的開發流程。
3. **分支及 Pull Requests：**開發者可以創建分支來開發新功能或修正問題，然後使用 Pull Request 提交合併請求給儲存庫管理員審查和整合，這是一個讓他人檢閱和討論更改的過程。
4. **GitHub Pages：**此功能讓用戶可以從儲存庫中生成靜態網站，適合用來展示專案文件、個人履歷或其他需要發布的靜態內容。
5. **社群互動：**GitHub 是一個活躍且廣泛的社群，開發者可以透過追蹤（watch）、留言和貢獻來互動，有助於開發者間知識分享和學習。
6. **自動化和擴展：**透過 GitHub Actions，可以自動化工作流程，如持續整合、持續交付（CI/CD）管道。此外，GitHub 支援多種擴充套件和第三方服務的集成，提供更多功能。

!!! info "建議閱讀"

    - [如何建立 Github 帳號？](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github){target="_blank"}
    - [如何 Fork 一個專案？](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo){target="_blank"}
    - [如何在 Github 上編輯文件](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files){target="_blank"}
    - [如何建立 Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request){target="_blank"}

## 開發環境安裝

### Python

Python 是一種多功能的語言，能夠應用在多種領域，包括但不限於網頁開發、資料數據分析、人工智慧、機器學習、自動化腳本、科學計算以及網路服務。其龐大的標準函式庫和活躍的社群支持，使開發者能輕鬆找到所需的工具或資源來解決問題。

Python 的設計哲學強調程式碼的可讀性和簡潔性，開發者能夠用較少的程式碼達成同樣的功能。不僅降低了學習門檻，也提高了開發效率和維護性。撰寫程式時使用縮排來劃分程式碼區塊，在其他語言中通常是由大括號或關鍵字來完成的，這種獨特的語法特性進一步提升了程式碼的簡潔和美觀。此外，Python 是跨平台的，在 Windows、macOS 和 Linux 上都能運行，而不需要對程式碼做出修改。Python 的直譯器也使程式碼能夠逐行運行和測試，對於需要快速原型設計和測試的開發者來說，這是相當便利的。

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

[uv](https://docs.astral.sh/uv/){target="_blank"} 是一個專門用於管理 Python 專案套件庫的工具。它透過簡化套件管理，讓開發者更方便地建立和配置虛擬開發環境，確保專案間的依賴不會彼此衝突。此外，uv 還提供了打包和發布 Python 套件包的功能，讓分享和佈署程式碼變得更加容易。

!!! tip "如何安裝 uv"

    - 如何安裝請參考[官方文件說明](https://docs.astral.sh/uv/getting-started/installation/){target="_blank"}。

### VS Code

[Visual Studio Code](https://code.visualstudio.com/){target="_blank"}（常簡稱為 VS Code）是一款由微軟開發的輕量級程式編輯器（IDE），其突出特點是跨平台支援，能運行於 Windows、macOS 和 Linux 系統上。VS Code 擁有現代化的使用者介面和豐富的功能，使其成為開發者之間廣受歡迎的工具。這款編輯器集成了對 Git 的內建支援，讓版本控制和團隊協作變得更加簡單。此外，VS Code 的擴充功能市集非常豐富，開發者可以安裝各種擴充功能來增強編輯器的性能，無論是增加對不同語言的支持，還是集成不同的開發工具或框架。

!!! tip "如何安裝 VS Code"

    - 如何安裝請參考[官方文件說明](https://code.visualstudio.com/){target="_blank"}。

## Fork 專案

Fork 是在分散式版本控制平台（如 GitHub）上複製他人儲存庫至自己帳戶的一個過程，主要用於在不影響原始專案的情況下個別進行修改和實驗。Forking 是開源項目協作的一個常見做法，允許開發者在獨立的儲存庫中探索新想法或解決問題。

要進行 Fork，請登入你的 GitHub 帳戶，然後連結到你想 Fork 的儲存庫。點擊儲存庫右上角的 "Fork" 按鈕，GitHub 便會將該儲存庫複製到你的帳戶下。

在完成 Fork 之後，通常會想要在這個 Fork 來的儲存庫上建立一個新的分支，這樣便可以在不影響主分支的情況下進行更改。要建立新的分支，首先將儲存庫 `git clone` 到本地。然後在命令列中進入專案資料夾，使用以下指令創建並切換到新分支：

    git checkout -b 新分支名稱

在新分支上工作時，可以做出程式碼的修改。當修改完成後，使用下面的命令將修改提交（commit）到該分支：

    git add .
    git commit -m "你的修改描述"

這些指令會將你工作目錄的變更暫存並提交到本地的 Git 儲存庫中。之後，將已更改項目推送回 GitHub 儲存庫上你的分支：

    git push origin 新分支名稱

一旦修改推送到你的 GitHub 儲存庫，你可以提交 Pull Request（PR）來建議將這些更改合併至原始儲存庫。在你的 GitHub 儲存庫頁面中，會看到一個 "Compare & pull request" 的按鈕，點擊後輸入詳細的更改說明，然後按下 "Create pull request" 提交你的 PR。專案管理者將查看這些更改，並在批准後將其合併至專案主線上。

通過進行 Fork、建立分支、Commit 和提交 PR，可以有效地參與開源專案，貢獻你的想法和更改，這是一個學習和成長的寶貴過程！

!!! note "關於後續的學習與應用"

    - 建議可以花點時間跟著學習[如何使用 Git](https://gitbook.tw/){target="_blank"}，不論在程式碼的管理或未來與文件版本管理來說都相當有幫助！
    - Python 也是一個不錯上手的程式語言，也建議可以學起來好好應用，推薦閱讀「[為你自己學 PYTHON](https://pythonbook.cc/){target="_blank}」。
