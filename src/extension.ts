// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NamingConvention, SupportedDataMembers } from './enums/enums';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "csharpclasstojson" is now active!');

	// The command has been defined in the package.json file
	// The commandId parameter must match the command field in package.json
	let camelCaseDisposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharpCamelCase', () => {
		generateJSONFromClasses(NamingConvention.camelCase, SupportedDataMembers.propertiesAndFields);
	});

	let camelCaseIgnoreFieldsDisposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharpCamelCaseIgnoreFields', () => {
		generateJSONFromClasses(NamingConvention.camelCase, SupportedDataMembers.onlyProperties);
	});

	let camelCaseIgnorePropertiesDisposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharpCamelCaseIgnoreProperties', () => {
		generateJSONFromClasses(NamingConvention.camelCase, SupportedDataMembers.onlyFields);
	});

	let pascalCaseDisposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharpPascalCase', () => {
		generateJSONFromClasses(NamingConvention.PascalCase, SupportedDataMembers.propertiesAndFields);
	});

	let pascalCaseIgnoreFieldsDisposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharpPascalCaseIgnoreFields', () => {
		generateJSONFromClasses(NamingConvention.PascalCase, SupportedDataMembers.onlyProperties);
	});

	let pascalCaseIgnorePropertiesDisposable = vscode.commands.registerCommand('csharpclasstojson.createJsonFromCSharpPascalCaseIgnoreProperties', () => {
		generateJSONFromClasses(NamingConvention.PascalCase, SupportedDataMembers.onlyFields);
	});

	context.subscriptions.push(pascalCaseDisposable);
	context.subscriptions.push(camelCaseDisposable);
	context.subscriptions.push(pascalCaseIgnoreFieldsDisposable);
	context.subscriptions.push(camelCaseIgnoreFieldsDisposable);
}

export function generateJSONFromClasses(namingConvention: NamingConvention, supportFields: SupportedDataMembers) {

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
				const csharpClasses = text.replace(/\n/g, ' ');
				const jsonOutput = generateSampleJSON(csharpClasses, namingConvention, supportFields);

				// Create a new untitled text document and show JSON
				vscode.workspace.openTextDocument({ content: jsonOutput, language: 'json' })
					.then(document => {
						vscode.window.showTextDocument(document);
					});
				vscode.window.showInformationMessage('Output will be visible in new tab!');
			}
			catch (error: any) {
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
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Function to generate sample JSON from C# class
export function generateSampleJSON(csharpClass: string, namingConvention: NamingConvention, supportFields: SupportedDataMembers): string {
	const multiClassRegEx = /class\s+\w+\s*{(?:[^}]*{[^{}]*}|[^{}])*}/g;
	const classesArray = csharpClass.match(multiClassRegEx) as any[];
	let finalJson = "";
	let allClassNamesAndProperties = new Map<string, string>();

	for (let matchingClass of classesArray) {
		console.log(matchingClass);
		const classRegex = /class\s+(\w+)\s*{([\s\S]*)}/;
		const matchingClassStructure = matchingClass.match(classRegex);

		if (!matchingClassStructure || matchingClassStructure.length < 3) {
			throw new Error('Invalid C# class structure');
		}
		const className = matchingClassStructure[1];
		const propertiesText = matchingClassStructure[2].trim().replace(/\r/g, ' ');
		allClassNamesAndProperties.set(className, propertiesText);
	}

	for (let classNameAndProperties of allClassNamesAndProperties) {
		console.log(classNameAndProperties);
		let outputJSON = generateSampleJSONFromAClass(classNameAndProperties, namingConvention, allClassNamesAndProperties, supportFields);
		console.log(outputJSON);
		finalJson = (finalJson && finalJson + '\r\n\r\n') + `//${classNameAndProperties[0]}\r\n` + outputJSON;
	}
	return finalJson;
}

export function generateSampleJSONFromAClass(matchingClass: [string, string], namingConvention: NamingConvention,
	allClassNamesAndProperties: Map<string, string>, supportedDataMembers: SupportedDataMembers): string {

	if (!matchingClass[1] || matchingClass[1].length < 3) {
		throw new Error('Invalid C# class structure');
	}

	const className = matchingClass[0];

	// Parse class properties
	// const propertyAndFieldsRegex = /(\w+)\s+(\w+)\s*({[^}]*}|;)/g;
	const nonGenericFieldRegex = /\b(\w+)\s+(\w+)\b\s*;/g;
	const genericFieldRegex = /\b(\w+)\s*(?:<\s*(\w+)(?:\s*,\s*(\w+))?\s*>)\s+(\w+)\s*;/g;
	const nonGenericPropertyRegex = /(\w+)\s+(\w+)\s*{[^}]*}/g;
	const genericPropertyRegex = /(\w+)\s*<\s*(\w+)(?:\s*,\s*(\w+))?\s*>\s+(\w+)\s*{[^}]*}/g;
	// const propertiesMatch = supportedDataMembers === SupportedDataMembers.onlyFields ? matchingClass[1].match(genericFieldDiRegex) : matchingClass[1].match(genericPropertyDiRegex);

	let matchNonGenericFields: RegExpMatchArray | null = null;
	let matchGenericFields: RegExpMatchArray | null = null;
	let matchNonGenericProperties: RegExpMatchArray | null = null;
	let matchGenericProperties: RegExpMatchArray | null = null;
	let matchedPropertiesAndFields: { value: string, type: string }[] = [];

	switch (supportedDataMembers) {
		case SupportedDataMembers.onlyFields:
			matchNonGenericFields = matchingClass[1].match(nonGenericFieldRegex);
			matchGenericFields = matchingClass[1].match(genericFieldRegex);
			break;
		case SupportedDataMembers.onlyProperties:
			matchNonGenericProperties = matchingClass[1].match(nonGenericPropertyRegex);
			matchGenericProperties = matchingClass[1].match(genericPropertyRegex);
			break;
		case SupportedDataMembers.propertiesAndFields:
			matchNonGenericFields = matchingClass[1].match(nonGenericFieldRegex);
			matchGenericFields = matchingClass[1].match(genericFieldRegex);
			matchNonGenericProperties = matchingClass[1].match(nonGenericPropertyRegex);
			matchGenericProperties = matchingClass[1].match(genericPropertyRegex);
			break;
		default:
			break;
	}

	if (matchNonGenericFields || matchGenericFields || matchNonGenericProperties || matchGenericProperties) {
		if (matchNonGenericFields)
			matchedPropertiesAndFields = matchNonGenericFields.map((a) => ({ value: a, type: "NonGenericField" }));

		if (matchGenericFields)
			matchedPropertiesAndFields = matchedPropertiesAndFields.concat(matchGenericFields.map((a) => ({ value: a, type: "GenericField" })));

		if (matchNonGenericProperties)
			matchedPropertiesAndFields = matchedPropertiesAndFields.concat(matchNonGenericProperties.map((a) => ({ value: a, type: "NonGenericProperty" })));

		if (matchGenericProperties)
			matchedPropertiesAndFields = matchedPropertiesAndFields.concat(matchGenericProperties.map((a) => ({ value: a, type: "GenericProperty" })));
	}

	if (!matchedPropertiesAndFields) {
		console.error(`No properties found in C# class - ${className}`);
		return JSON.stringify({});
	}

	const outputObject: { [key: string]: any } = {};
	matchedPropertiesAndFields.forEach((propertyMatch) => {
		let type = '', genericSubType = '', finalName;
		switch (propertyMatch.type) {
			case "NonGenericField":
				[, type, finalName] = propertyMatch.value.match(/\s*(\w+)\s+(\w+)/) || [];
				break;
			case "GenericField":
				[, type, genericSubType, finalName] = propertyMatch.value.match(/\b(\w+)\s*(?:(<[^>]+>)?)\s+(\w+)\s*;/) || [];
				break;
			case "NonGenericProperty":
				[, type, finalName] = propertyMatch.value.match(/\s*(\w+)\s+(\w+)/) || [];
				break;
			case "GenericProperty":
				[, type, genericSubType, finalName] = propertyMatch.value.match(/\b(\w+)(<[^>]+>)\s+(\w+)\s*{[^}]*\s*;/) || [];
				break;
			default:
				break;
		}

		if (type && type !== "return" && genericSubType != null && genericSubType != undefined && finalName) {
			const propName = namingConvention === NamingConvention.PascalCase ? finalName : (finalName[0].toLowerCase() + finalName.substring(1));
			outputObject[propName] = generateSampleValue(type, genericSubType, namingConvention, allClassNamesAndProperties, supportedDataMembers);
		}
	});

	// Generate JSON from properties
	// const sampleJSON = JSON.stringify({ [className]: properties }, null, 4);
	const outputJSON = JSON.stringify(outputObject, null, 4);
	return outputJSON;
}

// Function to generate sample value based on C# type
export function generateSampleValue(type: string, genericSubType: string, namingConvention: NamingConvention,
	allClassNamesAndProperties: Map<string, string>, supportedDataMembers: SupportedDataMembers): any {
	switch (type) {
		case "bool":
			return false;
		case "byte":
		case "sbyte":
		case "short":
		case "ushort":
		case "int":
		case "uint":
		case "long":
		case "ulong":
		case "float":
		case "double":
		case "decimal":
			return 0;
		case "char":
			return '\0';
		case "string":
			return "Sample String";
		case "Point":
			if (namingConvention === NamingConvention.PascalCase)
				return { X: 0, Y: 0 };
			else
				return { x: 0, y: 0 };
		case "Rectangle":
			if (namingConvention === NamingConvention.PascalCase)
				return { X: 0, Y: 0, Width: 0, Height: 0 };
			else
				return { x: 0, y: 0, width: 0, height: 0 };
		case "Size":
			if (namingConvention === NamingConvention.PascalCase)
				return { Width: 0, Height: 0 };
			else
				return { width: 0, height: 0 };
		case "DateTime":
			return new Date(0);
		case "TimeSpan":
			if (namingConvention === NamingConvention.PascalCase)
				return { Hours: 0, Minutes: 0, Seconds: 0, Milliseconds: 0 };
			else
				return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
		case "Guid":
			return "00000000-0000-0000-0000-000000000000";
		case "Color":
			if (namingConvention === NamingConvention.PascalCase)
				return { A: 0, R: 0, G: 0, B: 0 };
			else
				return { a: 0, r: 0, g: 0, b: 0 };
		case "KeyValuePair":
			if (namingConvention === NamingConvention.PascalCase)
				return { Key: null, Value: null };
			else
				return { key: null, value: null };
		case "Nullable":
			return null;
		default: {
			if (type === "List") {
				const result = getComplexTypeSampleData(genericSubType.replace("<", "").replace(">", ""), namingConvention, allClassNamesAndProperties, supportedDataMembers);
				return [result];
			}
			else if (type === "Dictionary") {
				const finalGenericSubType = genericSubType.replace("<", "").replace(">", "").split(",");
				const keyType = finalGenericSubType[0].trim();
				const valueType = finalGenericSubType[1].trim();
				const keyResult = getComplexTypeSampleData(keyType, namingConvention, allClassNamesAndProperties, supportedDataMembers);
				const valueResult = getComplexTypeSampleData(valueType, namingConvention, allClassNamesAndProperties, supportedDataMembers);
				return { [keyResult]: valueResult };
			}
			else if (allClassNamesAndProperties.has(type)) {
				return getComplexTypeSampleData(type, namingConvention, allClassNamesAndProperties, supportedDataMembers);
			}
			return null; // Default for unsupported types
		}
	}
}

function getComplexTypeSampleData(type: string, namingConvention: NamingConvention, allClassNamesAndProperties: Map<string, string>,
	supportedDataMembers: SupportedDataMembers) {
	if (allClassNamesAndProperties.has(type)) {
		const matchingClassStructure = allClassNamesAndProperties.get(type) || '';

		const nestedOutput = generateSampleJSONFromAClass([type, matchingClassStructure], namingConvention, allClassNamesAndProperties, supportedDataMembers);
		return JSON.parse(nestedOutput);
	}
	else {
		return generateSampleValue(type, '', namingConvention, allClassNamesAndProperties, supportedDataMembers);
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