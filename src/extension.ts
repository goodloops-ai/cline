// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { setTimeout as setTimeoutPromise } from "node:timers/promises"
import * as vscode from "vscode"
import * as path from "path"
import { promises as fs } from "fs"
import { ClineProvider } from "./core/webview/ClineProvider"
import { Logger } from "./services/logging/Logger"
import { createClineAPI } from "./exports"
import "./utils/path"
import { bundledPlugins } from "./bundledPlugins"
import simpleGit from "simple-git"
import { exec } from "child_process" // necessary to have access to String.prototype.toPosix
import { DIFF_VIEW_URI_SCHEME } from "./integrations/editor/DiffViewProvider"
import assert from "node:assert"
import { telemetryService } from "./services/telemetry/TelemetryService"

/*
Built using https://github.com/microsoft/vscode-webview-ui-toolkit

Inspired by
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra

*/

let outputChannel: vscode.OutputChannel

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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
			const pluginExists = await fs
				.stat(pluginPath)
				.then(() => true)
				.catch(() => false)

			try {
				if (!pluginExists) {
					// Clone the plugin repository
					await git.clone(plugin.githubUrl, pluginPath)
					Logger.log(`Cloned plugin: ${plugin.name}`)
				} else {
					// Update existing plugin repository
					await git.cwd(pluginPath).pull("origin", "main")
					Logger.log(`Updated plugin: ${plugin.name}`)
				}

				// Run npm install
				await new Promise<void>((resolve, reject) => {
					exec("npm install", { cwd: pluginPath }, (error) => {
						if (error) {
							const msg = `Error installing dependencies for ${plugin.name}: ${error}`
							Logger.log(msg)
							vscode.window.showErrorMessage(msg)
							reject(error)
						} else {
							Logger.log(`Installed dependencies for ${plugin.name}`)
							resolve()
						}
					})
				})
			} catch (err) {
				const msg = `Error setting up plugin ${plugin.name}: ${err}`
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
				autoApprove: [],
			}
		}

		// Write updated MCP config
		await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), "utf8")
	} catch (err) {
		Logger.log(`Error setting up bundled plugins: ${err}`)
		vscode.window.showErrorMessage(`Error setting up bundled plugins: ${err} ${pluginsDir} ${mcpConfigPath}`)
	}
}

export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("Cline")
	context.subscriptions.push(outputChannel)

	Logger.initialize(outputChannel)
	Logger.log("Goodloops Dev extension activated")

	setupBundledPlugins(context)

	const sidebarProvider = new ClineProvider(context, outputChannel)

	vscode.commands.executeCommand("setContext", "cline.isDevMode", IS_DEV && IS_DEV === "true")

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider.sideBarId, sidebarProvider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.plusButtonClicked", async () => {
			Logger.log("Plus button Clicked")
			await sidebarProvider.clearTask()
			await sidebarProvider.postStateToWebview()
			await sidebarProvider.postMessageToWebview({
				type: "action",
				action: "chatButtonClicked",
			})
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.mcpButtonClicked", () => {
			sidebarProvider.postMessageToWebview({
				type: "action",
				action: "mcpButtonClicked",
			})
		}),
	)

	const openClineInNewTab = async () => {
		Logger.log("Opening Goodloops Dev in new tab")
		// (this example uses webviewProvider activation event which is necessary to deserialize cached webview, but since we use retainContextWhenHidden, we don't need to use that event)
		// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
		const tabProvider = new ClineProvider(context, outputChannel)
		//const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

		// Check if there are any visible text editors, otherwise open a new group to the right
		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(ClineProvider.tabPanelId, "Cline", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [context.extensionUri],
		})
		// TODO: use better svg icon with light and dark variants (see https://stackoverflow.com/questions/58365687/vscode-extension-iconpath)

		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_light.png"),
			dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_dark.png"),
		}
		tabProvider.resolveWebviewView(panel)

		// Lock the editor group so clicking on files doesn't open them over the panel
		await setTimeoutPromise(100)
		await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
	}

	context.subscriptions.push(vscode.commands.registerCommand("goodloops-dev.popoutButtonClicked", openClineInNewTab))
	context.subscriptions.push(vscode.commands.registerCommand("goodloops-dev.openInNewTab", openClineInNewTab))

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.settingsButtonClicked", () => {
			//vscode.window.showInformationMessage(message)
			sidebarProvider.postMessageToWebview({
				type: "action",
				action: "settingsButtonClicked",
			})
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.historyButtonClicked", () => {
			sidebarProvider.postMessageToWebview({
				type: "action",
				action: "historyButtonClicked",
			})
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.accountButtonClicked", () => {
			sidebarProvider.postMessageToWebview({
				type: "action",
				action: "accountButtonClicked",
			})
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.openDocumentation", () => {
			vscode.env.openExternal(vscode.Uri.parse("https://docs.goodloops.dev/"))
		}),
	)

	/*
	We use the text document content provider API to show the left side for diff view by creating a virtual document for the original content. This makes it readonly so users know to edit the right side if they want to keep their changes.

	- This API allows you to create readonly documents in VSCode from arbitrary sources, and works by claiming an uri-scheme for which your provider then returns text contents. The scheme must be provided when registering a provider and cannot change afterwards.
	- Note how the provider doesn't create uris for virtual documents - its role is to provide contents given such an uri. In return, content providers are wired into the open document logic so that providers are always considered.
	https://code.visualstudio.com/api/extension-guides/virtual-documents
	*/
	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider))

	// URI Handler
	const handleUri = async (uri: vscode.Uri) => {
		console.log("URI Handler called with:", {
			path: uri.path,
			query: uri.query,
			scheme: uri.scheme,
		})

		const path = uri.path
		const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"))
		const visibleProvider = ClineProvider.getVisibleInstance()
		if (!visibleProvider) {
			return
		}
		switch (path) {
			case "/openrouter": {
				const code = query.get("code")
				if (code) {
					await visibleProvider.handleOpenRouterCallback(code)
				}
				break
			}
			case "/auth": {
				const token = query.get("token")
				const state = query.get("state")
				const apiKey = query.get("apiKey")

				console.log("Auth callback received:", {
					token: token,
					state: state,
					apiKey: apiKey,
				})

				// Validate state parameter
				if (!(await visibleProvider.validateAuthState(state))) {
					vscode.window.showErrorMessage("Invalid auth state")
					return
				}

				if (token && apiKey) {
					await visibleProvider.handleAuthCallback(token, apiKey)
				}
				break
			}
			default:
				break
		}
	}
	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	// Register size testing commands in development mode
	if (IS_DEV && IS_DEV === "true") {
		// Use dynamic import to avoid loading the module in production
		import("./dev/commands/tasks")
			.then((module) => {
				const devTaskCommands = module.registerTaskCommands(context, sidebarProvider)
				context.subscriptions.push(...devTaskCommands)
				Logger.log("Cline dev task commands registered")
			})
			.catch((error) => {
				Logger.log("Failed to register dev task commands: " + error)
			})
	}

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"goodloops-dev.addToChat",
			async (range?: vscode.Range, diagnostics?: vscode.Diagnostic[]) => {
				const editor = vscode.window.activeTextEditor
				if (!editor) {
					return
				}

				// Use provided range if available, otherwise use current selection
				// (vscode command passes an argument in the first param by default, so we need to ensure it's a Range object)
				const textRange = range instanceof vscode.Range ? range : editor.selection
				const selectedText = editor.document.getText(textRange)

				if (!selectedText) {
					return
				}

				// Get the file path and language ID
				const filePath = editor.document.uri.fsPath
				const languageId = editor.document.languageId

				// Send to sidebar provider
				await sidebarProvider.addSelectedCodeToChat(
					selectedText,
					filePath,
					languageId,
					Array.isArray(diagnostics) ? diagnostics : undefined,
				)
			},
		),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.addTerminalOutputToChat", async () => {
			const terminal = vscode.window.activeTerminal
			if (!terminal) {
				return
			}

			// Save current clipboard content
			const tempCopyBuffer = await vscode.env.clipboard.readText()

			try {
				// Copy the *existing* terminal selection (without selecting all)
				await vscode.commands.executeCommand("workbench.action.terminal.copySelection")

				// Get copied content
				let terminalContents = (await vscode.env.clipboard.readText()).trim()

				// Restore original clipboard content
				await vscode.env.clipboard.writeText(tempCopyBuffer)

				if (!terminalContents) {
					// No terminal content was copied (either nothing selected or some error)
					return
				}

				// [Optional] Any additional logic to process multi-line content can remain here
				// For example:
				/*
				const lines = terminalContents.split("\n")
				const lastLine = lines.pop()?.trim()
				if (lastLine) {
					let i = lines.length - 1
					while (i >= 0 && !lines[i].trim().startsWith(lastLine)) {
						i--
					}
					terminalContents = lines.slice(Math.max(i, 0)).join("\n")
				}
				*/

				// Send to sidebar provider
				await sidebarProvider.addSelectedTerminalOutputToChat(terminalContents, terminal.name)
			} catch (error) {
				// Ensure clipboard is restored even if an error occurs
				await vscode.env.clipboard.writeText(tempCopyBuffer)
				console.error("Error getting terminal contents:", error)
				vscode.window.showErrorMessage("Failed to get terminal contents")
			}
		}),
	)

	// Register code action provider
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			"*",
			new (class implements vscode.CodeActionProvider {
				public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix]

				provideCodeActions(
					document: vscode.TextDocument,
					range: vscode.Range,
					context: vscode.CodeActionContext,
				): vscode.CodeAction[] {
					// Expand range to include surrounding 3 lines
					const expandedRange = new vscode.Range(
						Math.max(0, range.start.line - 3),
						0,
						Math.min(document.lineCount - 1, range.end.line + 3),
						document.lineAt(Math.min(document.lineCount - 1, range.end.line + 3)).text.length,
					)

					const addAction = new vscode.CodeAction("Add to Cline", vscode.CodeActionKind.QuickFix)
					addAction.command = {
						command: "goodloops.addToChat",
						title: "Add to Cline",
						arguments: [expandedRange, context.diagnostics],
					}

					const fixAction = new vscode.CodeAction("Fix with Cline", vscode.CodeActionKind.QuickFix)
					fixAction.command = {
						command: "goodloops.fixWithCline",
						title: "Fix with Cline",
						arguments: [expandedRange, context.diagnostics],
					}

					// Only show actions when there are errors
					if (context.diagnostics.length > 0) {
						return [addAction, fixAction]
					} else {
						return []
					}
				}
			})(),
			{
				providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
			},
		),
	)

	// Register the command handler
	context.subscriptions.push(
		vscode.commands.registerCommand("goodloops-dev.fixWithCline", async (range: vscode.Range, diagnostics: any[]) => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}

			const selectedText = editor.document.getText(range)
			const filePath = editor.document.uri.fsPath
			const languageId = editor.document.languageId

			// Send to sidebar provider with diagnostics
			await sidebarProvider.fixWithCline(selectedText, filePath, languageId, diagnostics)
		}),
	)

	return createClineAPI(outputChannel, sidebarProvider)
}

// This method is called when your extension is deactivated
export function deactivate() {
	telemetryService.shutdown()
	Logger.log("Goodloops Dev extension deactivated")
}

// TODO: Find a solution for automatically removing DEV related content from production builds.
//  This type of code is fine in production to keep. We just will want to remove it from production builds
//  to bring down built asset sizes.
//
// This is a workaround to reload the extension when the source code changes
// since vscode doesn't support hot reload for extensions
const { IS_DEV, DEV_WORKSPACE_FOLDER } = process.env

if (IS_DEV && IS_DEV !== "false") {
	assert(DEV_WORKSPACE_FOLDER, "DEV_WORKSPACE_FOLDER must be set in development")
	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(DEV_WORKSPACE_FOLDER, "src/**/*"))

	watcher.onDidChange(({ scheme, path }) => {
		console.info(`${scheme} ${path} changed. Reloading VSCode...`)

		vscode.commands.executeCommand("workbench.action.reloadWindow")
	})
}
