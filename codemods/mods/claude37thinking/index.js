const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformApi = require("./transforms/api")

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

	console.log("claude37thinking codemod applied successfully!")
}

module.exports = { apply }
