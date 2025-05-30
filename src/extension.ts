import * as vscode from 'vscode';
import { handleSetupProjectEnvironment } from './setupHandler'; // Make sure this import is correct

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "language-setup" is now active!');

    // Register the command
    let disposable = vscode.commands.registerCommand('language-setup.setupProjectEnvironment', async () => {
        await handleSetupProjectEnvironment(context);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension "language-setup" is deactivated.');
}