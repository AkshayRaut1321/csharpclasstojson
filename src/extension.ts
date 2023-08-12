// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "csharpclasstojson" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharp', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let text = editor.document.getText();
			let finalJSON = generateSampleJSON(text);
		}
		vscode.window.showInformationMessage('Output will be visible in new tab!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Function to generate sample JSON from C# class
// Function to generate sample JSON from C# class
function generateSampleJSON(csharpClass: string): string {
    // Parse the C# class structure
    const classRegex = /class\s+(\w+)\s*{([^}]*)}/;
    const match = csharpClass.match(classRegex);

    if (!match) {
        throw new Error('Invalid C# class structure');
    }

    const className = match[1];
    const propertiesText = match[2].trim();

    // Parse class properties
    const propertyRegex = /\s*(\w+)\s+(\w+)\s*{.*?get;\s*set;\s*}/g;
    const propertiesMatch = propertiesText.match(propertyRegex);

    if (!propertiesMatch) {
        throw new Error('No properties found in C# class');
    }

    const properties: { [key: string]: any } = {};
    propertiesMatch.forEach(propertyMatch => {
        const [, type, name] = propertyMatch.match(/\s*(\w+)\s+(\w+)/);
        properties[name] = generateSampleValue(type);
    });

    // Generate JSON from properties
    const sampleJSON = JSON.stringify({ [className]: properties }, null, 4);
    return sampleJSON;
}

// Function to generate sample value based on C# type
function generateSampleValue(type: string): any {
    switch (type) {
        case 'string':
            return 'Sample String';
        case 'int':
        case 'double':
        case 'float':
        case 'decimal':
            return 0;
        case 'bool':
            return false;
        default:
            return null;
    }
}
