/**
 * Transform function for src/extension.ts
 * Adds bundled plugins setup to extension activation
 */
module.exports = function transform(content) {
	// Add imports for bundledPlugins, simple-git, and exec
	let modified = content.replace(
		'import "./utils/path"',
		'import "./utils/path"\nimport { bundledPlugins } from "./bundledPlugins"\nimport simpleGit from "simple-git"\nimport { exec } from "child_process"',
	)

	// Add setupBundledPlugins function before the activate function
	const setupFunction = `
async function setupBundledPlugins(context: vscode.ExtensionContext) {
let pluginsDir = ""
let mcpConfigPath = ""
try {
	pluginsDir = path.join(context.globalStorageUri.fsPath, "plugins")
	await fs.mkdir(pluginsDir, { recursive: true })

	// Setup git
	const git = simpleGit()

	// Clone/update plugins
	for (const plugin of bundledPlugins) {
		const pluginPath = path.join(pluginsDir, plugin.name)
		const pluginExists = await fs.stat(pluginPath).then(() => true).catch(() => false)

		try {
			if (!pluginExists) {
				// Clone the plugin repository
				await git.clone(plugin.githubUrl, pluginPath)
				Logger.log(\`Cloned plugin: \${plugin.name}\`)
			} else {
				// Update existing plugin repository
				await git.cwd(pluginPath).pull("origin", "main")
				Logger.log(\`Updated plugin: \${plugin.name}\`)
			}

			// Run npm install
			await new Promise<void>((resolve, reject) => {
				exec("npm install && npm link", { cwd: pluginPath }, (error) => {
					if (error) {
						const msg = \`Error installing dependencies for \${plugin.name}: \${error}\`
						Logger.log(msg)
						vscode.window.showErrorMessage(msg)
						reject(error)
					} else {
						Logger.log(\`Installed dependencies for \${plugin.name}\`)
						resolve()
					}
				})
			})
		} catch (err) {
			const msg = \`Error setting up plugin \${plugin.name}: \${err}\`
			Logger.log(msg)
			vscode.window.showErrorMessage(msg)
		}
	}

	// Configure MCP settings
	mcpConfigPath = path.join(context.globalStorageUri.fsPath, "settings", "cline_mcp_settings.json")
	let mcpConfig: any = { mcpServers: {} }

	try {
		const existingConfig = await fs.readFile(mcpConfigPath, "utf8")
		mcpConfig = JSON.parse(existingConfig)
	} catch {
		// File doesn't exist, will create it
	}

	// Add bundled plugins to MCP config
	for (const plugin of bundledPlugins) {
		mcpConfig.mcpServers[plugin.name] = {
			command: plugin.command,
			args: [path.join(pluginsDir, plugin.name, plugin.entrypoint)],
			disabled: false,
			autoApprove: []
		}
	}

	// Write updated MCP config
	await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), "utf8")
} catch (err) {
	Logger.log(\`Error setting up bundled plugins: \${err}\`)
	vscode.window.showErrorMessage(\`Error setting up bundled plugins: \${err}\ \${pluginsDir}\ \${mcpConfigPath}\`)
}
}`

	// Insert the setup function before activate
	modified = modified.replace("export function activate", `${setupFunction}\n\nexport function activate`)

	// Add fs import
	modified = modified.replace(
		'import * as vscode from "vscode"',
		'import * as vscode from "vscode"\nimport { promises as fs } from "fs"',
	)

	// Add path import if not already present
	if (!modified.includes("import * as path")) {
		modified = modified.replace(
			'import * as vscode from "vscode"',
			'import * as vscode from "vscode"\nimport * as path from "path"',
		)
	}

	// Add setupBundledPlugins call in activate function
	modified = modified.replace(
		'Logger.log("Goodloops Dev extension activated")',
		'Logger.log("Goodloops Dev extension activated")\n\n\tsetupBundledPlugins(context)',
	)

	return modified
}
