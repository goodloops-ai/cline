const fs = require("fs-extra")
const path = require("path")

async function apply(rootDir) {
	console.log("Applying publisher codemod...")

	// Apply transform to package.json
	await applyTransform(rootDir)

	console.log("Publisher codemod applied successfully!")
}

async function applyTransform(rootDir) {
	const packageJsonFile = path.join(rootDir, "package.json")

	if (await fs.pathExists(packageJsonFile)) {
		const content = await fs.readFile(packageJsonFile, "utf8")
		const packageJson = JSON.parse(content)

		// Update package.json fields
		packageJson.author = {
			name: "Goodloops Inc",
		}
		packageJson.scripts["publish:marketplace"] = "vsce publish"
		packageJson.publisher = "goodloops"
		packageJson.name = "goodloops-cline"
		packageJson.displayName = "Goodloops Cline"

		// Write back the transformed content
		await fs.writeFile(packageJsonFile, JSON.stringify(packageJson, null, 2) + "\n")
		console.log("Transformed: package.json")
	}
}

module.exports = { apply }
