/**
 * Transform functions for adding claude-3.7-sonnet:thinking model support
 */

function transformApi(content) {
	// Check if the model already exists to avoid duplicate entries
	if (content.includes('"claude-3-7-sonnet:thinking"')) {
		console.log("claude-3.7-sonnet:thinking model already exists, skipping")
		return content
	}

	// Find the start of the anthropicModels definition
	const modelsStartPattern = /export const anthropicModels = {/
	const match = content.match(modelsStartPattern)

	if (!match) {
		console.warn("Could not find anthropicModels definition in src/shared/api.ts")
		return content
	}

	// Position at the start of the object definition
	const insertPosition = match.index + match[0].length

	// New model definition to insert
	const newModelDef = `
	"claude-3.7-sonnet:thinking": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: true,
		inputPrice: 3.0,
		outputPrice: 15.0,
		cacheWritesPrice: 3.75,
		cacheReadsPrice: 0.3,
	},`

	// Insert the new model at the start of the anthropicModels object
	return content.slice(0, insertPosition) + newModelDef + content.slice(insertPosition)
}

function transformClineProvider(content) {
	// Check if the model already exists in the switch statement
	if (content.includes('"anthropic/claude-3.7-sonnet:thinking":')) {
		console.log("claude-3.7-sonnet:thinking model already exists in ClineProvider, skipping")
		return content
	}

	// Find the switch statement for setting model capabilities
	const switchPattern = /switch \(rawModel\.id\) {[\s\S]*?case "anthropic\/claude-3\.7-sonnet":/
	const match = content.match(switchPattern)

	if (!match) {
		console.warn("Could not find model switch statement in ClineProvider")
		return content
	}

	// Position at the start of the first case
	const insertPosition = match.index + match[0].length

	// New case to insert
	const newCase = `
			case "anthropic/claude-3.7-sonnet:thinking":`

	return content.slice(0, insertPosition) + newCase + content.slice(insertPosition)
}

module.exports = {
	transformApi,
	transformClineProvider,
}
