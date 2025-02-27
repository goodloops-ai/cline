/**
 * Transform function for README.md
 * Replaces the entire README with a single line indicating it's a fork of Cline
 */
module.exports = function transform(content) {
	// Replace the entire README with a single line
	return "# Goodloops Dev\n\nGoodloops Dev is a fork of Cline.\n"
}
