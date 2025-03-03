/**
 * Transform function for src/core/prompts/system.ts
 * Updates branding references in the system prompt without renaming classes
 */
module.exports = function transform(content) {
	// Update branding references in the system prompt
	let modified = content
		// Update the introduction but keep class names
		.replace(/You are Cline,/g, "You are Goodloops Dev, a fork of Cline,")

		// Update tool descriptions and examples
		.replace(/\`cline\./g, "`goodloops.")
		.replace(/"cline\./g, '"goodloops.')
		.replace(/@ext:saoudrizwan\.claude-dev/g, "@ext:goodloops.goodloops-dev")

		// Update any URLs or paths
		.replace(/cline\.bot/g, "goodloops.dev")
		.replace(/Documents\/Cline\//g, "Documents/Goodloops/")

		// Update any notification titles or text
		.replace(/"Cline has a question/g, '"Goodloops Dev has a question')
		.replace(/"Cline wants to/g, '"Goodloops Dev wants to')
		.replace(/"Cline is having/g, '"Goodloops Dev is having')

		// Update HTTP headers
		.replace(/"X-Title": "Goodloops Dev"/g, '"X-Title": "Goodloops Dev"')

	// We're not renaming classes/exports as per user feedback
	// .replace(/Cline <Language Model API>/g, "Goodloops Dev <Language Model API>")
	// .replace(/Cline would like to use/g, "Goodloops Dev would like to use")

	return modified
}
