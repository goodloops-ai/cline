/**
 * Transform function for src/core/task/index.ts
 * Adds XSON support for MCP arguments parsing
 */
module.exports = function transform(content) {
	// Add import for xson
	if (!content.includes('import { fromXSON } from "../../utils/xson"')) {
		content = content.replace(
			/import \* as path from "path"/,
			'import * as path from "path"\nimport { fromXSON } from "../../utils/xson"',
		)
	}

	// Add XSON parsing logic for MCP arguments
	if (!content.includes("useXsonParser")) {
		// Add config check for useXsonParser
		content = content.replace(
			/let parsedArguments: Record<string, unknown> \| undefined\n\s+if \(mcp_arguments\) {/,
			'let parsedArguments: Record<string, unknown> | undefined\n\t\t\t\t\tif (mcp_arguments) {\n\t\t\t\t\t\tconst useXsonParser = vscode.workspace.getConfiguration("goodloops").get<boolean>("useXsonParser") ?? false',
		)

		// Replace JSON.parse with conditional XSON/JSON parsing
		content = content.replace(
			/try {\n\s+parsedArguments = JSON\.parse\(mcp_arguments\)/,
			"try {\n\t\t\t\t\t\t\tparsedArguments = useXsonParser ? fromXSON(mcp_arguments) : JSON.parse(mcp_arguments)",
		)
	}

	return content
}
