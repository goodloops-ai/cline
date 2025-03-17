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

	// Define the patterns to match
	const transportCreationRegex =
		/(const transport = new StdioClientTransport\(\{\s*command: config\.command,\s*args: config\.args,\s*env: \{[^}]*\.\.\.config\.env,\s*\.\.\.(?:\(process\.env\.PATH \? \{ PATH: process\.env\.PATH \} : \{\}).*?),)/s

	// Replace with both the cwd declaration and the modified transport creation
	const modifiedContent = content.replace(transportCreationRegex, (match) => {
		// Insert the cwd declaration before the transport creation
		const cwdDeclaration = `// Get workspace directory to pass to MCP servers
		const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? path.join(os.homedir(), "Desktop")

		${match}`

		// Add WORKSPACE_DIR to the environment variables
		return cwdDeclaration.replace(
			/(\.\.\.(?:\(process\.env\.PATH \? \{ PATH: process\.env\.PATH \} : \{\}).*?),)/s,
			"$1\n\t\t\t\tWORKSPACE_DIR: cwd, // Automatically injected workspace directory",
		)
	})

	// If the regex didn't match, return the original content and log a warning
	if (modifiedContent === content) {
		console.warn("Could not locate the transport creation code in McpHub.ts.")
		return content
	}

	return modifiedContent
}
