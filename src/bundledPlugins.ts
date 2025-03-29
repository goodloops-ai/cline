export const bundledPlugins = [
	{
		name: "goodloops-actor",
		githubUrl: "https://github.com/goodloops-ai/xstate-mcp.git",
		entrypoint: "src/index.js",
		command: "node",
	},
	{
		name: "shell-mcp",
		githubUrl: "https://github.com/goodloops-ai/shell-mcp.git",
		entrypoint: "server.js",
		command: "node",
	},
]
