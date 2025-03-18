module.exports = function transform(content) {
	if (content.includes("WORKSPACE_DIR: ")) {
		console.log("Workspace directory injection already applied, skipping.")
		return content
	}

	if (!content.includes('import * as os from "os"')) {
		content = content.replace(/import \* as path from "path"/, 'import * as os from "os"\nimport * as path from "path"')
	}

	const transportRegex =
		/const transport = new StdioClientTransport\(\{\s*command: config\.command,[\s\S]*?stderr: "pipe", \/\/ necessary for stderr to be available\s*\}\)/

	const cwdDeclaration = `const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? path.join(os.homedir(), "Desktop")\n\n`

	const newTransportBlock = `${cwdDeclaration}const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: {
      ...config.env,
      ...(process.env.PATH ? { PATH: process.env.PATH } : {}),
      WORKSPACE_DIR: cwd,
      // ...(process.env.NODE_PATH ? { NODE_PATH: process.env.NODE_PATH } : {}),
    },
    stderr: "pipe", // necessary for stderr to be available
  })`

	const modifiedContent = content.replace(transportRegex, newTransportBlock)

	if (modifiedContent === content) {
		console.warn("Could not properly apply the workspace directory injection.")
	}

	return modifiedContent
}
