export const bundledPlugins = [
	{
		name: "goodloops-actor",
		githubUrl: "https://github.com/goodloops-ai/xstate-mcp.git",
		entrypoint: "src/index.js",
		command: "node",
		checkout: "bbf4d863db5b3b3faa3d678df36c0097a79e8f7c",
	},
	{
		name: "shell-mcp",
		githubUrl: "https://github.com/goodloops-ai/shell-mcp.git",
		entrypoint: "server.js",
		command: "node",
		checkout: "edfa24dc5c36c9504fb77ef83eb10576e8876ffc",
	},
]
