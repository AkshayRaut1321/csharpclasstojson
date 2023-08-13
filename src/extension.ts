// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
			if (text) {
				try {
					// Test the function with your sample properties
					// const input1 = "int Age { get; set; }";
					// const input2 = "int id      { get;       set;";
					// const parsedObject1 = parsePropertyDeclaration(input1);
					// const parsedObject2 = parsePropertyDeclaration(input2);
					// console.log(parsedObject1);
					// console.log(parsedObject2);

					// Parse the C# class structure and generate JSON
					const csharpClass = text.replace(/\n/g, ' ');
					const jsonOutput = generateSampleJSON(csharpClass);

					// Create a new untitled text document and show JSON
					vscode.workspace.openTextDocument({ content: jsonOutput, language: 'json' })
						.then(document => {
							vscode.window.showTextDocument(document);
						});
					vscode.window.showInformationMessage('Output will be visible in new tab!');
				} catch (error: any) {
					vscode.window.showErrorMessage('Error generating JSON: ' + error);
				}
			}
			else {
				vscode.window.showErrorMessage('Document is empty!');
			}
		}
		else {
			vscode.window.showErrorMessage('VS Code text editor is unavailable!');
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Function to generate sample JSON from C# class
export function generateSampleJSON(csharpClass: string): string {
	// Parse the C# class structure
	const classRegex = /class\s+(\w+)\s*{([\s\S]*)}/;
	const match = csharpClass.match(classRegex);

	if (!match || match.length < 3) {
		throw new Error('Invalid C# class structure');
	}

	const className = match[1];
	const propertiesText = match[2].trim().replace(/\r/g, ' ');

	// Parse class properties
	const propertyRegex = /(\w+)\s+(\w+)\s*{[^}]*}/g;
	const propertiesMatch = propertiesText.match(propertyRegex);

	if (!propertiesMatch) {
		throw new Error('No properties found in C# class');
	}

	const outputObject: { [key: string]: any } = {};
	propertiesMatch.forEach(propertyMatch => {
		const [, type, name] = propertyMatch.match(/\s*(\w+)\s+(\w+)/) || [];
		if (type && name) {
			outputObject[name] = generateSampleValue(type);
		}
	});

	// Generate JSON from properties
	// const sampleJSON = JSON.stringify({ [className]: properties }, null, 4);
	const outputJSON = JSON.stringify(outputObject, null, 4);
	return `//${className}\r\n` + outputJSON;
}

// Function to generate sample value based on C# type
export function generateSampleValue(type: string): any {
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


function parsePropertyDeclaration(input: string): any {
	// Define a regex pattern to match the beginning of a property declaration
	const pattern = /^\s*(\w+)\s+(\w+)\s*{/;

	// Check if the input matches the pattern
	const match = input.match(pattern);

	if (match) {
		const propertyName = match[1];
		const dataType = match[2];
		let defaultValue: any;

		switch (dataType.toLowerCase()) {
			case 'string':
				defaultValue = '';
				break;
			case 'number':
				defaultValue = 0;
				break;
			case 'boolean':
				defaultValue = false;
				break;
			// Add more cases for other data types if needed
			default:
				defaultValue = null; // Default value for unknown data type
		}

		const propertyObject = {
			[propertyName]: defaultValue
		};

		return propertyObject;
	}

	return null; // Not a valid property declaration
}