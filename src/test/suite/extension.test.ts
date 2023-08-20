import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { activate, generateSampleJSON } from '../../extension';
import { NamingConvention, SupportFields } from '../../enums/enums';

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

		assert.ok((await vscode.commands.getCommands(true)).includes('csharpclasstojson.createJsonFromCSharpCamelCase'));

		assert.ok((await vscode.commands.getCommands(true)).includes('csharpclasstojson.createJsonFromCSharpPascalCase'));
	});

	//Test cases for Pascal case:
	test('PascalCase - Generate JSON from C# Class - include fields - Multi property inline declaration', () => {
		const className = 'Person';
		const csharpClass = `
		  class ${className} {
			  string FirstName { get; set; }
			  string LastName { get; set; }
			  int Age { get; set; }
		  }`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ FirstName: "Sample String", LastName: "Sample String", Age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate JSON from C# Class - include fields - single property inline declaration', () => {
		const className = 'AutoPropertyExample';
		const csharpClass = `
			public class ${className}
			{
				public int Age { get; set; } // Auto-implemented property
			}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ Age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate JSON from C# Class - property with backing field', () => {
		const className = 'ExplicitPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			private int _age; // Backing field
		
			public int Age
			{
				get { return _age; }
				set { _age = value; }
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ Age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.ignoreFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate Sample JSON from C# Class - include fields - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			private string _name; // Backing field
		
			public string Name
			{
				get { return _name; }
			}
		
			public ReadOnlyPropertyExample(string name)
			{
				_name = name;
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ _name: "Sample String", Name: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate Sample JSON from C# Class - ignore fields - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			private string _name; // Backing field
		
			public string Name
			{
				get { return _name; }
			}
		
			public ReadOnlyPropertyExample(string name)
			{
				_name = name;
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ Name: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.ignoreFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate Sample JSON from C# Class - ignore fields - getter and curly braces on new line - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			int PhoneNo;

			string _email;
		
			string Email
			{
				get{
					return _email;
				}
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ Email: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.ignoreFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate Sample JSON from C# Class - include fields - getter and curly braces on new line - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			int PhoneNo;

			string _email;
		
			string Email
			{
				get{
					return _email;
				}
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ PhoneNo: 0, _email: "Sample String", Email: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('PascalCase - Generate Sample JSON from multiple C# Class - include fields - getter and curly braces on new line - readonly property', () => {
		const parentClassName = 'parentClassName';
		const nestedClass1Name = 'nestedClass1Name';
		const csharpClass = `
		class ${parentClassName}
		{
			int id
			{ get; 
			set; };

			string Name {get;set;}

			${nestedClass1Name} ${nestedClass1Name} {get;set;}
		}

		class ${nestedClass1Name}
		{
			string City {get;set;};

			string Name {get;set;}
		}`;

		const nestedClass1Obj = {
			City: "Sample String",
			Name: "Sample String"
		};

		const parentClassObj = {
			id: 0,
			Name: "Sample String",
			[nestedClass1Name]: nestedClass1Obj
		};

		const nestedClass1JSON = `//${nestedClass1Name}\r\n${JSON.stringify(nestedClass1Obj, null, 4)}`;

		const expectedJSON = `//${parentClassName}\r\n${JSON.stringify(parentClassObj, null, 4)}\r\n\r\n${nestedClass1JSON}`;

		console.log('This is expected:', expectedJSON);

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.PascalCase, SupportFields.includeFields);

		console.log('This is generated:', generatedJSON);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	//Test cases for camelCase:
	test('camelCase - Generate JSON from C# Class - include fields - Multi property inline declaration', () => {
		const className = 'Person';
		const csharpClass = `
		  class ${className} {
			  string FirstName { get; set; }
			  string LastName { get; set; }
			  int Age { get; set; }
		  }`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ firstName: "Sample String", lastName: "Sample String", age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('camelCase - Generate JSON from C# Class - include fields - single property inline declaration', () => {
		const className = 'AutoPropertyExample';
		const csharpClass = `
			public class ${className}
			{
				public int Age { get; set; } // Auto-implemented property
			}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('camelCase - Generate JSON from C# Class - property with backing field', () => {
		const className = 'ExplicitPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			private int _age; // Backing field
		
			public int Age
			{
				get { return _age; }
				set { _age = value; }
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ age: 0 }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.ignoreFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('camelCase - Generate Sample JSON from C# Class - include fields - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			private string _name; // Backing field
		
			public string Name
			{
				get { return _name; }
			}
		
			public ReadOnlyPropertyExample(string name)
			{
				_name = name;
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ _name: "Sample String", name: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('camelCase - Generate Sample JSON from C# Class - ignore fields - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			private string _name; // Backing field
		
			public string Name
			{
				get { return _name; }
			}
		
			public ReadOnlyPropertyExample(string name)
			{
				_name = name;
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ name: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.ignoreFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('camelCase - Generate Sample JSON from C# Class - ignore fields - getter and curly braces on new line - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			int PhoneNo;

			string _email;
		
			string Email
			{
				get{
					return _email;
				}
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ email: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.ignoreFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});

	test('camelCase - Generate Sample JSON from C# Class - include fields - getter and curly braces on new line - readonly property', () => {
		const className = 'ReadOnlyPropertyExample';
		const csharpClass = `
		public class ${className}
		{
			int PhoneNo;

			string _email;
		
			string Email
			{
				get{
					return _email;
				}
			}
		}`;

		const expectedJSON = `//${className}\r\n${JSON.stringify({ phoneNo: 0, _email: "Sample String", email: "Sample String" }, null, 4)}`;

		const generatedJSON = generateSampleJSON(csharpClass, NamingConvention.camelCase, SupportFields.includeFields);
		assert.strictEqual(generatedJSON, expectedJSON);
	});
});