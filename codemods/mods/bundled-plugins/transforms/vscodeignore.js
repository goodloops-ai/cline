/**
 * Transform function for .vscodeignore
 * Ensures simple-git is packaged correctly
 */
module.exports = function transform(content) {
	// Add line to include simple-git if not already present
	if (!content.includes("!node_modules/simple-git/**")) {
		return content + "\n!node_modules/simple-git/**\n"
	}
	return content
}
