---
title: 项目研究预先准备
description: 加入 anoni.net 文件站、Pulse、ASN Coverage 等项目开发前的环境设定指南，包含 git、GitHub、本机开发环境基础。给想实际动手协作的华语志愿者。
icon: octicons/mark-github-24
---
# :octicons-mark-github-24: 项目研究预先准备

## 你需要先准备什么

anoni.net 的文件站、Pulse、ASN Coverage 都放在 GitHub（[anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}），用 git 做版本控制、用 Pull Request 收贡献。动手前你需要：

- 一个 [GitHub 账号](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github){target="_blank"}
- 本机装好 git、Python、uv 与一个编辑器（下面逐项说明）

没用过 git 或 GitHub 也没关系，不必先变成高手。先看懂「fork 别人的 repo、开分支、commit、发 PR」这一条流程就能开始贡献。下面几份入门资料够用。

!!! info "git / GitHub 入门"

    - [什么是 Git？为什么要学习它？- 为你自己学 Git | 高见龙](https://gitbook.tw/chapters/introduction/what-is-git){target="_blank"}
    - [Git 基础要点 - Git 官方文件](https://git-scm.com/book/zh-cn/v2/%E5%BC%80%E5%A7%8B-Git-%E5%9F%BA%E7%A1%80%E8%A6%81%E7%82%B9){target="_blank"}
    - [如何 Fork 一个项目](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo){target="_blank"}
    - [如何在 GitHub 上编辑文件](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files){target="_blank"}
    - [如何建立 Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request){target="_blank"}

## 开发环境安装

### Python

anoni.net 的 Pulse 与 ASN Coverage 都用 Python 写，文件站的建置脚本也是。三个子项目都要求 Python 3.12 以上，先依下面的指引把 Python 装起来。

!!! tip "安装指引"

    === "Windows"

        1. 下载安装程序：[前往 Python 的官方网站](https://www.python.org/){target="_blank"}。
        2. 执行安装程序：
            - 下载完成后，运行下载的安装程序。
            - 在安装开始界面，务必勾选 "Add Python to PATH" 选项，这会将 Python 加入系统的环境变量中。
            - 选择 "Customize installation" 以查看或修改安装选项，或直接点击 "Install Now" 以进行默认安装。
        3. 验证安装：
            - 完成安装后，打开命令提示符（Command Prompt），输入 `python --version` 或 `python`。如果安装成功，应该会显示 Python 的版本号。

    === "macOS"

        1. 使用 Homebrew 安装（推荐）：
            - 打开「终端」（Terminal）。
            - 确保你已经安装了 Homebrew，如果没有，请先安装 Homebrew。
            - 输入 `brew install python` 来安装 Python。
        2. 从官网下载：
            - 同样地，可以从 Python 的官方网站[下载 macOS 版本](https://www.python.org/){target="_blank"}进行安装。
            - 打开下载的 `.pkg` 文件，按照引导进行安装。
        3. 验证安装：
            - 打开终端，输入 `python3 --version`。

    === "Linux"

        1. 使用包管理器（以 Ubuntu 为例）：
            - 打开一个终端。
            - 输入以下指令以更新包列表：`sudo apt update`
            - 安装 Python：`sudo apt install python3`

        2. 验证安装：
            - 在终端中输入 `python3 --version` 以验证安装。

### uv

[uv](https://docs.astral.sh/uv/){target="_blank"} 是 Python 的包与虚拟环境管理工具，anoni.net 各项目统一用它管理依赖。在子项目目录执行 `uv sync` 就会建立隔离的虚拟环境并装好所有包，项目间的依赖不会彼此冲突。

!!! tip "如何安装 uv"

    - 如何安装请参考[官方文件说明](https://docs.astral.sh/uv/getting-started/installation/){target="_blank"}。

### VS Code

[Visual Studio Code](https://code.visualstudio.com/){target="_blank"}（常简称 VS Code）是微软开发的跨平台编辑器，内建 Git 支持，扩展套件也涵盖 Python、Markdown 等本项目会用到的格式。你不一定要用它，习惯其他编辑器就用顺手的，这里只是给没有偏好的人一个建议。

!!! tip "如何安装 VS Code"

    - 如何安装请参考[官方文件说明](https://code.visualstudio.com/){target="_blank"}。

## Fork 项目

Fork 是在分散式版本控制平台（如 GitHub）上复制他人仓库至自己账户的一个过程，主要用于在不影响原始项目的情况下单独进行修改和实验。Forking 是开源项目协作的一个常见做法，允许开发者在独立的仓库中探索新想法或解决问题。

要进行 Fork，请登录你的 GitHub 账户，然后访问你想 Fork 的仓库。点击仓库右上角的 "Fork" 按钮，GitHub 便会将该仓库复制到你的账户下。

在完成 Fork 之后，通常会想要在这个 Fork 来的仓库上建立一个新的分支，这样便可以在不影响主分支的情况下进行更改。要建立新的分支，首先将仓库 `git clone` 到本地。然后在命令行中进入项目文件夹，使用以下指令建立并切换到新分支：

    git checkout -b 新分支名称

在新分支上工作时，可以做出代码修改。当修改完成后，使用下面的命令将修改提交（commit）到该分支：

    git add .
    git commit -m "你的修改描述"

这些指令会将你工作目录的变更暂存并提交到本地的 Git 仓库中。之后，将已更改项目推送回 GitHub 仓库的你的分支：

    git push origin 新分支名称

一旦修改推送到你的 GitHub 仓库，你可以提交 Pull Request（PR）来建议将这些更改合并至原始仓库。在你的 GitHub 仓库页面中，会看到一个 "Compare & pull request" 的按钮，点击后输入详细的更改说明，然后按下 "Create pull request" 提交你的 PR。项目管理者将查看这些更改，并在批准后将其合并至项目主线上。

通过进行 Fork、创建分支、Commit 和提交 PR，可以有效地参与开源项目，贡献你的想法和更改，这是一个学习和成长的宝贵过程！

!!! note "关于后续的学习与应用"

    - 建议可以花些时间跟着学习[如何使用 Git](https://gitbook.tw/){target="_blank"}，无论在代码的管理或未来与文件版本管理来说都相当有帮助！
    - Python 也是一个很容易上手的编程语言，也建议可以学起来好好运用，推荐阅读「[为你自己学 Python](https://pythonbook.cc/){target="_blank"}」。
