# Fork Codemod

This codemod transforms the Cline extension to allow side-by-side installation with the original extension. It renames identifiers and references to create a separate extension that can be installed alongside the original, while preserving class names and exports to minimize codebase changes.

## Changes Made

The codemod makes the following changes:

### Package Identity
- Changes `name` from "claude-dev" to "goodloops-dev"
- Changes `displayName` from "Cline" to "Goodloops Dev"
- Changes `publisher` from "saoudrizwan" to "goodloops"
- Updates `author` information
- Updates repository URL and homepage

### Extension Identifiers
- Updates view container ID from "claude-dev-ActivityBar" to "goodloops-dev-ActivityBar"
- Updates view provider ID from "claude-dev.SidebarProvider" to "goodloops-dev.SidebarProvider"
- Updates tab panel ID from "claude-dev.TabPanelProvider" to "goodloops-dev.TabPanelProvider"
- Updates command prefixes from "cline." to "goodloops."
- Updates configuration properties from "cline." to "goodloops."

### Branding and UI Text
- Updates notification titles and messages
- Updates log messages
- Updates HTTP headers and URLs
- Updates directory paths (e.g., "Documents/Cline/" to "Documents/Goodloops/")

### System Prompt
- Updates branding references in the system prompt

## Preserved Elements

To minimize codebase changes, the following elements are preserved:

- Class names (e.g., `ClineProvider` remains unchanged)
- Export names
- Internal variable names
- Function names

This approach ensures that the extension can be installed side-by-side with the original while minimizing the risk of breaking changes.

## Global Search and Replace

In addition to specific file transformations, the codemod performs a global search and replace across all source files to update:

- Extension identifiers
- Publisher references
- Command prefixes (only in specific contexts like command registrations)
- URLs and paths
- Notification titles and text
- HTTP headers

The codemod is careful to avoid replacing internal class properties and method references, ensuring that the extension's code structure remains intact.

## Usage

The codemod will be applied automatically when running the codemods script if enabled in `config.json`.

To run manually:

```bash
node apply.js [project-root]
```

## Note on Assets

This codemod does not modify or create new icon assets. You will need to create your own icon assets and place them in the appropriate directories:

- `assets/icons/icon.svg`
- `assets/icons/icon.png`
- `assets/icons/robot_panel_dark.png`
- `assets/icons/robot_panel_light.png`
