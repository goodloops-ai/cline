const fs = require("fs")

const jsdomPatch = {
	name: "jsdom-patch",
	setup(build) {
		build.onLoad({ filter: /XMLHttpRequest-impl\.js$/ }, async (args) => {
			let contents = await fs.promises.readFile(args.path, "utf8")
			contents = contents.replace(
				'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
				`const syncWorkerFile = "${require.resolve("jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js")}";`,
			)
			return { contents, loader: "js" }
		})
	},
}

module.exports = jsdomPatch
