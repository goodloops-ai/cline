# Claude 3.7 Thinking Mode Codemod

This codemod adds support for the `claude-3.7-sonnet:thinking` model variant with both computer use and vision capabilities.

## Changes

- Adds `claude-3.7-sonnet:thinking` to the `anthropicModels` object in `src/shared/api.ts`
  - Sets `supportsImages: true` to enable vision capabilities
  - Sets `supportsComputerUse: true` to enable browser tool functionality
  - Sets `supportsPromptCache: true` with appropriate pricing
- Adds `anthropic/claude-3.7-sonnet:thinking` to the OpenRouter model switch statement in `src/core/webview/ClineProvider.ts`

## Usage

Enable this codemod by adding "claude37thinking" to the `enabledMods` array in `codemods/config.json`:

```json
{
  "enabledMods": ["fork", "xson", "claude37thinking"]
}
```

Then run the apply script:

```bash
node codemods/apply.js
