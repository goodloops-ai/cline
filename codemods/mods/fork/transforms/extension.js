/**
 * Transform function for src/extension.ts
 * Updates extension activation and provider registration
 */
module.exports = function transform(content) {
	// Replace imports
	let modified = content
	// Update imports if needed
	// No need to rename classes/exports as per user feedback

	// Update command registrations
	modified = modified.replace(/vscode\.commands\.registerCommand\("cline\./g, 'vscode.commands.registerCommand("goodloops-dev.')

	// Update output channel name
	modified = modified.replace(
		/vscode\.window\.createOutputChannel\("Goodloops Dev"\)/g,
		'vscode.window.createOutputChannel("Goodloops Dev")',
	)

	// Update log messages
	modified = modified
		.replace(/Logger\.log\("Cline extension activated"\)/g, 'Logger.log("Goodloops Dev extension activated")')
		.replace(/Logger\.log\("Opening Cline in new tab"\)/g, 'Logger.log("Opening Goodloops Dev in new tab")')
		.replace(/Logger\.log\("Cline extension deactivated"\)/g, 'Logger.log("Goodloops Dev extension deactivated")')

	// Update panel creation
	modified = modified.replace(
		/vscode\.window\.createWebviewPanel\(ClineProvider\.tabPanelId, "Goodloops Dev"/g,
		'vscode.window.createWebviewPanel(ClineProvider.tabPanelId, "Goodloops Dev"',
	)

	// We're not renaming API functions as per user feedback
	// modified = modified.replace(/return createClineAPI\(/g, "return createGoodloopsDevAPI(")

	return modified
}
