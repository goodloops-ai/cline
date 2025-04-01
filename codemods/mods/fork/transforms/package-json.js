/**
 * Transform function for package.json
 * Updates extension identity for side-by-side installation without renaming classes
 */
module.exports = function transform(content) {
	const packageJson = JSON.parse(content)

	// Update package.json fields
	packageJson.name = "goodloops-dev"
	packageJson.displayName = "Goodloops Dev"
	packageJson.publisher = "goodloops"
	packageJson.author = {
		name: "Goodloops Inc.",
	}

	// Update description to indicate it's a fork
	if (packageJson.description) {
		packageJson.description = "A fork of Cline - " + packageJson.description
	}

	// Update repository URL if needed
	if (packageJson.repository && packageJson.repository.url) {
		packageJson.repository.url = packageJson.repository.url.replace("cline/cline", "goodloops/goodloops-dev")
	}

	// Update homepage if needed
	if (packageJson.homepage) {
		packageJson.homepage = "https://goodloops.dev"
	}

	// Update contributes section
	if (packageJson.contributes) {
		// Update viewsContainers
		if (packageJson.contributes.viewsContainers && packageJson.contributes.viewsContainers.activitybar) {
			packageJson.contributes.viewsContainers.activitybar.forEach((container) => {
				if (container.id === "claude-dev-ActivityBar") {
					container.id = "goodloops-ActivityBar"
					container.title = "Goodloops Dev"
				}
			})
		}

		// Update views
		if (packageJson.contributes.views) {
			if (packageJson.contributes.views["claude-dev-ActivityBar"]) {
				packageJson.contributes.views["goodloops-dev-ActivityBar"] =
					packageJson.contributes.views["claude-dev-ActivityBar"]
				delete packageJson.contributes.views["claude-dev-ActivityBar"]

				// Update view IDs
				packageJson.contributes.views["goodloops-dev-ActivityBar"]?.forEach((view) => {
					if (view.id === "claude-dev.SidebarProvider") {
						view.id = "goodloops-dev.SidebarProvider"
					}
				})
			}
		}

		// Update commands
		if (packageJson.contributes.commands) {
			packageJson.contributes.commands.forEach((command) => {
				if (command.command.startsWith("cline.")) {
					command.command = command.command.replace("cline.", "goodloops-dev.")
				}
				if (command.category === "Cline") {
					command.category = "Goodloops Dev"
				}
			})
		}

		if (packageJson.contributes.viewsContainers) {
			packageJson.contributes.viewsContainers.activitybar = [
				{
					id: "goodloops-dev-ActivityBar",
					title: "Goodloops Dev",
					icon: "assets/icons/icon.svg",
				},
			]
		}

		if (packageJson.contributes.views) {
			packageJson.contributes.views = {
				"goodloops-dev-ActivityBar": [
					{
						type: "webview",
						id: "goodloops-dev.SidebarProvider",
						name: "",
					},
				],
			}
		}
		// Update menus
		if (packageJson.contributes.menus && packageJson.contributes.menus["view/title"]) {
			packageJson.contributes.menus["view/title"].forEach((item) => {
				if (item.command.startsWith("cline.")) {
					item.command = item.command.replace("cline.", "goodloops-dev.")
				}
				if (item.when && item.when.includes("claude-dev.SidebarProvider")) {
					item.when = item.when.replace("claude-dev.SidebarProvider", "goodloops-dev.SidebarProvider")
				}
			})
		}

		// Update configuration
		if (packageJson.contributes.configuration) {
			if (packageJson.contributes.configuration.title === "Goodloops Dev") {
				packageJson.contributes.configuration.title = "Goodloops Dev"
			}

			if (packageJson.contributes.configuration.properties) {
				const newProperties = {}

				// Rename all properties from cline.* to goodloops.*
				Object.keys(packageJson.contributes.configuration.properties).forEach((key) => {
					if (key.startsWith("cline.")) {
						const newKey = key.replace("cline.", "goodloops.")
						newProperties[newKey] = packageJson.contributes.configuration.properties[key]
					} else {
						newProperties[key] = packageJson.contributes.configuration.properties[key]
					}
				})

				packageJson.contributes.configuration.properties = newProperties
			}
		}
	}

	return JSON.stringify(packageJson, null, 2) + "\n"
}
