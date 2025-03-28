const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformMcpHub = require("./transforms/inject-workspace-dir")

async function apply(rootDir) {
	console.log("Applying workspace-dir injection codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	console.log("Workspace-dir injection codemod applied successfully!")
}

async function applyTransforms(rootDir) {
	// Apply transform to McpHub.ts file
	const mcpHubFile = path.join(rootDir, "src/services/mcp/McpHub.ts")

	if (await fs.pathExists(mcpHubFile)) {
		const content = await fs.readFile(mcpHubFile, "utf8")
		const transformed = transformMcpHub(content)
		await fs.writeFile(mcpHubFile, transformed)
		console.log("Transformed: src/services/mcp/McpHub.ts")
	} else {
		console.error("Could not find src/services/mcp/McpHub.ts")
	}
}

module.exports = { apply }
