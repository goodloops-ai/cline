/**
 * Transform function for src/core/prompts/system.ts
 * Adds XState systemprompt integration to be injected after systemPrompt += addUserInstructions
 */
module.exports = function transform(content) {
	// Check if the transformation has already been applied
	if (content.includes("const xstateServer = mcpHub.connections.find")) {
		console.log("XState systemprompt integration already applied, skipping.")
		return content
	}

	// Define the pattern to match - find the block that contains systemPrompt += addUserInstructions
	const addUserInstructionsRegex = /(systemPrompt \+= addUserInstructions\([^)]*\)[;\s]*\})/

	// Replace with the original code plus our XState systemprompt integration code
	const modifiedContent = content.replace(addUserInstructionsRegex, (match) => {
		return `${match}

		if (mcpHub) {

			const xstateServer = mcpHub.connections.find((conn) => conn.server.name === "goodloops-actor" && !conn.server.disabled)
			if (xstateServer && xstateServer.server.status === "connected") {
				try {
					// Set current task ID before fetching system prompt
					await mcpHub.callTool("goodloops-actor", "set_task_id", { 
						taskId: this.taskId,
						mode: this.chatSettings.mode 
					})
					const xstateSystemPrompt = await mcpHub.readResource("goodloops-actor", "xstate://systemprompt")
					if (xstateSystemPrompt && xstateSystemPrompt.contents && xstateSystemPrompt.contents.length > 0) {
						const xstatePromptText = xstateSystemPrompt.contents
							.map((content) => content.text)
							.filter(Boolean)
							.join("\\n\\n")
						if (xstatePromptText) {
							systemPrompt =  xstatePromptText + "\\n\\n" + systemPrompt
						}
					}
				} catch (error) {
					console.error("Failed to access xstate system prompt:", error)
				}
			}
		}
`
	})

	// If the regex didn't match, return the original content and log a warning
	if (modifiedContent === content) {
		console.warn("Could not locate the addUserInstructions code in system.ts.")
		return content
	}

	return modifiedContent
}
