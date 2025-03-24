# Memory Command System

A simple command system for storing and retrieving information, performing analysis, and generating plans.

## Features

- `/remember` - Store information with categorization
- `/recall` - Retrieve stored information through querying
- `/analyze` - Assess a target (code, text, etc.) against specific goals
- `/plan` - Generate step-by-step plans based on goals and targets
- `/list` - Display stored information by type

## Architecture

The system is built with a modular architecture:

- **Foundation Layer**: Command parsing and routing
- **Storage Adapters**: ChromaDB for vector search and Neo4j for knowledge graph
- **Command Handlers**: Specialized handlers for each command type

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and update with your configuration:
   ```
   cp .env.example .env
   ```
4. Make sure you have Chroma DB and Neo4j running locally or update the connection settings in `.env`

## Running the Application

Start the application with:

```
npm start
```

Use the `/help` command to see available commands.

## Usage Examples

### Remember Information

```
/remember git "git reset --hard HEAD^ will discard the most recent commit"
```

### Recall Information

```
/recall git reset
```

or

```
/recall git
```

### Analyze Code

```
/analyze src/index.js refactor
```

### Generate a Plan

```
/plan refactor src/index.js
```

### List Stored Information

```
/list git
```

or

```
/list all
```

## Development

### Project Structure

- `src/foundation/` - Core functionality (parsing, routing)
- `src/storage/` - Storage adapters
- `src/commands/` - Command handlers
- `src/index.js` - Main application

### Testing

Run tests with:

```
npm test
```

## Dependencies

- Node.js 18+
- Chroma DB
- Neo4j
- Various NPM packages (see package.json)

## Future Enhancements

- Natural language support for commands
- Web interface
- IDE integrations
- More sophisticated analysis capabilities
