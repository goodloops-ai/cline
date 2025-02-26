/**
 * Transform function for package.json
 * Adds xmlbuilder2 and jsdom dependencies and useXsonParser VSCode configuration
 */
module.exports = function transform(content) {
	// Parse the package.json content
	const packageJson = JSON.parse(content)

	// Add xmlbuilder2 and jsdom dependencies if they don't exist
	if (!packageJson.dependencies.xmlbuilder2) {
		packageJson.dependencies.xmlbuilder2 = "^3.1.1"
	}

	if (!packageJson.dependencies.jsdom) {
		packageJson.dependencies.jsdom = "^26.0.0"
	}

	// Sort dependencies alphabetically to maintain consistent ordering
	const sortedDependencies = {}
	Object.keys(packageJson.dependencies)
		.sort()
		.forEach((key) => {
			sortedDependencies[key] = packageJson.dependencies[key]
		})

	packageJson.dependencies = sortedDependencies

	// Add useXsonParser VSCode configuration if it doesn't exist
	if (packageJson.contributes && packageJson.contributes.configuration) {
		const properties = packageJson.contributes.configuration.properties || {}

		// Add the useXsonParser configuration if it doesn't exist
		if (!properties["cline.useXsonParser"]) {
			properties["cline.useXsonParser"] = {
				type: "boolean",
				default: false,
				description:
					"Use XSON format for MCP tool arguments instead of JSON. XSON is an XML-based format that handles multiline text and special characters better.",
			}

			// Update the properties in the package.json
			packageJson.contributes.configuration.properties = properties
		}
	}

	// Return the stringified package.json with proper formatting
	// Use the same indentation style as the original file (tab)
	return JSON.stringify(packageJson, null, "\t")
}
