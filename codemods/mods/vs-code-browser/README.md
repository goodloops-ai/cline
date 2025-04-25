# VSCode Browser Link Codemod

This codemod implements a feature that opens links in VSCode's Simple Browser instead of the system browser.

## Features

1. **Component Enhancement**: Adds an anchor tag component to `MarkdownBlock.tsx` that opens links in VSCode's Simple Browser
2. **Message Type**: Adds the `openInVsCodeBrowser` message type to `WebviewMessage.ts` 
3. **Message Handler**: Adds a handler in the Controller to process `openInVsCodeBrowser` messages

## How it Works

When a user clicks a link in the Cline markdown content:
1. The anchor tag component prevents the default behavior and stops event propagation
2. The component sends an `openInVsCodeBrowser` message with the URL
3. The Controller receives this message and opens the URL in VSCode's Simple Browser

## Why Use VSCode's Simple Browser?

VSCode's Simple Browser provides several advantages over the system browser:
- Content stays within the VS Code environment
- Consistent experience across operating systems
- Better integration with Cline workflow

## Implementation Details

### Add Message Type to WebviewMessage
Adds `openInVsCodeBrowser` to the `WebviewMessage` type union.

### Add Anchor Component to MarkdownBlock
Adds a custom React component to handle links, capturing click events and preventing default behavior.

### Add Message Handler to Controller
Adds a case to the Controller's message handler to process `openInVsCodeBrowser` messages and open the URL in VSCode's Simple Browser.

## Usage

This feature is implemented transparently to the user - any link clicked within Cline's markdown content will automatically open in VSCode's Simple Browser rather than the system default browser.
