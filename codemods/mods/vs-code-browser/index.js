/**
 * VS Code Browser Codemod
 *
 * This codemod adds functionality to open links in VSCode's Simple Browser
 * instead of the system default browser.
 */
const webviewMessageTransform = require("./transforms/webview-message")
const markdownBlockTransform = require("./transforms/markdown-block")
const controllerIndexTransform = require("./transforms/controller-index")

module.exports = async () => {
	console.log("Applying VSCode Browser codemod...")

	// Add the message type to WebviewMessage.ts
	await webviewMessageTransform()

	// Add the handler to controller/index.ts
	await controllerIndexTransform()

	// Add the anchor component to MarkdownBlock.tsx
	await markdownBlockTransform()

	console.log("VSCode Browser codemod applied successfully!")
}
