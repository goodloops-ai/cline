# System Message Position Codemod

This codemod modifies the position of the system message in OpenRouter API requests.

## Changes

- Moves the system message from the beginning to the end of the openAiMessages array in `src/api/transform/openrouter-stream.ts`

## Purpose

Placing the system message at the end of the messages array can help improve model behavior in certain contexts by making the system instructions more recent in the context window.

## Implementation

The codemod transforms this pattern:

```typescript
let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  { role: "system", content: systemPrompt },
  ...convertToOpenAiMessages(messages),
];
```

To this pattern:

```typescript
let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  ...convertToOpenAiMessages(messages),
  { role: "system", content: systemPrompt },
];
