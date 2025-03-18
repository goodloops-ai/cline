/**
 * Transform function for src/services/mcp/McpHub.ts
 * Adds workspace directory (cwd) to the environment variables passed to MCP servers
 */
module.exports = function transform(content) {
	// Check if the transformation has already been applied
	if (content.includes("WORKSPACE_DIR: ")) {
		console.log("Workspace directory injection already applied, skipping.")
		return content
	}

	// Import required modules if not already imported
	if (!content.includes("import * as os from")) {
		// Add os import if not present
		content = content.replace(/import \* as path from "path"/, 'import * as os from "os"\nimport * as path from "path"')
	}

	// Find the StdioClientTransport creation block using a simpler approach
	const transportSection = content.match(
		/const transport = new StdioClientTransport\(\{[\s\S]*?env:[\s\S]*?PATH: process\.env\.PATH[\s\S]*?\}\)/,
	)

	if (!transportSection) {
		console.warn("Could not locate the transport creation code in McpHub.ts.")
		return content
	}

	// Insert workspace directory declaration before the transport creation
	const cwdDeclaration = `// Get workspace directory to pass to MCP servers
	const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? path.join(os.homedir(), "Desktop")

	`

	// First, modify the transport configuration to include WORKSPACE_DIR
	let modifiedContent = content.replace(transportSection[0], (match) => {
		// Find where to insert the WORKSPACE_DIR in the environment variables
		return match.replace(
			/(env: \{[^}]*\.\.\.config\.env,[^}]*\.\.\.(?:\(process\.env\.PATH \? \{ PATH: process\.env\.PATH \} : \{\})[^}]*)(,|\n\s*\})/,
			"$1,\n\t\t\t\tWORKSPACE_DIR: cwd // Automatically injected workspace directory$2",
		)
	})

	// Then, insert the cwd declaration before the transport creation
	modifiedContent = modifiedContent.replace(
		/const transport = new StdioClientTransport/,
		`${cwdDeclaration}const transport = new StdioClientTransport`,
	)

	// If the regex didn't match properly, the content won't change
	if (modifiedContent === content) {
		console.warn("Could not properly apply the workspace directory injection.")
		return content
	}

	return modifiedContent
}
