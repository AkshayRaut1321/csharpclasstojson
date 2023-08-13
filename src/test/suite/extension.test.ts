import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { activate, generateSampleJSON } from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension Activation', async () => {
		const context: vscode.ExtensionContext = {
			subscriptions: [],
			workspaceState: {
				get: (key: string) => ({} as any),
				update: (key: string, value: any) => ({} as any),
				keys: () => []
			},
			globalState: {
				get: () => ({} as any),
				update: () => ({} as any),
				keys: () => [],
				setKeysForSync: (keys: string[]) => ({} as any)
			},
			extensionPath: '',
			storagePath: '',
			logPath: '',
			asAbsolutePath: (relativePath: string) => '',
			secrets: ({} as any),
			extensionUri: ({} as any),
			storageUri: ({} as any),
			globalStorageUri: ({} as any),
			globalStoragePath: ({} as any),
			logUri: ({} as any),
			extensionMode: ({} as any),
			extension: ({} as any),
			environmentVariableCollection: ({} as any)
		};

		await activate(context);

		assert.ok((await vscode.commands.getCommands(true)).includes('csharpclasstojson.createJsonFromCSharp'));
	});

	test('Generate Sample JSON from C# Class', () => {
		const csharpClass = `
		  class Person {
			  string FirstName { get; set; }
			  string LastName { get; set; }
			  int Age { get; set; }
		  }`;

		const expectedJSON = `//Person\r\n${JSON.stringify({ FirstName: "Sample String", LastName: "Sample String", Age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass);
		assert.strictEqual(generatedJSON, expectedJSON);
	});
});
