---
title: Project Research Preparation
icon: octicons/mark-github-24
---
# :octicons-mark-github-24: Project Research Preparation

## What is a Version Control System

A version control system is a tool used for managing and tracking changes in document versions, primarily applied in software development, but also useful for any work requiring version management. Its core function is to record the modification history of each document, allowing users to view past versions at any time and understand specific changes made. This record-keeping is especially important for development teams, as it allows multiple developers to work on the same project simultaneously without interfering with each other.

In version control, users can create branches to carry out different work, then merge these branches when necessary. This approach enables developers to independently develop new features or fix bugs and integrate them into the main version once everything is ensured to be working correctly. Moreover, a version control system significantly enhances collaboration efficiency, allowing team members to easily share and merge their work.

Version control systems are generally categorized into centralized and distributed types. Centralized version control systems, like CVS and Subversion, require a central server to store all version information. Distributed version control systems, like Git and Mercurial, allow each user to have a complete local copy of the project's history, providing greater flexibility and reliability.

If issues arise with changes made during development, version control systems offer rollback features, enabling users to quickly revert to a previous stable state. Additionally, they provide tools to compare and analyze differences between versions, helping developers understand the reasons for changes and their impact.

### Git

Git is a distributed version control system commonly used in software development and other tasks that require tracking file modifications. Here are some basic explanations to help you understand the concepts and usage of Git:

1. **Version Control System:** Git is a tool that allows you and your collaboration team to track and manage changes to code or documents and view version history at any point in time. It's not limited to code but can also be used for any documents requiring version control, such as office files.
2. **Distributed:** Unlike centralized version control systems, each Git user has a complete copy of the repository. This means you can make commits and view history locally even without an internet connection.
3. **Main Features:**
    - **Repository:** This is Git's storage space for a project. Both local and remote repositories can store the project's entire version history and settings.
    - **Commit:** A commit represents specific changes to a project, typically accompanied by meaningful descriptions to help team members understand what was modified.
    - **Branch:** Allows developers to work on new features or bug fixes independently of the main workflow and merge them back into the main branch once completed.
    - **Merge:** Integrates the history and changes from one branch into another, usually the main branch.
    - **Clone:** Copies the entire contents of a remote repository to the local environment for viewing or editing.
4. **Use Case:** Git is well-suited for projects requiring frequent changes and collaboration among multiple people, such as software development. It effectively prevents conflicts and provides robust historic tracking features.

!!! info "Recommended Reading"

    - [What is Git? Why Learn It? - Learn Git for Yourself | Gao Jianlong](https://gitbook.tw/chapters/introduction/what-is-git){target="_blank"}
    - [Git Basics - Git](https://git-scm.com/book/zh-tw/v2/%E9%96%8B%E5%A7%8B-Git-%E5%9F%BA%E7%A4%8E%E8%A6%81%E9%BB%9E){target="_blank"}

### GitHub

GitHub is an online platform based on Git, designed for version control and collaborative development. It offers a web-based interface for developers to store and manage their Git repositories in the cloud and collaborate on other development projects. Key concepts of GitHub include:

1. **Repository:** On GitHub, each project is stored in a repository, which is where all the project files and their revision histories are kept. You can share repositories publicly or keep them private.
2. **Collaboration:** GitHub facilitates collaboration among different people, allowing multiple developers to propose and merge changes, and manage the project development process through features like Issues and Pull Requests.
3. **Branches and Pull Requests:** Developers can create branches to develop new features or fix issues, then use Pull Requests to submit merge requests for review and integration by repository maintainers. This process allows for peer review and discussion of changes.
4. **GitHub Pages:** This feature enables users to generate static websites from their repositories, suitable for showcasing project documentation, personal resumes, or other static content that needs to be published.
5. **Community Interaction:** GitHub hosts an active and extensive community where developers can interact through watch, comments, and contributions, facilitating knowledge sharing and learning.
6. **Automation and Extension:** With GitHub Actions, workflows like continuous integration and continuous delivery (CI/CD) pipelines can be automated. Additionally, GitHub supports integration with various extensions and third-party services for added functionality.

!!! info "Recommended Reading"

    - [How to Create a GitHub Account?](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github){target="_blank"}
    - [How to Fork a Project?](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo){target="_blank"}
    - [How to Edit Files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files){target="_blank"}
    - [How to Create Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request){target="_blank"}

## Development Environment Installation

### Python

Python is a versatile language that can be used in various fields, including but not limited to web development, data analysis, artificial intelligence, machine learning, automation scripts, scientific computing, and network services. Its extensive standard library and active community support make it easy for developers to find the tools or resources needed to tackle challenges.

Python's design philosophy emphasizes code readability and simplicity, allowing developers to achieve the same functionality with fewer lines of code. This lowers the learning curve and increases development efficiency and maintainability. Python uses indentation to define code blocks, rather than braces or keywords seen in other languages, enhancing code elegance and clarity. Additionally, Python is cross-platform, able to run on Windows, macOS, and Linux without code modification. The interpreted nature of Python allows for line-by-line execution and testing, making it ideal for quick prototyping and testing.

!!! tip "Installation Guide"

    === "Windows"

        1. Download the Installer: [Visit Python's official website](https://www.python.org/){target="_blank"}.
        2. Run the Installer:
            - After downloading, run the installer.
            - In the installation screen, make sure to check "Add Python to PATH" to add Python to the system environment variables.
            - Choose "Customize installation" to view or modify installation options, or simply click "Install Now" for the default setup.
        3. Verify Installation:
            - After installation, open Command Prompt and type `python --version` or `python`. If installed correctly, it should display the Python version number.

    === "macOS"

        1. Install via Homebrew (recommended):
            - Open Terminal.
            - Ensure Homebrew is installed. If not, install Homebrew first.
            - Type `brew install python` to install Python.
        2. Install from the Official Website:
            - Alternatively, download the macOS version from Python's [official website](https://www.python.org/){target="_blank"}.
            - Open the downloaded `.pkg` file and follow the prompts to install.
        3. Verify Installation:
            - Open Terminal and type `python3 --version`.

    === "Linux"

        1. Use the Package Manager (Example: Ubuntu):
           - Open a terminal.
           - Update package lists with: `sudo apt update`
           - Install Python: `sudo apt install python3`
        2. Verify Installation:
           - In terminal, type `python3 --version` to verify the installation.

### uv

[uv](https://docs.astral.sh/uv/){target="_blank"} is a tool specifically designed for managing Python project dependencies. It streamlines package management, allowing developers to easily set up and configure virtual development environments, ensuring that dependencies between projects do not conflict with each other. Additionally, uv offers functionality for packaging and publishing Python packages, making it easier to share and deploy code.

!!! tip "How to Install uv"

    - For installation instructions, please refer to the [official documentation](https://docs.astral.sh/uv/getting-started/installation/)){target="_blank"}.

### VS Code

[Visual Studio Code](https://code.visualstudio.com/){target="_blank"} (commonly abbreviated as VS Code) is a lightweight code editor (IDE) developed by Microsoft. Its standout feature is cross-platform support, allowing it to run on Windows, macOS, and Linux systems. VS Code features a modern user interface and a wealth of functionalities, making it a popular tool among developers. The editor has integrated support for Git, simplifying version control and team collaboration. Moreover, VS Code's extension marketplace is extensive, allowing developers to install various extensions to enhance the editor's capabilities, whether it's adding support for different languages or integrating different development tools or frameworks.

!!! tip "How to Install VS Code"

    - For installation instructions, please refer to the [official documentation](https://code.visualstudio.com/){target="_blank"}.

## Fork a Project

A fork is the process of copying someone else's repository to your account on a distributed version control platform (such as GitHub), mainly used to make changes and experiment individually without affecting the original project. Forking is a common practice in open-source collaboration, allowing developers to explore new ideas or solve problems in a separate repository.

To fork a repository, log into your GitHub account and navigate to the repository you want to fork. Click the "Fork" button in the upper-right corner of the repository page, and GitHub will copy the repository to your account.

After forking, you typically want to create a new branch in this forked repository to make changes without affecting the main branch. First, `git clone` the repository to your local machine. Then, in the command line, navigate to the project folder and use the following command to create and switch to a new branch:

    git checkout -b new-branch-name

While working on the new branch, you can make code modifications. Once done, use the commands below to stage and commit the changes to that branch:

    git add .
    git commit -m "Description of your changes"

These commands will stage and commit your changes to the local Git repository. Then, push the changes back to your branch on the GitHub repository:

    git push origin new-branch-name

Once the changes are pushed to your GitHub repository, you can submit a Pull Request (PR) to propose these changes be merged into the original repository. On your GitHub repository page, you'll see a "Compare & pull request" button. Click it, enter a detailed description of your changes, and then click "Create pull request" to submit your PR. The project maintainers will review the changes and, upon approval, merge them into the mainline.

By forking, creating branches, committing, and submitting PRs, you can effectively participate in open-source projects and contribute your ideas and changes, which is a valuable learning and growth process!

!!! note "About Further Learning and Application"

    - It's recommended to spend some time learning [how to use Git](https://gitbook.tw/){target="_blank"}, as it is quite beneficial for managing code and future document versioning!
    - Python is also a user-friendly programming language worth learning and applying well. Recommended reading: "[Learn PYTHON for Yourself](https://pythonbook.cc/){target="_blank}".
