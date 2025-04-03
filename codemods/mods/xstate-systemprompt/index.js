const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformSystemTs = require("./transforms/xstate-systemprompt")
const transformClineTs = require("./transforms/xstate-model")

async function apply(rootDir) {
	console.log("Applying XState systemprompt integration codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	console.log("XState systemprompt integration codemod applied successfully!")
}

async function applyTransforms(rootDir) {
	// Apply transform to system.ts file
	// Apply transform to task/index.ts file
	const clineTsFile = path.join(rootDir, "src/core/task/index.ts")

	if (await fs.pathExists(clineTsFile)) {
		const content = await fs.readFile(clineTsFile, "utf8")
		const transformed = transformSystemTs(content)
		await fs.writeFile(clineTsFile, transformed)
		console.log("Transformed: src/core/task/index.ts")
	} else {
		console.error("Could not find src/core/task/index.ts")
	}

	if (await fs.pathExists(clineTsFile)) {
		const content = await fs.readFile(clineTsFile, "utf8")
		const transformed = transformClineTs(content)
		await fs.writeFile(clineTsFile, transformed)
		console.log("Transformed: src/core/task/index.ts")
	} else {
		console.error("Could not find src/core/task/index.ts")
	}
}

module.exports = { apply }
