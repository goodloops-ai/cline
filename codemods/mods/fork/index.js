const fs = require("fs-extra")
const path = require("path")
const glob = require("glob")

// Import transforms
const transformPackageJson = require("./transforms/package-json")
const transformExtension = require("./transforms/extension")
const transformClineProvider = require("./transforms/cline-provider")
const transformSystemPrompt = require("./transforms/system-prompt")
const transformReadme = require("./transforms/readme")

async function apply(rootDir) {
	console.log("Applying fork codemod...")

	// Apply transforms
	await applyTransforms(rootDir)

	// Replace all occurrences of "claude-dev" with "goodloops-dev" and "Goodloops Dev" with "Goodloops Dev" in all files
	// but avoid renaming classes/exports
	await replaceInAllFiles(rootDir)

	// Copy files from add-files directory to the target project
	await copyFiles(rootDir)

	console.log("Fork codemod applied successfully!")
}

async function copyFiles(rootDir) {
	// Get the path to the add-files directory
	const addFilesDir = path.join(__dirname, "add-files")

	// Check if the add-files directory exists
	if (await fs.pathExists(addFilesDir)) {
		// Get all files in the add-files directory recursively
		const files = await glob.glob("**/*", { cwd: addFilesDir, nodir: true })

		// Copy each file to the target project
		for (const file of files) {
			const sourcePath = path.join(addFilesDir, file)
			const targetPath = path.join(rootDir, file)

			// Create the target directory if it doesn't exist
			await fs.ensureDir(path.dirname(targetPath))

			// Copy the file
			await fs.copy(sourcePath, targetPath)
			console.log(`Copied: ${file}`)
		}
	}
}

async function applyTransforms(rootDir) {
	// Apply transforms to specific files that need more complex changes
	const packageJsonFile = path.join(rootDir, "package.json")
	const extensionFile = path.join(rootDir, "src/extension.ts")
	const clineProviderFile = path.join(rootDir, "src/core/webview/ClineProvider.ts")
	const systemPromptFile = path.join(rootDir, "src/core/prompts/system.ts")
	const readmeFile = path.join(rootDir, "README.md")

	// Also handle localized README files
	const localesDir = path.join(rootDir, "locales")
	const localeDirs = await fs.readdir(localesDir).catch(() => [])
	const localeReadmeFiles = []

	for (const localeDir of localeDirs) {
		const localeReadmePath = path.join(localesDir, localeDir, "README.md")
		if (await fs.pathExists(localeReadmePath)) {
			localeReadmeFiles.push(localeReadmePath)
		}
	}

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

	if (await fs.pathExists(readmeFile)) {
		const content = await fs.readFile(readmeFile, "utf8")
		const transformed = transformReadme(content)
		await fs.writeFile(readmeFile, transformed)
		console.log("Transformed: README.md")
	}

	// Transform all localized README files
	for (const localeReadmePath of localeReadmeFiles) {
		const content = await fs.readFile(localeReadmePath, "utf8")
		const transformed = transformReadme(content)
		await fs.writeFile(localeReadmePath, transformed)
		console.log(`Transformed: ${path.relative(rootDir, localeReadmePath)}`)
	}
}

async function replaceInAllFiles(rootDir) {
	// Define patterns to match files we want to modify
	const patterns = [
		"**/*.ts",
		"**/*.js",
		"**/*.json",
		"**/*.md",
		"!**/node_modules/**",
		"!**/dist/**",
		"!**/out/**",
		"!**/codemods/**",
	]

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
				path.extname(file) === ".svg" ||
				file.includes("codemods")
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
				.replace(/cline\.SidebarProvider/g, "goodloops-dev.SidebarProvider")
				.replace(/cline\.TabPanelProvider/g, "goodloops-dev.TabPanelProvider")
				// Replace publisher references
				.replace(/saoudrizwan\.claude-dev/g, "goodloops.goodloops-dev")
				.replace(/saoudrizwan\.cline/g, "goodloops.goodloops-dev")
				// Replace command prefixes (being careful not to replace internal class properties)
				.replace(/command: "cline\./g, 'command: "goodloops.')
				.replace(/commands\.registerCommand\("cline\./g, 'commands.registerCommand("goodloops-dev.')
				.replace(/command\.startsWith\("cline\./g, 'command.startsWith("goodloops-dev.')
				// Replace URLs and paths
				.replace(/app\.cline\.bot/g, "app.goodloops.dev")
				.replace(/(?<!api\.)cline\.bot/g, "goodloops.dev")
				.replace(/Documents\/Cline\//g, "Documents/Goodloops/")
				// Replace GitHub URLs
				.replace(/github\.com\/cline\/cline/g, "github.com/goodloops/goodloops-dev")
				.replace(/discord\.gg\/cline/g, "discord.gg/goodloops")
				.replace(/reddit\.com\/r\/cline/g, "reddit.com/r/goodloops")
				// Replace notification titles and text
				.replace(/"Goodloops Dev"/g, '"Goodloops Dev"')
				// Replace HTTP headers
				.replace(/"X-Title": "Goodloops Dev"/g, '"X-Title": "Goodloops Dev"')
				// Replace license information
				.replace(/© 202[0-9] Cline Bot Inc\./g, "© 2025 Goodloops Inc. (forked from Cline)")

			const commandReplacements = [
				{ from: '"cline.plusButtonClicked"', to: '"goodloops-dev.plusButtonClicked"' },
				{ from: '"cline.mcpButtonClicked"', to: '"goodloops-dev.mcpButtonClicked"' },
				{ from: '"cline.historyButtonClicked"', to: '"goodloops-dev.historyButtonClicked"' },
				{ from: '"cline.popoutButtonClicked"', to: '"goodloops-dev.popoutButtonClicked"' },
				{ from: '"cline.settingsButtonClicked"', to: '"goodloops-dev.settingsButtonClicked"' },
				{ from: '"cline.openInNewTab"', to: '"goodloops-dev.openInNewTab"' },
			]

			// Apply all explicit command replacements
			for (const { from, to } of commandReplacements) {
				modified = modified.split(from).join(to)
			}

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
