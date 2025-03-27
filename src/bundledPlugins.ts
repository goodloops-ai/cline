export const bundledPlugins = [
	{
		name: "xstate-mcp",
		githubUrl: "https://github.com/goodloops-ai/xstate-mcp.git",
		entrypoint: "src/index.js",
		command: "node",
	},
	{
		name: "shell-mcp",
		githubUrl: "https://github.com/goodloops-ai/shell-mcp.git",
		entrypoint: "mcp-shell-server/server.js",
		command: "node",
	},
]
