---
title: Development environment setup
description: "Set up the tools you need to contribute to anoni.net's repositories: a GitHub account, Git, Python 3.12 with uv, and an editor. Then fork anoni-net/docs and open your first pull request."
icon: octicons/mark-github-24
---
# :octicons-mark-github-24: Development environment setup

## What you need first

anoni.net's documentation site, Pulse, and the ASN Coverage tools all live in [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} on GitHub. The project uses Git for version control and takes contributions through pull requests. Before you start you need:

- A [GitHub account](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github){target="_blank"}
- Git, Python, uv, and an editor installed locally, covered below

If you have never used Git or GitHub, you do not need to become an expert first. Understanding one workflow is enough to start contributing: fork someone's repository, create a branch, commit, open a pull request. The references below cover that ground, and GitHub's own documentation stays more current than anything we could write here.

!!! info "Git and GitHub basics"

    - [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics){target="_blank"} from the official Pro Git book
    - [Fork a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo){target="_blank"}
    - [Editing files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files){target="_blank"}
    - [Creating a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request){target="_blank"}
    - [Learn Git for Yourself](https://gitbook.tw/){target="_blank"} by Eddie Kao, in Traditional Chinese

## Development environment

### Python

Pulse and ASN Coverage are written in Python, and so are the documentation site's build scripts. All three subprojects require **Python 3.12 or newer**, so check your version before going further.

!!! tip "Installation"

    === "Windows"

        1. Download the installer from [python.org](https://www.python.org/){target="_blank"}.
        2. Run it, and make sure **Add Python to PATH** is checked on the first screen. Choose "Customize installation" to review the options, or "Install Now" for the defaults.
        3. Open Command Prompt and run `python --version` to confirm the install and check you are on 3.12 or newer.

    === "macOS"

        1. With Homebrew (recommended): open Terminal and run `brew install python`.
        2. Or download the macOS installer from [python.org](https://www.python.org/){target="_blank"} and open the `.pkg` file.
        3. Run `python3 --version` to confirm the install and check the version.

    === "Linux"

        1. On Ubuntu or Debian: `sudo apt update` then `sudo apt install python3`.
        2. Run `python3 --version` to confirm. If your distribution ships something older than 3.12, install a newer version through [uv](https://docs.astral.sh/uv/guides/install-python/){target="_blank"} or your distribution's backports.

### uv

[uv](https://docs.astral.sh/uv/){target="_blank"} manages Python packages and virtual environments, and every anoni.net subproject uses it for dependencies. Running `uv sync` inside a subproject directory creates an isolated environment and installs everything that project needs, so dependencies never collide between subprojects.

!!! tip "How to install uv"

    - See the [official documentation](https://docs.astral.sh/uv/getting-started/installation/){target="_blank"}.

### An editor

[Visual Studio Code](https://code.visualstudio.com/){target="_blank"} is a cross-platform editor from Microsoft with built-in Git support, and extensions covering Python and Markdown, which is what this project uses. You do not have to use it. If you already have an editor you like, use that. This is only a suggestion for people without a preference.

## Fork a Project

Forking copies a repository into your own GitHub account so you can change and experiment with it without touching the original. It is the standard way to contribute to an open-source project you do not have write access to.

Log into GitHub, go to [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}, and click **Fork** in the upper right. GitHub copies the repository to your account.

Clone your fork locally, then create a branch so your work stays off the main branch:

```bash
git clone https://github.com/<your-username>/docs.git
cd docs
git checkout -b your-branch-name
```

Make your changes, then stage and commit them:

```bash
git add .
git commit -m "A short description of your change"
```

Push the branch to your fork:

```bash
git push origin your-branch-name
```

GitHub will then show a **Compare & pull request** button on your repository page. Click it, describe what you changed and why, and submit. A maintainer reviews the change and merges it once it is ready.

!!! tip "Working on the docs site specifically"

    The documentation site lives under `docs/` with one directory per language (`zh-TW`, `zh-CN`, `en`). To preview your changes locally:

    ```bash
    cd docs
    uv sync
    source .venv/bin/activate
    mkdocs serve
    ```

    That serves the zh-TW site at `http://127.0.0.1:8000`. Use `sh run_en.sh` for the English version.

## :fontawesome-solid-diagram-project: Where to go from here

<div class="grid cards" markdown>

- [:material-hand-heart-outline: How to contribute](./how-to-contribute.md) — pick a topic and open your first pull request
- [:material-stairs: Self-skills evaluation](./skill-level.md) — work out where to start based on what you already know
- [:material-account-group-outline: Join the community](./index.md) — our Matrix space, and how to reach us if you get stuck

</div>
