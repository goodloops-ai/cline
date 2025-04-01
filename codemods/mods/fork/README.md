# Fork Codemod

This codemod transforms the Cline extension to allow side-by-side installation with the original extension. It renames identifiers and references to create a separate extension that can be installed alongside the original, while preserving class names and exports to minimize codebase changes.

## Changes Made

The codemod makes the following changes:

### Package Identity
- Changes `name` from "claude-dev" to "goodloops-dev"
- Changes `displayName` from "Goodloops Dev" to "Goodloops Dev"
- Changes `publisher` from "saoudrizwan" to "goodloops"
- Updates `author` information
- Updates repository URL and homepage

### Extension Identifiers
- Updates view container ID from "goodloops-dev-ActivityBar" to "goodloops-dev-ActivityBar"
- Updates view provider ID from "goodloops-dev.SidebarProvider" to "goodloops-dev.SidebarProvider"
- Updates tab panel ID from "goodloops-dev.TabPanelProvider" to "goodloops-dev.TabPanelProvider"
- Updates command prefixes from "cline." to "goodloops."
- Updates configuration properties from "cline." to "goodloops."

### Branding and UI Text
- Updates notification titles and messages
- Updates log messages
- Updates HTTP headers and URLs
- Updates directory paths (e.g., "Documents/Goodloops/" to "Documents/Goodloops/")

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

## Assets

The codemod will copy any files from the `add-files` directory to the target project. This includes:

- Custom icon assets in `add-files/assets/icons/`
- Any other files you place in the `add-files` directory

To customize the icon assets:

1. Place your custom icon files in the `add-files/assets/icons/` directory:
   - `icon.svg` - Vector version of the main icon
   - `icon.png` - Main icon (128x128 pixels)
   - `robot_panel_dark.png` - Icon for the sidebar in dark theme
   - `robot_panel_light.png` - Icon for the sidebar in light theme

2. Run the codemod, and these files will be automatically copied to the appropriate locations in the target project.
