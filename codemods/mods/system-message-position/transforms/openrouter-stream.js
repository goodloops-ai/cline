/**
 * Transform function for src/api/transform/openrouter-stream.ts
 * Moves the system message from the beginning to the end of the openAiMessages array
 * and updates all references to the system message from [0] to [length-1]
 */
module.exports = function transform(content) {
	// Check if the transformation has already been applied
	if (
		content.includes(
			'let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [\n\t\t...convertToOpenAiMessages(messages),\n\t\t{ role: "system", content: systemPrompt }',
		)
	) {
		console.log("System message position already modified, skipping.")
		return content
	}

	// Replace the order in the initial array definition
	const arrayInitPattern =
		/let openAiMessages: OpenAI\.Chat\.ChatCompletionMessageParam\[\] = \[\s*{\s*role:\s*"system",\s*content:\s*systemPrompt\s*},\s*\.\.\.convertToOpenAiMessages\(messages\),\s*\]/g

	const replacementArray = `let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
		...convertToOpenAiMessages(messages),
		{ role: "system", content: systemPrompt }
	]`

	let modifiedContent = content.replace(arrayInitPattern, replacementArray)

	// If the pattern wasn't found, try a more flexible regex
	if (modifiedContent === content) {
		const flexiblePattern =
			/let openAiMessages:.*=\s*\[\s*{\s*role:\s*["']system["'],\s*content:\s*systemPrompt\s*},\s*\.\.\.convertToOpenAiMessages\(messages\),\s*\]/gs
		modifiedContent = content.replace(flexiblePattern, replacementArray)
	}

	// Now update all references to openAiMessages[0] with references to the last element
	// This handles the system message being at the end of the array instead of the beginning
	modifiedContent = modifiedContent.replace(/openAiMessages\[0\]\s*=\s*{/g, "openAiMessages[openAiMessages.length - 1] = {")

	// Also update the R1Format conversion to be consistent with our system message position change
	modifiedContent = modifiedContent.replace(
		/convertToR1Format\(\[\{ role: ["']user["'], content: systemPrompt \}, ...messages\]\)/g,
		'convertToR1Format([...messages, { role: "user", content: systemPrompt }])',
	)

	// Check if we successfully applied the transformation
	if (modifiedContent === content) {
		console.warn("Could not modify the system message position in openrouter-stream.ts.")
		return content
	}

	console.log("Successfully modified system message position in openrouter-stream.ts")
	return modifiedContent
}
