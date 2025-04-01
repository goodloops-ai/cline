module.exports = function transform(content) {
	if (content.includes("WORKSPACE_DIR: ")) {
		console.log("Workspace directory injection already applied, skipping.")
		return content
	}

	if (!content.includes('import * as os from "os"')) {
		content = content.replace(/import \* as path from "path"/, 'import * as os from "os"\nimport * as path from "path"')
	}

	// Add the cwd declaration before the private async connectToServer method
	const cwdDeclaration = `\tprivate cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? path.join(os.homedir(), "Desktop")\n\n`
	content = content.replace(/\tprivate async connectToServer\(/, cwdDeclaration + "\tprivate async connectToServer(")

	// Find the transport initialization inside the else block
	const transportEnvRegex =
		/else\s*{\s*transport\s*=\s*new\s*StdioClientTransport\(\{\s*command:\s*config\.command,\s*args:\s*config\.args,\s*env:\s*{\s*\.\.\.config\.env,\s*\.\.\.\(process\.env\.PATH\s*\?\s*{\s*PATH:\s*process\.env\.PATH\s*}\s*:\s*{}\),\s*\/\/\s*\.\.\.\(process\.env\.NODE_PATH/

	// Replace with workspace dir added
	const newEnvBlock = `else {
			transport = new StdioClientTransport({
				command: config.command,
				args: config.args,
				env: {
					...config.env,
					...(process.env.PATH ? { PATH: process.env.PATH } : {}),
					WORKSPACE_DIR: this.cwd,
					// ...(process.env.NODE_PATH`

	const modifiedContent = content.replace(transportEnvRegex, newEnvBlock)

	if (modifiedContent === content) {
		console.warn("Could not properly apply the workspace directory injection.")
	}

	return modifiedContent
}
