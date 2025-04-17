export const bundledPlugins = [
	{
		name: "goodloops-actor",
		githubUrl: "https://github.com/goodloops-ai/xstate-mcp.git",
		entrypoint: "src/index.js",
		command: "node",
		checkout: "6d90f2757d4fa5502977dbbd88243e1c1f182a2f",
	},
	{
		name: "shell-mcp",
		githubUrl: "https://github.com/goodloops-ai/shell-mcp.git",
		entrypoint: "server.js",
		command: "node",
		checkout: "eea93545b5ffccb4f41902b138c597f52c0dc653",
	},
]
