const { readFileSync, writeFileSync } = require("fs")
const path = require("path")

/**
 * This transform adds the 'openInVsCodeBrowser' message handler to the controller/index.ts file
 * to open links in VSCode's Simple Browser
 */
module.exports = async () => {
	console.log("Applying controller-index transform...")

	const controllerPath = path.join(process.cwd(), "src", "core", "controller", "index.ts")
	const content = readFileSync(controllerPath, "utf8")

	// Check if the handler already exists
	if (content.includes('case "openInVsCodeBrowser":')) {
		console.log("Controller already contains 'openInVsCodeBrowser' handler, skipping...")
		return
	}

	// Add the handler after the openInBrowser case with a much simpler search pattern
	const modifiedContent = content.replace(
		'case "fetchOpenGraphData":',
		`case "openInVsCodeBrowser":
				if (message.url) {
					vscode.commands.executeCommand("simpleBrowser.show", vscode.Uri.parse(message.url))
				}
				break;
			case "fetchOpenGraphData":`,
	)

	// Write the modified file
	writeFileSync(controllerPath, modifiedContent)
	console.log("Controller transform applied successfully")
}
