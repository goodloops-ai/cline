const { readFileSync, writeFileSync } = require("fs")
const path = require("path")

/**
 * This transform adds the 'openInVsCodeBrowser' message type to WebviewMessage.ts
 */
module.exports = async () => {
	console.log("Applying WebviewMessage transform...")

	const webviewMessagePath = path.join(process.cwd(), "src", "shared", "WebviewMessage.ts")
	const content = readFileSync(webviewMessagePath, "utf8")

	// Check if the message type already exists
	if (content.includes('| "openInVsCodeBrowser"')) {
		console.log("WebviewMessage already contains 'openInVsCodeBrowser' type, skipping...")
		return
	}

	// Add the type after a specific message type - simple exact string replacement
	const modifiedContent = content.replace('| "openInBrowser"', '| "openInBrowser"\n\t\t| "openInVsCodeBrowser"')

	// Write the modified file
	writeFileSync(webviewMessagePath, modifiedContent)
	console.log("WebviewMessage transform applied successfully")
}
