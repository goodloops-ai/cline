# Replace System Prompt Codemod

This codemod replaces the default system prompt in Cline with a custom version that identifies as "Goodloops Dev".

## Purpose

The system prompt is what establishes the AI assistant's identity, capabilities, and behavior. By replacing the default system prompt, we can:

1. Change the assistant's name from "Cline" to "Goodloops Dev"
2. Modify or extend the assistant's instructions and capabilities
3. Customize the tool documentation and examples

## Customization

To customize the system prompt further, edit the file at:
`codemods/mods/replace-system-prompt/add-files/src/core/prompts/system.ts`

The current implementation changes only the assistant's name, but you can expand the prompt string with additional instructions or modify other aspects of the system prompt as needed.

## Usage

After applying this codemod, the Cline extension will use your custom system prompt when interacting with the AI model. This means the assistant will identify itself as "Goodloops Dev" and follow any other custom instructions provided in the prompt.

### Enabling/Disabling

The codemod is enabled by adding "replace-system-prompt" to the `enabledMods` array in `codemods/config.json`:

```json
{
  "enabledMods": [..., "replace-system-prompt"]
}
```

To disable the codemod, simply remove it from the `enabledMods` array.
