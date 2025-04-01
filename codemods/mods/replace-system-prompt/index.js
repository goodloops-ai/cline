const fs = require("fs-extra")
const path = require("path")

/**
 * Replace System Prompt Codemod
 *
 * This codemod replaces the src/core/prompts/system.ts file with a custom version.
 * The custom file should be placed in codemods/mods/replace-system-prompt/add-files/src/core/prompts/system.ts
 */
async function apply(rootDir) {
	console.log("Applying replace-system-prompt codemod...")

	// Source file path within the codemod directory
	const sourceFile = path.join(__dirname, "add-files", "src", "core", "prompts", "system.ts")

	// Target file path in the main project
	const targetFile = path.join(rootDir, "src", "core", "prompts", "system.ts")

	// Make sure the source file exists
	if (!fs.existsSync(sourceFile)) {
		throw new Error(`Source file not found: ${sourceFile}`)
	}

	// Ensure target directory exists
	const targetDir = path.dirname(targetFile)
	await fs.ensureDir(targetDir)

	// Copy the file
	await fs.copy(sourceFile, targetFile, { overwrite: true })

	console.log(`✓ Replaced system.ts file with custom version`)
}

module.exports = {
	apply,
}
