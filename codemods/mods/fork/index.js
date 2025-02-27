const fs = require("fs-extra")
const path = require("path")
const glob = require("glob")

// Import transforms
const transformPackageJson = require("./transforms/package-json")
const transformExtension = require("./transforms/extension")
const transformClineProvider = require("./transforms/cline-provider")
const transformSystemPrompt = require("./transforms/system-prompt")

async function apply(rootDir) {
	console.log("Applying fork codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	// Replace all occurrences of "claude-dev" with "goodloops-dev" and "Cline" with "Goodloops Dev" in all files
	// but avoid renaming classes/exports
	await replaceInAllFiles(rootDir)

	console.log("Fork codemod applied successfully!")
}

async function applyTransforms(rootDir) {
	// Apply transforms to specific files that need more complex changes
	const packageJsonFile = path.join(rootDir, "package.json")
	const extensionFile = path.join(rootDir, "src/extension.ts")
	const clineProviderFile = path.join(rootDir, "src/core/webview/ClineProvider.ts")
	const systemPromptFile = path.join(rootDir, "src/core/prompts/system.ts")

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

	if (await fs.pathExists(clineProviderFile)) {
		const content = await fs.readFile(clineProviderFile, "utf8")
		const transformed = transformClineProvider(content)
		await fs.writeFile(clineProviderFile, transformed)
		console.log("Transformed: src/core/webview/ClineProvider.ts")
	}

	if (await fs.pathExists(systemPromptFile)) {
		const content = await fs.readFile(systemPromptFile, "utf8")
		const transformed = transformSystemPrompt(content)
		await fs.writeFile(systemPromptFile, transformed)
		console.log("Transformed: src/core/prompts/system.ts")
	}
}

async function replaceInAllFiles(rootDir) {
	// Define patterns to match files we want to modify
	const patterns = ["**/*.ts", "**/*.js", "**/*.json", "**/*.md", "!**/node_modules/**", "!**/dist/**", "!**/out/**"]

	// Get all matching files
	const files = await glob.glob(patterns, { cwd: rootDir, absolute: true })

	// Process each file
	for (const file of files) {
		try {
			// Skip binary files
			if (
				path.extname(file) === ".png" ||
				path.extname(file) === ".jpg" ||
				path.extname(file) === ".gif" ||
				path.extname(file) === ".svg"
			) {
				continue
			}

			const content = await fs.readFile(file, "utf8")

			// Skip files that are too large (likely binary files or generated files)
			if (content.length > 1000000) {
				continue
			}

			// Replace identifiers but avoid renaming classes/exports
			let modified = content
				// Replace extension identifiers
				.replace(/claude-dev\.SidebarProvider/g, "goodloops-dev.SidebarProvider")
				.replace(/claude-dev\.TabPanelProvider/g, "goodloops-dev.TabPanelProvider")
				.replace(/claude-dev-ActivityBar/g, "goodloops-dev-ActivityBar")
				// Replace publisher references
				.replace(/saoudrizwan\.claude-dev/g, "goodloops.goodloops-dev")
				// Replace command prefixes (being careful not to replace internal class properties)
				.replace(/command: "cline\./g, 'command: "goodloops.')
				.replace(/commands\.registerCommand\("cline\./g, 'commands.registerCommand("goodloops.')
				.replace(/command\.startsWith\("cline\./g, 'command.startsWith("goodloops.')
				// Replace URLs and paths
				.replace(/app\.cline\.bot/g, "app.goodloops.dev")
				.replace(/cline\.bot/g, "goodloops.dev")
				.replace(/Documents\/Cline\//g, "Documents/Goodloops/")
				// Replace notification titles and text
				.replace(/"Cline"/g, '"Goodloops Dev"')
				// Replace HTTP headers
				.replace(/"X-Title": "Cline"/g, '"X-Title": "Goodloops Dev"')

			// Only write the file if changes were made
			if (modified !== content) {
				await fs.writeFile(file, modified)
				console.log(`Updated references in: ${path.relative(rootDir, file)}`)
			}
		} catch (error) {
			console.error(`Error processing file ${file}:`, error)
		}
	}
}

module.exports = { apply }
