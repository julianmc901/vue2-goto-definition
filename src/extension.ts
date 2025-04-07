// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Vue2DefinitionProvider } from './Vue2DefinitionProvider'; // Asegurate que el path sea correcto
import { Vue2HoverProvider } from './Vue2HoverProvider'; // o la ruta donde lo pongas



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vue2-goto-definition" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vue2-goto-definition.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vue2-goto-definition!');
	});

	context.subscriptions.push(disposable);

	// Registrar el DefinitionProvider para archivos .vue
	const vueSelector: vscode.DocumentSelector = { language: 'vue', scheme: 'file' };
	const definitionProvider = new Vue2DefinitionProvider();
	const definitionDisposable = vscode.languages.registerDefinitionProvider(vueSelector, definitionProvider);

	context.subscriptions.push(definitionDisposable);

	vscode.languages.registerHoverProvider('vue', new Vue2HoverProvider());
}

// This method is called when your extension is deactivated
export function deactivate() {}
