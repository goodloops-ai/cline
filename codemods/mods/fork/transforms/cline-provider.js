/**
 * Transform function for src/core/webview/ClineProvider.ts
 * Updates provider identifiers without renaming classes
 */
module.exports = function transform(content) {
	// Update identifiers without renaming classes
	let modified = content
		// Update static properties but keep the class name
		.replace(
			/public static readonly sideBarId = "claude-dev\.SidebarProvider"/g,
			'public static readonly sideBarId = "goodloops-dev.SidebarProvider"',
		)
		.replace(
			/public static readonly tabPanelId = "claude-dev\.TabPanelProvider"/g,
			'public static readonly tabPanelId = "goodloops-dev.TabPanelProvider"',
		)

	// Update log messages and UI text
	modified = modified
		.replace(
			/this\.outputChannel\.appendLine\("ClineProvider instantiated"\)/g,
			'this.outputChannel.appendLine("ClineProvider instantiated")',
		)
		.replace(
			/this\.outputChannel\.appendLine\("Disposing ClineProvider\.\.\."\)/g,
			'this.outputChannel.appendLine("Disposing ClineProvider...")',
		)
		.replace(/<title>Cline<\/title>/g, "<title>Goodloops Dev</title>")

	// Update authentication URLs
	modified = modified
		.replace(/app\.cline\.bot\/auth/g, "app.goodloops.dev/auth")
		.replace(/vscode:\/\/saoudrizwan\.claude-dev\/auth/g, "vscode://goodloops.goodloops-dev/auth")

	// Update settings references
	modified = modified.replace(/@ext:saoudrizwan\.claude-dev/g, "@ext:goodloops.goodloops-dev")

	// Update directory paths
	modified = modified.replace(/Documents\/Cline\/MCP/g, "Documents/Goodloops/MCP")

	// Update success messages
	modified = modified
		.replace(
			/vscode\.window\.showInformationMessage\("Successfully logged out of Cline"\)/g,
			'vscode.window.showInformationMessage("Successfully logged out of Goodloops Dev")',
		)
		.replace(
			/vscode\.window\.showInformationMessage\("Successfully logged in to Cline"\)/g,
			'vscode.window.showInformationMessage("Successfully logged in to Goodloops Dev")',
		)
		.replace(
			/vscode\.window\.showErrorMessage\("Failed to log in to Cline"\)/g,
			'vscode.window.showErrorMessage("Failed to log in to Goodloops Dev")',
		)

	return modified
}
