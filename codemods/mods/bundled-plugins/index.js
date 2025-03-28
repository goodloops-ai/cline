const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformExtension = require("./transforms/extension")
const transformPackageJson = require("./transforms/package-json")
const transformVscodeignore = require("./transforms/vscodeignore")

async function apply(rootDir) {
	console.log("Applying bundled-plugins codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	// Copy files from add-files directory to the target project
	await copyFiles(rootDir)

	console.log("Bundled-plugins codemod applied successfully!")
}

async function copyFiles(rootDir) {
	// Get the path to the add-files directory
	const addFilesDir = path.join(__dirname, "add-files")

	// Check if the add-files directory exists
	if (await fs.pathExists(addFilesDir)) {
		// Copy bundledPlugins.ts
		const sourcePath = path.join(addFilesDir, "src", "bundledPlugins.ts")
		const targetPath = path.join(rootDir, "src", "bundledPlugins.ts")

		// Create the target directory if it doesn't exist
		await fs.ensureDir(path.dirname(targetPath))

		// Copy the file
		await fs.copy(sourcePath, targetPath)
		console.log(`Copied: src/bundledPlugins.ts`)
	}
}

async function applyTransforms(rootDir) {
	// Apply transforms to specific files that need more complex changes
	const packageJsonFile = path.join(rootDir, "package.json")
	const extensionFile = path.join(rootDir, "src/extension.ts")

	if (await fs.pathExists(packageJsonFile)) {
		const content = await fs.readFile(packageJsonFile, "utf8")
		const transformed = transformPackageJson(content)
		await fs.writeFile(packageJsonFile, transformed)
		console.log("Transformed: package.json")
	}

	if (await fs.pathExists(extensionFile)) {
		const content = await fs.readFile(extensionFile, "utf8")
		const transformed = transformExtension(content)
		await fs.writeFile(extensionFile, transformed)
		console.log("Transformed: src/extension.ts")
	}

	const vscodeignoreFile = path.join(rootDir, ".vscodeignore")
	if (await fs.pathExists(vscodeignoreFile)) {
		const content = await fs.readFile(vscodeignoreFile, "utf8")
		const transformed = transformVscodeignore(content)
		await fs.writeFile(vscodeignoreFile, transformed)
		console.log("Transformed: .vscodeignore")
	}
}

module.exports = { apply }
