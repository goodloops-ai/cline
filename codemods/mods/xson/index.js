const fs = require("fs-extra")
const path = require("path")

// Import transforms
const transformCline = require("./transforms/cline")
const transformEsbuild = require("./transforms/esbuild")
const transformPackageJson = require("./transforms/package-json")

async function apply(rootDir) {
	console.log("Applying XSON codemod...")

	// Add new files
	await copyFiles(rootDir)

	// Apply transforms
	await applyTransforms(rootDir)

	console.log("XSON codemod applied successfully!")
}

async function copyFiles(rootDir) {
	const addFilesDir = path.join(__dirname, "add-files")
	const files = await fs.readdir(addFilesDir, { recursive: true, withFileTypes: true })

	for (const file of files) {
		if (file.isFile()) {
			const relativePath = path.relative(addFilesDir, path.join(file.path, file.name))
			const sourcePath = path.join(addFilesDir, relativePath)
			const destPath = path.join(rootDir, relativePath)

			await fs.ensureDir(path.dirname(destPath))
			await fs.copyFile(sourcePath, destPath)
			console.log(`Added file: ${relativePath}`)
		}
	}
}

async function applyTransforms(rootDir) {
	// Apply transforms to existing files
	const clineFile = path.join(rootDir, "src/core/task/index.ts")
	const systemFile = path.join(rootDir, "src/core/prompts/system.ts")
	const esbuildFile = path.join(rootDir, "esbuild.js")
	const packageJsonFile = path.join(rootDir, "package.json")

	if (await fs.pathExists(clineFile)) {
		const content = await fs.readFile(clineFile, "utf8")
		const transformed = transformCline(content)
		await fs.writeFile(clineFile, transformed)
		console.log("Transformed: src/core/task/index.ts")
	}

	if (await fs.pathExists(esbuildFile)) {
		const content = await fs.readFile(esbuildFile, "utf8")
		const transformed = transformEsbuild(content)
		await fs.writeFile(esbuildFile, transformed)
		console.log("Transformed: esbuild.js")
	}

	if (await fs.pathExists(packageJsonFile)) {
		const content = await fs.readFile(packageJsonFile, "utf8")
		const transformed = transformPackageJson(content)
		await fs.writeFile(packageJsonFile, transformed)
		console.log("Transformed: package.json")
	}
}

module.exports = { apply }
