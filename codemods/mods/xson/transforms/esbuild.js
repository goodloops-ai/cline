/**
 * Transform function for esbuild.js
 * Adds JSDOM patch to the build process
 */
module.exports = function transform(content) {
	// Add jsdomPatch require
	if (!content.includes("jsdomPatch")) {
		content = content.replace(
			/const esbuild = require\("esbuild"\)/,
			'const esbuild = require("esbuild")\nconst jsdomPatch = require("./esbuild-jsdom-patch")',
		)
	}

	// Add jsdomPatch to plugins array
	if (!content.includes("jsdomPatch,")) {
		content = content.replace(/plugins: \[\n\s+/, "plugins: [\n\t\tjsdomPatch,\n\t\t")
	}

	return content
}
