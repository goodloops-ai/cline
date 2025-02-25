# Cline Codemods

This directory contains codemods that are applied to the upstream Cline codebase to add custom functionality.

## Overview

The codemod system allows for maintaining a fork of Cline with custom modifications that can be easily applied to new upstream releases. This approach makes it easier to:

1. Track upstream changes
2. Apply custom modifications consistently
3. Maintain a clean separation between upstream code and custom modifications
4. Document and organize modifications by feature

## Usage

To apply all enabled codemods to a fresh checkout of the upstream codebase:

```bash
# Clone the upstream repository
git clone https://github.com/saoudrizwan/cline.git
cd cline

# Checkout the desired release tag
git checkout v1.x.x

# Copy the codemods directory into the cloned repository (if not already present)
# cp -r /path/to/your/codemods ./codemods

# Install dependencies (fs-extra and ts-morph are required by the apply script)
npm install fs-extra ts-morph

# Apply the codemods
node codemods/apply.js
```

## Configuration

The `config.json` file in the codemods directory controls which codemods are applied:

```json
{
  "enabledMods": ["xson"]
}
```

To disable a codemod, simply remove it from the `enabledMods` array.

## Available Codemods

### XSON

Adds XML-based structured object notation (XSON) support to Cline. This provides better handling of multiline text and special characters in MCP tool arguments.

Changes include:
- Adding `src/utils/xson.ts` utility file
- Adding JSDOM patch for esbuild
- Modifying `src/core/Cline.ts` to support XSON parsing
- Updating `src/core/prompts/system.ts` to include XSON documentation

## Adding New Codemods

To add a new codemod:

1. Create a new directory under `codemods/mods/` for your codemod
2. Implement an `index.js` with an `apply(rootDir)` function
3. Add any files to be copied in an `add-files/` subdirectory
4. Add any file transformations in a `transforms/` subdirectory
5. Add your codemod name to the `enabledMods` array in `config.json`
6. Document your codemod in this README.md file

## Release Process

### Manual Process

1. Clone the upstream repository
2. Checkout the latest release tag
3. Copy your `codemods` directory into the cloned repository (if not already present)
4. Run `node codemods/apply.js` to apply all your modifications
5. Build and test the modified codebase
6. Create a new release tag for your fork

### Automated Process

This repository includes GitHub Actions workflows that automate the sync process with the upstream repository:

1. **Upstream Release Webhook** (`.github/workflows/upstream-release-webhook.yml`): 
   - Runs daily to check for new releases in the upstream "cline/cline" repository
   - When a new release is detected, it triggers the Sync Upstream Release workflow

2. **Sync Upstream Release** (`.github/workflows/sync-upstream-release.yml`):
   - Fetches and checks out the new tag from the upstream repository
   - Creates a new branch based on that tag
   - Applies the codemods
   - Commits the changes and creates a pull request

After the pull request is merged, you can use the existing "Publish Release" workflow to publish a new release.

You can also manually trigger the Sync Upstream Release workflow from the GitHub Actions tab, optionally specifying a specific tag to sync.
