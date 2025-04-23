# System Message Position Codemod

This codemod modifies the position of the system message in OpenRouter API requests.

## Changes

- Moves the system message from the beginning to the end of the openAiMessages array in `src/api/transform/openrouter-stream.ts`
- Updates references to system message from index `[0]` to index `[openAiMessages.length - 1]` to maintain proper functionality

## Purpose

Placing the system message at the end of the messages array can help improve model behavior in certain contexts by making the system instructions more recent in the context window.

## Implementation

The codemod transforms this pattern:

```typescript
let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  { role: "system", content: systemPrompt },
  ...convertToOpenAiMessages(messages),
];

// Later code that operates on the system message
openAiMessages[0] = { ... };
```

To this pattern:

```typescript
let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  ...convertToOpenAiMessages(messages),
  { role: "system", content: systemPrompt },
];

// Updated reference to system message at the end of the array
openAiMessages[openAiMessages.length - 1] = { ... };
```

## Bug Fixes

This codemod fixes an issue where moving the system message to the end of the array without updating the references would cause the first user message (task description) to be inadvertently overwritten by system message modifications. This ensures the task message is preserved in the conversation.
