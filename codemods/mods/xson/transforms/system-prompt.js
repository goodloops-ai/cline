/**
 * Transform function for src/core/prompts/system.ts
 * Adds XSON documentation to the system prompt
 * Uses ts-morph for TypeScript AST manipulation and regex for other changes
 */
const { Project } = require("ts-morph")
const fs = require("fs")
const path = require("path")

module.exports = function transform(content) {
	// Add imports using regex
	if (!content.includes('import * as vscode from "vscode"')) {
		content = content.replace(
			/import \{ BrowserSettings \} from "\.\.\/\.\.\/shared\/BrowserSettings"/,
			'import { BrowserSettings } from "../../shared/BrowserSettings"\nimport * as vscode from "vscode"',
		)
	}

	if (!content.includes('import { XSON_SPEC } from "../../utils/xson"')) {
		content = content.replace(
			/import \{ BrowserSettings \} from "\.\.\/\.\.\/shared\/BrowserSettings"/,
			'import { BrowserSettings } from "../../shared/BrowserSettings"\nimport { XSON_SPEC } from "../../utils/xson"',
		)
	}

	// Use ts-morph for function manipulation
	if (!content.includes("useXsonParser")) {
		// Create a temporary file for ts-morph to work with
		const tempDir = path.join(__dirname, "temp")
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true })
		}
		const tempFilePath = path.join(tempDir, "system.ts")
		fs.writeFileSync(tempFilePath, content)

		// Create a new ts-morph project
		const project = new Project({
			tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
			skipAddingFilesFromTsConfig: true,
		})

		// Add the temporary file to the project
		const sourceFile = project.addSourceFileAtPath(tempFilePath)

		// Find the SYSTEM_PROMPT variable declaration
		const variableDeclaration = sourceFile.getVariableDeclaration("SYSTEM_PROMPT")
		if (variableDeclaration) {
			const arrowFunction = variableDeclaration.getInitializer()
			console.log("arrowFunction", arrowFunction.getKind())
			// Check if it's an arrow function
			if (arrowFunction && arrowFunction.getKind() === 219) {
				// 201 is ArrowFunction
				const functionBody = arrowFunction.getBody()
				console.log("functionBody", functionBody)
				// Check if the body is a template literal (not a block)
				console.log("functionBody.isKind(195)", functionBody.isKind(195), functionBody.getKind())
				if (functionBody && functionBody.getKind() === 228) {
					console.log("functionBody", functionBody)
					// 195 is Block
					// Get the template literal text
					const templateLiteralText = functionBody.getText()

					console.log("templateLiteralText", templateLiteralText)

					// Create a new block with useXsonParser declaration and return statement
					const newBody = `{
	const useXsonParser = vscode.workspace.getConfiguration("cline").get<boolean>("useXsonParser") ?? false

	return ${templateLiteralText}
}`

					// Replace the function body with the new block
					// Use replaceWithText instead of setBody
					arrowFunction.replaceWithText(`async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => ${newBody}`)

					// Get the modified content
					content = sourceFile.getFullText()
				}
			}
		}

		// Clean up the temporary file
		fs.unlinkSync(tempFilePath)
		if (fs.readdirSync(tempDir).length === 0) {
			fs.rmdirSync(tempDir)
		}
	}

	// Use regex for template literal content modifications
	// Add XSON format to use_mcp_tool description
	if (!content.includes("An XSON object containing")) {
		content = content.replace(
			/- arguments: \(required\) (A JSON object|An? .+) containing the tool's input parameters(, following the tool's input schema)?/,
			"- arguments: (required) ${useXsonParser ? \"An XSON object containing the tool's input parameters, following the tool's input schema (see below for xson formatting)\" : \"A JSON object containing the tool's input parameters, following the tool's input schema\"}",
		)
	}

	// Add XSON format example in use_mcp_tool usage
	if (!content.includes('<xson type="object">')) {
		content = content.replace(
			/<arguments>\n(\{[^}]+\})\n<\/arguments>/,
			'<arguments>\n${useXsonParser ? `<xson type="object">\n<param1 type="string"><![CDATA[value1]]></param1>\n<param2 type="string"><![CDATA[value2]]></param2>\n</xson>` : `{\n  "param1": "value1",\n  "param2": "value2"\n}`}\n</arguments>',
		)
	}

	// Add XSON_SPEC documentation
	if (!content.includes("<xson_spec>")) {
		content = content.replace(
			/(\<\/use_mcp_tool\>\n)/,
			'$1\n\n${useXsonParser ? `<xson_spec>\n${XSON_SPEC}\n</xson_spec>\n\n` : ""}',
		)
	}

	return content
}
