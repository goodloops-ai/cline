const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformOpenRouterStream = require("./transforms/openrouter-stream")

async function apply(rootDir) {
	console.log("Applying system-message-position codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	console.log("System message position codemod applied successfully!")
}

async function applyTransforms(rootDir) {
	// Apply transforms to existing files
	const openRouterStreamFile = path.join(rootDir, "src/api/transform/openrouter-stream.ts")

	if (await fs.pathExists(openRouterStreamFile)) {
		const content = await fs.readFile(openRouterStreamFile, "utf8")
		const transformed = transformOpenRouterStream(content)
		await fs.writeFile(openRouterStreamFile, transformed)
		console.log("Transformed: src/api/transform/openrouter-stream.ts")
	} else {
		console.warn("File not found: src/api/transform/openrouter-stream.ts")
	}
}

module.exports = { apply }
