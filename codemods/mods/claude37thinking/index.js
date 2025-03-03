const fs = require("fs-extra")
const path = require("path")

// Import transforms
const { transformApi, transformClineProvider } = require("./transforms/api")

async function apply(rootDir) {
	console.log("Applying claude37thinking codemod...")

	// Apply transform to the API file
	const apiFilePath = path.join(rootDir, "src/shared/api.ts")
	if (await fs.pathExists(apiFilePath)) {
		const content = await fs.readFile(apiFilePath, "utf8")
		const transformed = transformApi(content)
		await fs.writeFile(apiFilePath, transformed)
		console.log("Transformed: src/shared/api.ts")
	} else {
		console.warn("Could not find src/shared/api.ts")
	}

	// Apply transform to the ClineProvider file
	const clineProviderPath = path.join(rootDir, "src/core/webview/ClineProvider.ts")
	if (await fs.pathExists(clineProviderPath)) {
		const content = await fs.readFile(clineProviderPath, "utf8")
		const transformed = transformClineProvider(content)
		await fs.writeFile(clineProviderPath, transformed)
		console.log("Transformed: src/core/webview/ClineProvider.ts")
	} else {
		console.warn("Could not find src/core/webview/ClineProvider.ts")
	}

	console.log("claude37thinking codemod applied successfully!")
}

module.exports = { apply }
