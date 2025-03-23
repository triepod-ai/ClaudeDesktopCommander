# Documentation Metadata System

This system provides a centralized way to manage and locate documentation for all tools and features in the Claude Desktop Commander.

## Overview

The documentation metadata system consists of:

1. A central metadata repository that tracks all documentation files
2. Helper functions for finding and accessing documentation
3. Command-line tools for quickly locating documentation
4. Scripts for generating a documentation hub and keeping metadata up-to-date

## Usage

### Finding Documentation for a Tool

To find documentation for a specific tool, use the CLI:

```bash
npm run docs:find tool code_analyzer
```

This will show all documentation files related to the `code_analyzer` tool.

### Listing All Available Tools

To see a list of all available tools:

```bash
npm run docs:find list
```

### Generating a Documentation Hub

To generate a central documentation hub page:

```bash
npm run docs:hub
```

This will create a `DOCUMENTATION_HUB.md` file that provides links to all documentation organized by tool.

### Updating Metadata

To update the metadata with the latest file modification dates:

```bash
npm run docs:update
```

This will scan the file system and update the `lastUpdated` dates in the metadata.

## Programmatic Usage

You can also use the documentation metadata system programmatically in your code:

```typescript
import { 
  findDocumentationForTool, 
  getDocumentationDetails 
} from './src/utils/documentation-helper';

// Find docs for a specific tool
const codeDocs = findDocumentationForTool('code_analyzer');
console.log(codeDocs); // ['MCP_TOOLS_INVENTORY.md', 'CODE_ANALYZER_SETUP.md', ...]

// Get details about a specific doc file
const details = getDocumentationDetails('CODE_ANALYZER_SETUP.md');
console.log(details?.description); // "Detailed setup guide for the enhanced code analyzer..."
```

## Integration with Claude

When working with Claude, you can provide this metadata at the beginning of your session to help Claude better understand where to find information about specific tools. This helps Claude provide more accurate information and references.

Example prompt:

```
I'm working with the Claude Desktop Commander. Here's the metadata about where to find documentation for different tools:

[Include the toolDocumentationMap here]

Using this information, can you tell me where I can find documentation about the code_analyzer tool?
```

## Maintaining the System

To ensure the documentation metadata stays up-to-date:

1. Run `npm run docs:update` periodically to update file modification dates
2. When adding new documentation, add it to the metadata in `src/utils/documentation-metadata.ts`
3. When documenting new tools, update the `toolDocumentationMap` object

## File Structure

- `src/utils/documentation-metadata.ts` - Contains the core metadata
- `src/utils/documentation-helper.ts` - Helper functions for working with the metadata
- `src/scripts/find-docs.ts` - CLI tool for finding documentation
- `src/scripts/generate-docs-hub.ts` - Script for generating the documentation hub
- `src/scripts/update-metadata.ts` - Script for updating metadata based on file system