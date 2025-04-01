const fs = require("fs-extra")
const path = require("path")
const config = require("./config.json")

async function applyCodemods(rootDir) {
	console.log(`Applying codemods to: ${rootDir}`)

	// Load and apply each enabled codemod
	for (const modName of config.enabledMods) {
		console.log(`Applying codemod: ${modName}`)
		const mod = require(`./mods/${modName}`)
		await mod.apply(rootDir)
	}

	console.log("All codemods applied successfully!")
}

// Get project root from command line or use current directory
const rootDir = process.argv[2] || process.cwd()
applyCodemods(rootDir).catch((err) => {
	console.error("Error applying codemods:", err)
	process.exit(1)
})
