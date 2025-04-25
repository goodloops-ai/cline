const { readFileSync, writeFileSync } = require("fs")
const path = require("path")

/**
 * This transform updates the MarkdownBlock component to properly handle links
 * by opening them in VSCode's Simple Browser using the openInVsCodeBrowser message type.
 */
module.exports = async () => {
	console.log("Applying MarkdownBlock transform...")

	const markdownBlockPath = path.join(process.cwd(), "webview-ui", "src", "components", "common", "MarkdownBlock.tsx")
	const content = readFileSync(markdownBlockPath, "utf8")

	// Check if the component already has our implementation with stopPropagation
	if (content.includes("e.stopPropagation()") && content.includes("openInVsCodeBrowser")) {
		console.log("MarkdownBlock already contains proper link handling with e.stopPropagation(), skipping...")
		return
	}

	// First, ensure the vscode import is present - simple check and prepend if needed
	let modifiedContent = content
	if (!content.includes("import { vscode }")) {
		modifiedContent = modifiedContent.replace(
			'import MermaidBlock from "@/components/common/MermaidBlock"',
			'import MermaidBlock from "@/components/common/MermaidBlock"\nimport { vscode } from "@/utils/vscode"',
		)
	}

	// Look for the rehypeReactOptions components section
	if (modifiedContent.includes("rehypeReactOptions: {")) {
		// Simple approach - just look for the components object opening and add our a component there
		modifiedContent = modifiedContent.replace(
			/components: \{/,
			`components: {
				a: (props: ComponentProps<"a">) => {
					return (
						<a
							{...props}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								vscode.postMessage({
									type: "openInVsCodeBrowser",
									url: props.href,
								})
								return false
							}}
						/>
					)
				},`,
		)
	}

	// Write the modified file
	writeFileSync(markdownBlockPath, modifiedContent)
	console.log("MarkdownBlock transform applied successfully")
}
