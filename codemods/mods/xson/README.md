# XSON Codemod

This codemod adds XML-based structured object notation (XSON) support to Cline. XSON provides better handling of multiline text and special characters in MCP tool arguments.

## Overview

XSON is a simple XML-based format for representing structured data that can be reliably round-tripped between XML and JSON. It is designed to handle multiline text and special characters gracefully without escaping issues.

## Changes

This codemod makes the following changes to the Cline codebase:

1. **Adds new files:**
   - `src/utils/xson.ts`: Utility functions for converting between XSON and JavaScript objects
   - `esbuild-jsdom-patch.js`: Patch for JSDOM to work with esbuild

2. **Modifies existing files:**
   - `src/core/Cline.ts`: Adds XSON parsing support for MCP arguments
   - `src/core/prompts/system.ts`: Adds XSON documentation to the system prompt
   - `esbuild.js`: Adds JSDOM patch to the build process

## Implementation Details

### XSON Format

XSON uses XML to represent structured data with the following features:
- Each element has a "type" attribute indicating its data type
- String values are wrapped in CDATA sections to preserve special characters and formatting
- Arrays use indexed `<item>` elements to maintain order
- Objects use named elements for properties

### Configuration

The XSON support is controlled by a configuration option in VS Code settings:

```json
{
  "cline.useXsonParser": true
}
```

When enabled, MCP tool arguments can be provided in XSON format instead of JSON.

## Dependencies

This codemod requires the following npm packages:
- `xmlbuilder2`: For creating XML documents
- `jsdom`: For parsing XML

These dependencies should be added to the project's package.json.
