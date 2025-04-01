/**
 * Transform function for package.json
 * Adds simple-git dependency
 */
module.exports = function transform(content) {
	const pkg = JSON.parse(content)

	// Add simple-git dependency if not already present
	if (!pkg.dependencies["simple-git"]) {
		pkg.dependencies["simple-git"] = "^3.22.0" // Using a stable version
	}

	// Add @types/simple-git dev dependency if not already present
	if (!pkg.devDependencies) {
		pkg.devDependencies = {}
	}

	return JSON.stringify(pkg, null, 2) + "\n"
}
