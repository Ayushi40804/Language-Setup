// src/setupHandler.ts
import * as vscode from 'vscode';
import { LanguageProfile, languageProfiles } from './languageProfiles'; // Import language profiles
import * as path from 'path'; 

// Helper to check if a command exists and meets a minimum version
async function checkCommand(command: string, minVersion?: string): Promise<{ exists: boolean; version?: string; meetsMinVersion?: boolean }> {
    try {
        const result = await vscode.commands.executeCommand('vscode.runTerminalCommand', {
            command: command,
            args: [],
            cwd: vscode.workspace.rootPath || process.cwd(),
            shell: true, // Execute as a shell command
            terminal: vscode.window.createTerminal({ name: 'Version Check', hideFromUser: true })
        });

        const output = String(result || '').trim();
        const versionMatch = output.match(/(\d+\.\d+\.\d+)/); // Basic version regex (e.g., 3.9.0)

        if (versionMatch) {
            const version = versionMatch[1];
            if (minVersion) {
                const meetsMinVersion = compareVersions(version, minVersion);
                return { exists: true, version, meetsMinVersion };
            }
            return { exists: true, version };
        }
        return { exists: false };
    } catch (e) {
        return { exists: false };
    }
}

// Simple version comparison (e.g., "3.10.1" vs "3.9.0")
function compareVersions(v1: string, v2: string): boolean {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;

        if (p1 > p2) {
            return true;
        }
        if (p1 < p2) {
            return false;
        }
    }
    return true; // Versions are equal or v1 is higher
}

async function installRecommendedExtensions(extensions: string[]): Promise<void> {
    const installedExtensions = vscode.extensions.all.map(ext => ext.id);
    const toInstall = extensions.filter(extId => !installedExtensions.includes(extId));

    if (toInstall.length > 0) {
        const installConfirmed = await vscode.window.showInformationMessage(
            `Recommended extensions for this project: ${toInstall.join(', ')}. Do you want to install them?`,
            { modal: true },
            'Install'
        );

        if (installConfirmed === 'Install') {
            await vscode.commands.executeCommand('workbench.extensions.installExtension', ...toInstall);
            vscode.window.showInformationMessage('Installing recommended extensions...');
        }
    } else {
        vscode.window.showInformationMessage('All recommended extensions are already installed.');
    }
}

async function checkAndInstallTools(profile: LanguageProfile): Promise<boolean> {
    let allToolsAvailable = true;

    // Add this 'if' condition to check if commandChecks exists
    if (profile.detection.commandChecks) {
        for (const check of profile.detection.commandChecks) {
            const { exists, version, meetsMinVersion } = await checkCommand(check.command, check.minVersion);

            if (!exists) {
                allToolsAvailable = false;
                const userChoice = await vscode.window.showWarningMessage(
                    `${check.name || check.command.split(' ')[0]} not found. Please install it.`,
                    { modal: true },
                    'Show Install Guide',
                    'Download Page',
                    'Dismiss'
                );
                if (userChoice === 'Show Install Guide') {
                    const panel = vscode.window.createWebviewPanel(
                        'installGuide',
                        `${check.name || check.command.split(' ')[0]} Installation Guide`,
                        vscode.ViewColumn.One,
                        {}
                    );
                    panel.webview.html = `
                        <!DOCTYPE html>
                        <html>
                        <body>
                            ${check.installGuideMarkdown}
                            ${check.envVarGuideMarkdown ? `<br><br>${check.envVarGuideMarkdown}` : ''}
                        </body>
                        </html>
                    `;
                } else if (userChoice === 'Download Page' && check.downloadUrl) {
                    vscode.env.openExternal(vscode.Uri.parse(check.downloadUrl));
                }
            } else if (check.minVersion && !meetsMinVersion) {
                allToolsAvailable = false;
                const userChoice = await vscode.window.showWarningMessage(
                    `${check.name || check.command.split(' ')[0]} version ${version} found, but minimum required is ${check.minVersion}. Please upgrade.`,
                    { modal: true },
                    'Show Install Guide',
                    'Download Page',
                    'Dismiss'
                );
                if (userChoice === 'Show Install Guide') {
                    const panel = vscode.window.createWebviewPanel(
                        'installGuide',
                        `${check.name || check.command.split(' ')[0]} Upgrade Guide`,
                        vscode.ViewColumn.One,
                        {}
                    );
                    panel.webview.html = `
                        <!DOCTYPE html>
                        <html>
                        <body>
                            ${check.installGuideMarkdown}
                            ${check.envVarGuideMarkdown ? `<br><br>${check.envVarGuideMarkdown}` : ''}
                        </body>
                        </html>
                    `;
                } else if (userChoice === 'Download Page' && check.downloadUrl) {
                    vscode.env.openExternal(vscode.Uri.parse(check.downloadUrl));
                }
            } else {
                vscode.window.showInformationMessage(`${check.name || check.command.split(' ')[0]} found (version: ${version || 'N/A'}).`);
            }
        }
    } // End of the 'if (profile.detection.commandChecks)' block
    return allToolsAvailable;
}

async function installLocalDependencies(profile: LanguageProfile): Promise<void> {
    if (!vscode.workspace.workspaceFolders || profile.localInstallCommands?.length === 0) {
        return;
    }

    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    for (const cmdConfig of profile.localInstallCommands || []) {
        let shouldRun = false;
        if (cmdConfig.condition === 'fileExists') {
            const filePath = vscode.Uri.file(path.join(workspacePath, cmdConfig.detectionFile));
            try {
                await vscode.workspace.fs.stat(filePath);
                shouldRun = true;
            } catch (e) {
                // File does not exist
            }
        } else {
            // No specific condition, or condition not recognized, so assume true
            shouldRun = true;
        }

        if (shouldRun) {
            const confirmed = await vscode.window.showInformationMessage(
                cmdConfig.prompt,
                { modal: true },
                'Yes',
                'No'
            );

            if (confirmed === 'Yes') {
                const terminal = vscode.window.createTerminal({
                    name: `${profile.name} Local Setup`,
                    cwd: workspacePath
                });
                terminal.show();

                if (cmdConfig.preCommands && cmdConfig.preCommands.length > 0) {
                    for (const preCmd of cmdConfig.preCommands) {
                        terminal.sendText(preCmd);
                    }
                }
                terminal.sendText(cmdConfig.command);
                terminal.sendText('\n'); // Ensure command executes
            }
        }
    }
}

async function applyWorkspaceSettings(profile: LanguageProfile): Promise<void> {
    if (!vscode.workspace.workspaceFolders || !profile.workspaceSettings) {
        return;
    }

    const settingsConfirmed = await vscode.window.showInformationMessage(
        `Do you want to apply recommended workspace settings for ${profile.name}? This will update .vscode/settings.json.`,
        { modal: true },
        'Yes',
        'No'
    );

    if (settingsConfirmed === 'Yes') {
        const workspaceSettingsPath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.vscode', 'settings.json');
        let currentSettings: { [key: string]: any } = {};

        try {
            const existingContent = await vscode.workspace.fs.readFile(workspaceSettingsPath);
            currentSettings = JSON.parse(existingContent.toString());
        } catch (e) {
            // File might not exist, start with empty settings
        }

        const newSettings = { ...currentSettings, ...profile.workspaceSettings };
        await vscode.workspace.fs.writeFile(workspaceSettingsPath, Buffer.from(JSON.stringify(newSettings, null, 4)));

        vscode.window.showInformationMessage(`Applied recommended workspace settings for ${profile.name}.`);
    }
}


export async function handleSetupProjectEnvironment(context: vscode.ExtensionContext) {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('Please open a project folder to set up the environment.');
        return;
    }

    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let detectedProfile: LanguageProfile | undefined;

    // Detect language based on file patterns
    for (const profile of languageProfiles) {
        let detected = false;
        for (const pattern of profile.detection.filePatterns) {
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1); // Limit to 1 for efficiency
            if (files.length > 0) {
                detected = true;
                break;
            }
        }
        if (detected) {
            detectedProfile = profile;
            break;
        }
    }

    if (!detectedProfile) {
        vscode.window.showInformationMessage('No specific language/framework profile detected for this project.');
        return;
    }

    vscode.window.showInformationMessage(`Detected ${detectedProfile.name} project. Starting setup...`);

    // Step 1: Install recommended VS Code extensions
    await installRecommendedExtensions(detectedProfile.vscodeExtensions);

    // Step 2: Check and install system-level tools
    const toolsReady = await checkAndInstallTools(detectedProfile);
    if (!toolsReady) {
        vscode.window.showWarningMessage('Some required system tools are not available. Please install them manually then re-run the setup.');
        // Optionally, you might decide to stop here or continue
        // return; // Uncomment to stop if tools are not ready
    }

    // Step 3: Install local dependencies
    await installLocalDependencies(detectedProfile);

    // Step 4: Apply workspace settings
    await applyWorkspaceSettings(detectedProfile);

    vscode.window.showInformationMessage(`${detectedProfile.name} project setup complete!`);
}