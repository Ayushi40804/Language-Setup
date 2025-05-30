# Language Setup

This extension, "Language Setup", aims to streamline the initial setup of development environments for various programming languages directly within VS Code. It detects the project's language, checks for necessary tools, suggests relevant VS Code extensions, and can even help with initial dependency installation and recommended workspace settings.

## Features

The "Language Setup" provides a single command to get your project ready:

* **Automatic Language Detection:** Intelligently identifies the programming language(s) used in your workspace (currently supports **Python**, **Node.js**, and **C/C++**).
* **Tool & Runtime Checks:** Verifies the presence and version of essential tools like:
    * **Python:** Python Interpreter (`python3`), pip (`pip3`)
    * **Node.js:** Node.js Runtime (`node`), npm (`npm`)
    * **C/C++:** GCC/G++ Compiler (`gcc`), CMake (`cmake`), Make (`make`)
* **Guided Installation:** For any missing or outdated tools, the extension provides convenient notifications with links to:
    * Detailed installation guides (Markdown in webview).
    * Direct download pages.
    * Environment variable setup guides (if applicable).
* **Recommended VS Code Extensions:** Automatically suggests and prompts you to install crucial VS Code extensions relevant to the detected language, enhancing your development experience.
    * **Python:** `ms-python.python`, `ms-python.vscode-pylance`
    * **Node.js:** `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `ms-vscode.vscode-typescript-next`
    * **C/C++:** `ms-vscode.cpptools`, `ms-vscode.cpptools-extension-pack`, `ms-vscode.cmake-tools`, `twxs.cmake`
* **Local Dependency Installation:** Offers to run common commands to set up project-specific dependencies:
    * **Python:** Prompts to create a virtual environment (`.venv`) and run `pip install -r requirements.txt` if `requirements.txt` is detected.
    * **Node.js:** Prompts to run `npm install` if `package.json` is detected.
    * **C/C++:** Offers to run `cmake -S . -B build` for configuration and `cmake --build build` for building if `CMakeLists.txt` is detected.
* **Automated Workspace Settings:** Applies recommended VS Code workspace settings to `.vscode/settings.json` for a smoother workflow, tailored to the detected language. Examples include:
    * Python interpreter path, formatting provider.
    * JavaScript/TypeScript import settings, default formatter, ESLint validation.
    * C/C++ compiler path hints, IntelliSense engine, CMake build directory.

### How to use:

1.  Open your project folder in VS Code.
2.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3.  Type and select: **`Language Setup: Setup Project Environment`**.
4.  Follow the prompts and notifications.

## Requirements

This extension requires that you have **Node.js** installed globally on your system to run the extension itself.

For the language-specific features, you need to have the respective language runtimes, compilers, and package managers installed on your system's PATH. The extension will guide you if they are missing.

* **Python** (e.g., Python 3.9+, pip)
* **Node.js** (e.g., Node.js 18+, npm)
* **C/C++** (e.g., GCC/G++, CMake, Make)

## Extension Settings

This extension **applies** settings directly to your workspace's `.vscode/settings.json` file. It does not introduce new configurable settings for the extension itself via `contributes.configuration`.

Some examples of settings this extension might add or modify are:

* `python.defaultInterpreterPath`
* `python.formatting.provider`
* `python.linting.flake8Enabled`
* `editor.formatOnSave`
* `javascript.updateImportsOnFileMove.enabled`
* `editor.defaultFormatter`
* `eslint.enable`
* `eslint.validate`
* `C_Cpp.default.compilerPath`
* `C_Cpp.errorSquiggles`
* `C_Cpp.intelliSenseEngine`
* `cmake.configureOnOpen`
* `cmake.buildDirectory`

## Known Issues

Currently, there are no major known issues. If you encounter any problems, please report them on the GitHub repository's issue tracker.

## Release Notes

### 0.0.1 (Initial Release)

* Initial release of Language Setup Helper.
* Includes detection and setup for Python, Node.js, and C/C++ projects.
* Features tool checks, extension recommendations, local dependency prompts, and workspace settings application.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy setting up your environments with ease!**