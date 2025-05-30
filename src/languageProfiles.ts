import * as vscode from 'vscode';

export interface LanguageProfile {
    id: string;
    name: string;
    detection: {
        filePatterns: string[];
        commandChecks?: {
            command: string;
            name: string;
            minVersion?: string;
            installGuideMarkdown: string;
            envVarGuideMarkdown?: string;
            downloadUrl?: string;
        }[];
    };
    vscodeExtensions: string[];
    localInstallCommands?: {
        prompt: string;
        command: string;
        detectionFile: string;
        condition: 'fileExists';
        preCommands?: string[];
    }[];
    workspaceSettings?: { [key: string]: any };
}

// Array containing all defined language profiles
export const languageProfiles: LanguageProfile[] = [
    // --- Python Profile ---
    {
        id: 'python',
        name: 'Python',
        detection: {
            filePatterns: ['**/requirements.txt', '**/*.py', '**/pyproject.toml'],
            commandChecks: [
                {
                    name: 'Python Interpreter',
                    command: 'python3 --version', // Try python3 first
                    minVersion: '3.9.0', // Example: Python 3.9 or newer
                    downloadUrl: 'https://www.python.org/downloads/',
                    installGuideMarkdown: `
# Python Installation Guide

Python is a versatile programming language. To get started, you'll need the Python interpreter installed on your system.

## Option 1: Official Installer (Recommended for Windows/macOS)
1.  Visit the official Python download page: [https://www.python.org/downloads/](https://www.python.org/downloads/)
2.  Download the latest stable version installer for your operating system (e.g., "Python 3.X.X installer").
3.  Run the installer. **Important:** On Windows, ensure you check the box that says "Add Python to PATH" during installation. This allows you to run Python commands from any terminal.

## Option 2: Using a Package Manager (Recommended for Linux/macOS Homebrew users)

### Linux (Debian/Ubuntu-based)
Open your terminal and run:
\`\`\`bash
sudo apt update
sudo apt install python3 python3-pip
\`\`\`

### macOS (Homebrew)
Open your terminal and run:
\`\`\`bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python@3.10 # Or the latest stable version, e.g., python@3.12
\`\`\`

## Verify Installation
After installation, open a **new** terminal (or restart your existing one) and run:
\`\`\`bash
python3 --version
\`\`\`
You should see the Python version number (e.g., \`Python 3.10.x\`). If \`python3\` is not found, try \`python --version\`.

`,
                    envVarGuideMarkdown: `
# Setting Python PATH and Virtual Environment Guide

Typically, Python installation automatically adds it to your system's PATH. If you encounter "command not found" errors, you might need to adjust your PATH.

## Verifying PATH
Open a new terminal and type \`where python\` (Windows) or \`which python3\` (macOS/Linux). This should show the path to your Python executable.

## Setting PATH Manually (if needed)

### Windows:
1.  **Find Python Path:** Locate your Python installation directory (e.g., \`C:\\Users\\YourUser\\AppData\\Local\\Programs\\Python\\Python310\` and its \`Scripts\` subdirectory: \`C:\\Users\\YourUser\\AppData\\Local\\Programs\\Python\\Python310\\Scripts\`).
2.  **Open Environment Variables:** Search for "Environment Variables" in the Windows search bar and select "Edit the system environment variables".
3.  Click "Environment Variables..."
4.  Under "User variables" or "System variables", select "Path" and click "Edit...".
5.  Click "New" and add the paths to your Python installation directory and its \`Scripts\` directory (e.g., \`C:\\Users\\YourUser\\AppData\\Local\\Programs\\Python\\Python310\` and \`C:\\Users\\YourUser\\AppData\\Local\\Programs\\Python\\Python310\\Scripts\`).
6.  Click OK on all windows. Restart any open terminals or VS Code.

### macOS / Linux:
1.  **Find Python Path:** This is usually handled by package managers. If you installed manually, you'd know the path.
2.  **Edit Shell Configuration:** Open your shell's configuration file in your home directory (e.g., \`~/.bashrc\`, \`~/.zshrc\`, \`~/.profile\`).
3.  **Add to PATH:** Add a line like this to the end of the file (adjust path if necessary):
    \`\`\`bash
    export PATH="/usr/local/bin:$PATH" # Common path for Homebrew Python
    \`\`\`
4.  **Apply Changes:** Save the file and then run \`source ~/.bashrc\` (or your specific file) in your terminal.

## Python Virtual Environments
It's highly recommended to use a virtual environment for each Python project to manage dependencies separately. Your extension will offer to create one if it detects a \`requirements.txt\`.
`
                },
                {
                    name: 'pip',
                    command: 'pip3 --version', // Try pip3 first
                    minVersion: '20.0.0', // Example
                    downloadUrl: 'https://pip.pypa.io/en/stable/installation/',
                    installGuideMarkdown: `
# pip Installation Guide

pip is the package installer for Python. It's usually installed automatically with Python 3.9+.

If pip is missing, try reinstalling Python. Alternatively, you can try:

\`\`\`bash
python3 -m ensurepip --upgrade
\`\`\`
`,
                    envVarGuideMarkdown: `# pip PATH Setup
pip executables are usually located in the \`Scripts\` (Windows) or \`bin\` (macOS/Linux) subdirectory of your Python installation, which should be on your PATH if Python is. If not, follow the Python PATH setup guide.
`
                }
            ]
        },
        vscodeExtensions: ['ms-python.python', 'ms-python.vscode-pylance'],
        localInstallCommands: [
            {
                detectionFile: 'requirements.txt',
                prompt: 'Found requirements.txt. Do you want to create a virtual environment (.venv) and install dependencies?',
                command: 'pip install -r requirements.txt',
                preCommands: [
                    'python3 -m venv .venv', // Create venv
                    'source .venv/bin/activate', // Activate venv for Unix/macOS
                    // For Windows, activation is typically done via '.venv\Scripts\activate.bat'
                    // The user will need to manually activate for persistent terminal use,
                    // but 'terminal.sendText()' can execute it for the current command's context.
                ],
                condition: 'fileExists',
            }
        ],
        workspaceSettings: {
            "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
            "python.formatting.provider": "black",
            "python.linting.flake8Enabled": true,
            "editor.formatOnSave": true
        }
    },

    // --- Node.js Profile ---
    {
        id: 'nodejs',
        name: 'Node.js',
        detection: {
            filePatterns: ['**/package.json', '**/*.js', '**/*.ts'],
            commandChecks: [
                {
                    name: 'Node.js Runtime',
                    command: 'node --version',
                    minVersion: '18.0.0', // Example: Node.js 18 or newer (LTS versions are good)
                    downloadUrl: 'https://nodejs.org/en/download/',
                    installGuideMarkdown: `
# Node.js Installation Guide

Node.js is a JavaScript runtime environment.

## Option 1: Official Installer (Recommended)
1.  Visit the official Node.js download page: [https://nodejs.org/en/download/](https://www.nodejs.org/en/download/)
2.  Download the **LTS (Long Term Support)** version installer for your operating system.
3.  Run the installer. It will typically include npm (Node Package Manager).

## Option 2: Using a Version Manager (e.g., nvm)
For more advanced users, a version manager like nvm (Node Version Manager) is recommended.
* **nvm (macOS/Linux):** Follow instructions at [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
    \`\`\`bash
    nvm install --lts
    nvm use --lts
    \`\`\`
* **nvm-windows (Windows):** Follow instructions at [https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)

## Verify Installation
Open a **new** terminal and run:
\`\`\`bash
node --version
npm --version
\`\`\`
You should see the installed versions.
`,
                    envVarGuideMarkdown: `
# Setting Node.js/npm PATH Guide

Node.js and npm typically add themselves to your system's PATH during installation. If you encounter "command not found" errors, you might need to adjust your PATH.

## Verifying PATH
Open a new terminal and type \`where node\` (Windows) or \`which node\` (macOS/Linux). This should show the path to your Node.js executable. Do the same for \`npm\`.

## Setting PATH Manually (if needed)

### Windows:
1.  **Find Node.js Path:** Locate your Node.js installation directory (e.g., \`C:\\Program Files\\nodejs\`).
2.  **Open Environment Variables:** Search for "Environment Variables" in the Windows search bar and select "Edit the system environment variables".
3.  Click "Environment Variables..."
4.  Under "User variables" or "System variables", select "Path" and click "Edit...".
5.  Click "New" and add the path to your Node.js installation directory (e.g., \`C:\\Program Files\\nodejs\`).
6.  Click OK on all windows. Restart any open terminals or VS Code.

### macOS / Linux:
1.  **Find Node.js Path:** Common paths include \`/usr/local/bin\` or \`/opt/homebrew/bin\` if installed via Homebrew. If using \`nvm\`, it manages the PATH automatically.
2.  **Edit Shell Configuration:** Open your shell's configuration file in your home directory (e.g., \`~/.bashrc\`, \`~/.zshrc\`, \`~/.profile\`).
3.  **Add to PATH:** Add a line like this to the end of the file (adjust path if necessary):
    \`\`\`bash
    export PATH="/usr/local/bin:$PATH"
    \`\`\`
4.  **Apply Changes:** Save the file and then run \`source ~/.bashrc\` (or your specific file) in your terminal.
`
                }
            ]
        },
        vscodeExtensions: ['dbaeumer.vscode-eslint', 'esbenp.prettier-vscode', 'ms-vscode.vscode-typescript-next'],
        localInstallCommands: [
            {
                detectionFile: 'package.json',
                prompt: 'Found package.json. Do you want to run npm install to set up project dependencies?',
                command: 'npm install',
                condition: 'fileExists'
            }
        ],
        workspaceSettings: {
            "javascript.updateImportsOnFileMove.enabled": "always",
            "editor.defaultFormatter": "esbenp.prettier-vscode",
            "eslint.enable": true,
            "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"]
        }
    },

    // --- C/C++ Profile ---
    {
        id: 'cpp',
        name: 'C/C++',
        detection: {
            filePatterns: ['**/*.c', '**/*.cpp', '**/*.h', '**/*.hpp', '**/CMakeLists.txt', '**/Makefile'],
            commandChecks: [
                {
                    command: 'gcc --version',
                    name: 'GCC Compiler',
                    minVersion: '9.0.0', // Adjust as needed
                    installGuideMarkdown: `
                ### GCC Installation Guide

                #### Windows:
                You can install GCC (and G++) using:
                * [MinGW-w64](https://www.mingw-w64.org/)
                * [MSYS2](https://www.msys2.org/)
                * A direct distribution like **GCC-Win64 from SourceForge**: [https://sourceforge.net/projects/gcc-win64/](https://sourceforge.net/projects/gcc-win64/)
                Make sure to add GCC to your system's PATH environment variable.

                #### macOS:
                Install Xcode Command Line Tools: \`xcode-select --install\`

                #### Linux (Debian/Ubuntu):
                \`sudo apt update && sudo apt install build-essential\`
                `,
                    downloadUrl: 'https://gcc.gnu.org/install/'
                },
                {
                    command: 'cmake --version',
                    name: 'CMake',
                    minVersion: '3.15.0', // Adjust as needed
                    installGuideMarkdown: `
                ### CMake Installation Guide

                Download and install from the official CMake website. Make sure to add it to your system's PATH.
                `,
                    downloadUrl: 'https://cmake.org/download/'
                },
                {
                    command: 'make --version',
                    name: 'Make',
                    installGuideMarkdown: `
                ### Make Installation Guide

                'make' is typically installed with build tools like Xcode Command Line Tools (macOS), Build Tools for Visual Studio (Windows), or build-essential (Linux).
                `,
                    downloadUrl: ''
                }
            ]
        },
        vscodeExtensions: [
            'ms-vscode.cpptools', // C/C++ extension
            'ms-vscode.cpptools-extension-pack', // C/C++ Extension Pack
            'ms-vscode.cmake-tools', // CMake Tools for VS Code
            'twxs.cmake' // CMake syntax highlighting
        ],
        localInstallCommands: [
            {
                prompt: 'Do you want to run CMake to configure the project (e.g., generate build files)?',
                command: 'cmake -S . -B build', // Example for in-source build setup
                detectionFile: 'CMakeLists.txt',
                condition: 'fileExists',
                preCommands: ['mkdir -p build'] // Create build directory if it doesn't exist (works on Linux/macOS, use 'md build' for pure Windows)
            },
            {
                prompt: 'Do you want to build the project using CMake?',
                command: 'cmake --build build', // Example for building from 'build' directory
                detectionFile: 'CMakeLists.txt',
                condition: 'fileExists'
            }
        ],
        workspaceSettings: {
            "C_Cpp.default.compilerPath": "C:/MinGW/bin/g++.exe", // Example; adjust for user's actual path
            "C_Cpp.errorSquiggles": "Enabled",
            "C_Cpp.intelliSenseEngine": "Tag Parser",
            "cmake.configureOnOpen": true,
            "cmake.buildDirectory": "${workspaceFolder}/build"
        }
    }
];