# Publisher Codemod

This codemod updates the package.json file to set Goodloops-specific publisher information.

## Changes Made

The codemod makes the following changes to `package.json`:

- Sets `author` to "Goodloops Inc"
- Sets `publisher` to "goodloops"
- Sets `name` to "goodloops-cline"
- Sets `displayName` to "Goodloops Cline"

## Usage

The codemod will be applied automatically when running the codemods script if enabled in `config.json`.

To run manually:

```bash
node apply.js [project-root]
``` 