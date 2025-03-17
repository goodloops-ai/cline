const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformSystemTs = require("./transforms/xstate-systemprompt")

async function apply(rootDir) {
	console.log("Applying XState systemprompt integration codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	console.log("XState systemprompt integration codemod applied successfully!")
}

async function applyTransforms(rootDir) {
	// Apply transform to system.ts file
	const systemTsFile = path.join(rootDir, "src/core/prompts/system.ts")

	if (await fs.pathExists(systemTsFile)) {
		const content = await fs.readFile(systemTsFile, "utf8")
		const transformed = transformSystemTs(content)
		await fs.writeFile(systemTsFile, transformed)
		console.log("Transformed: src/core/prompts/system.ts")
	} else {
		console.error("Could not find src/core/prompts/system.ts")
	}
}

module.exports = { apply }
