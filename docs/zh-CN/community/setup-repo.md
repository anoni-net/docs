---
title: 项目研究预先准备
icon: octicons/mark-github-24
---
# :octicons-mark-github-24: 项目研究预先准备

## 什么是版本控制器

版本控制器是一种用于管理和追踪文件版本变化的系统，主要应用在软件开发中，但也可以用于任何需要版本管理的文件工作。它的核心功能是记录每个文件的修改历史，让用户可以随时查看过去的版本并了解具体的更改内容。这种记录对于开发团队尤为重要，因为它允许多位开发者同时对同一项目进行工作，而不会互相干扰。

在版本控制中，用户可以创建分支来开展不同的工作，然后在必要时合并这些分支。这种方式允许开发者独立地开发新功能或修复错误，并在确保一切正常后再整合到主要版本中。此外，版本控制器可以大大提升协作的效率，允许团队成员间轻松分享和合并工作。

版本控制器一般可分为集中式和分散式两种类型。集中式版本控制器，如 CVS 和 Subversion，需要一个中央服务器来存储所有的版本信息。分散式版本控制器，如 Git 和 Mercurial，则允许每个用户在本地拥有完整的项目历史副本，这提供了更多的灵活性和可靠性。

如果开发中的更改出现问题，版本控制器提供了回退功能，让用户可以迅速恢复到先前的稳定状态。此外，还提供工具来比较和分析不同版本之间的差异，帮助开发者理解更改的原因和影响。

### Git

Git 是一个分散式的版本控制系统，常应用于软件开发和其他需要追踪文件修改的工作中。以下是一些基础说明，可以帮助你了解 Git 的概念和使用：

1. **版本控制系统：**Git 是一种工具，可以让你和协作团队追踪和管理对代码或文件的更改，随时查看某个时刻的版本记录。不仅限于代码，也能用于任何需要版本控制的文件，如文档文件。
2. **分散式：**与集中式版本控制系统不同，Git 的每个用户都拥有完整的版本库副本。这意味着即使没有网络连接，你也能在本地进行提交和查看历史记录。
3. **主要功能：**
    - **存储库（Repository）：**这是一个项目的 Git 存储空间，本地或远程存储库都能存储项目的所有版本历史和设置。
    - **提交（Commit）：**一次提交代表对项目的具体更改，通常附带有意义的描述，有助于协作团队成员了解其修改内容。
    - **分支（Branch）：**可以让开发人员独立于主工作流程进行新功能的开发或错误修正，完成后再合并回主分支。
    - **合并（Merge）：**将一个分支的历史和变更整合到另一个分支，通常是主分支。
    - **克隆（Clone）：**将远程存储库的整个内容复制到本地，以便进行查看或编辑。
4. **使用场景：**Git 非常适合需要频繁改动且多人协作的项目，如软件开发。它能有效防止冲突，并提供强大的历史追踪功能。

!!! info "建议阅读"

    - [什么是 Git？为什么要学习它？- 为你自己学 Git | 高见龙](https://gitbook.tw/chapters/introduction/what-is-git){target="_blank"}
    - [Git 基础要点 - Git](https://git-scm.com/book/zh-cn/v2/%E5%BC%80%E5%A7%8B-Git-%E5%9F%BA%E7%A1%80%E8%A6%81%E7%82%B9){target="_blank"}

### Github

GitHub 是一个基于 Git 的线上平台，专门用于版本控制和协作开发。它提供了一个网络平台，让开发者可以在云端存储和管理自己的 Git 仓库，并且加入其他开发项目的协作。GitHub 的重要概念：

1. **仓库（Repository）：**在 GitHub 上，每个项目都存储在一个仓库中。这是存储项目所有文件及其修订记录的地方。你可以公开分享仓库或将其设置为私密。
2. **协作：**GitHub 方便不同人员之间的合作，允许多个开发者提出和合并更改，并通过各项协作工具（如 Issues 和 Pull Requests）来管理项目的开发流程。
3. **分支及 Pull Requests：**开发者可以创建分支来开发新功能或修复问题，然后使用 Pull Request 提交合并请求给仓库管理员审查和整合，这是一让他人检阅和讨论更改的过程。
4. **GitHub Pages：**此功能让用户可以从仓库中生成静态网站，适合用来展示项目文件、个人履历或其他需要发布的静态内容。
5. **社区互动：**GitHub 是一个活跃且广泛的社区，开发者可以通过追踪（watch）、留言和贡献来互动，有助于开发者间知识分享和学习。
6. **自动化和扩展：**通过 GitHub Actions，可以自动化工作流程，如持续集成、持续交付（CI/CD）管道。此外，GitHub 支持多种扩展和第三方服务的集成，提供更多功能。

!!! info "建议阅读"

    - [如何建立 GitHub 账号？](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github){target="_blank"}
    - [如何 Fork 一个项目？](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo){target="_blank"}
    - [如何在 GitHub 上编辑文件](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files){target="_blank"}
    - [如何建立 Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request){target="_blank"}

## 开发环境安装

### Python

Python 是一种多功能的语言，能够应用在多个领域，包括但不限于网页开发、数据分析、人工智能、机器学习、自动化脚本、科学计算以及网络服务。其庞大的标准函数库和活跃的社区支持，使开发者能轻松找到所需的工具或资源来解决问题。

Python 的设计哲学强调代码的可读性和简洁性，开发者能够用较少的代码达成相同的功能。这不仅降低了学习门槛，也提高了开发效率和维护性。编写程序时使用缩进来划分代码块，在其他语言中通常是由大括号或关键词来完成的，这种独特的语法特性进一步提升了代码的简洁和美观。此外，Python 是跨平台的，在 Windows、macOS 和 Linux 上都能运行，而不需要对代码做出修改。Python 的解释器也使代码能够逐行运行和测试，对于需要快速原型设计和测试的开发者来说，这是相当便利的。

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

[uv](https://docs.astral.sh/uv/){target="_blank"} 是一个专门用于管理 Python 项目包的工具。它通过简化包管理，让开发者更方便地建立和配置虚拟开发环境，确保项目间的依赖不会彼此冲突。此外，uv 还提供了打包和发布 Python 包的功能，让分享和部署代码变得更加容易。

!!! tip "如何安装 uv"

    - 如何安装请参考[官方文件说明](https://docs.astral.sh/uv/getting-started/installation/){target="_blank"}。

### VS Code

[Visual Studio Code](https://code.visualstudio.com/){target="_blank"}（常简称为 VS Code）是一款由微软开发的轻量级程序编辑器（IDE），其突出特点是跨平台支持，可运行于 Windows、macOS 和 Linux 系统上。VS Code 拥有现代化的用户界面和丰富的功能，使其成为开发者之间广受欢迎的工具。这款编辑器集成了对 Git 的内建支持，让版本控制和团队协作变得更加简单。此外，VS Code 的扩展功能市集非常丰富，开发者可以安装各种扩展功能来增强编辑器的性能，无论是增加对不同语言的支持，还是集成不同的开发工具或框架。

!!! tip "如何安装 VS Code"

    - 如何安裝請參考[官方文件說明](https://code.visualstudio.com/){target="_blank"}。

## Fork 项目

Fork 是在分散式版本控制平台（如 GitHub）上复制他人仓库至自己账户的一个过程，主要用于在不影响原始项目的情况下单独进行修改和实验。Forking 是开源项目协作的一个常见做法，允许开发者在独立的仓库中探索新想法或解决问题。

要进行 Fork，请登录你的 GitHub 账户，然后访问你想 Fork 的仓库。点击仓库右上角的 "Fork" 按钮，GitHub 便会将该仓库复制到你的账户下。

在完成 Fork 之后，通常会想要在这个 Fork 来的仓库上创建一个新的分支，这样便可以在不影响主分支的情况下进行更改。要创建新的分支，首先将仓库 `git clone` 到本地。然后在命令行中进入项目文件夹，使用以下指令创建并切换到新分支：

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
    - Python 也是一个很容易上手的编程语言，也建议可以学起来好好运用，推荐阅读「[为你自己学 PYTHON](https://pythonbook.cc/){target="_blank"}」。
