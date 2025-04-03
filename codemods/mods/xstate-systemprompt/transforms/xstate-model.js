/**
 * Transform function for src/core/task/index.ts
 * Adds XState model integration to fetch and update the model dynamically before each API request
 */
module.exports = function transform(content) {
	// Check if the transformation has already been applied
	if (content.includes("// Fetch model dynamically from xstate MCP server")) {
		console.log("XState model integration already applied, skipping.")
		return content
	}

	content = `import { getAllExtensionState, updateApiConfiguration } from "../storage/state"\n` + content

	// Define the pattern to match - find the async attemptApiRequest method
	const attemptApiRequestRegex = /const mcpHub = this.controllerRef.deref\(\)\?\.mcpHub\n.*\n.*\n.*\n/
	// Replace with the original code plus the model fetching code
	const modifiedContent = content.replace(attemptApiRequestRegex, (match) => {
		return `${match}

		
        if (mcpHub) {
            const xstateServer = mcpHub.connections.find((conn) => conn.server.name === "goodloops-actor" && !conn.server.disabled)
            if (xstateServer && xstateServer.server.status === "connected") {
                try {
                    // Fetch model from xstate MCP server
                    const xstateModelResponse = await mcpHub.readResource("goodloops-actor", "xstate://model-card")
                    if (xstateModelResponse && xstateModelResponse.contents && xstateModelResponse.contents.length > 0) {
                        const modelId = xstateModelResponse.contents.map((content) => content.text).filter(Boolean)[0]

                        if (modelId) {
                            const provider = this.controllerRef.deref()
                            if (provider) {
                                // Update API configuration with new model
                            	const { apiConfiguration } = await getAllExtensionState(provider.context)
								const updatedApiConfiguration = {
									...apiConfiguration,
									apiModelId: modelId,
									openRouterModelId: modelId,
									openAiModelId: modelId,
									ollamaModelId: modelId,
									anthropicModelId: modelId,
									geminiModelId: modelId,
									vertexModelId: modelId,
								}

								await updateApiConfiguration(provider.context, updatedApiConfiguration)
								await provider.postStateToWebview()

                                console.log("Using model from xstate MCP server:", modelId)
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to access xstate model:", error)
                }
            }
        }

`
	})

	// If the regex didn't match, return the original content and log a warning
	if (modifiedContent === content) {
		console.warn("Could not locate the attemptApiRequest method in task/index.ts.")
		return content
	}

	return modifiedContent
}
