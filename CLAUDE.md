# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a fully implemented MCP (Model Context Protocol) test server written in TypeScript. The repository is located at `/Users/yama/Documents/src/testmcp` and is a git repository with the main branch.

### Technology Stack
- Node.js 18+ with TypeScript 5+
- @modelcontextprotocol/sdk ^1.0.0
- JSON-RPC 2.0 based communication

### Project Structure
```
src/
├── server.ts              # Main MCP server implementation
├── tools/
│   └── calculator.ts      # Calculator tool implementations
├── resources/
│   └── static.ts         # Static resource handlers
├── prompts/
│   ├── templates.ts      # Prompt templates
│   └── preprocessing.ts  # Automatic prompt preprocessing
└── utils/
    └── logger.ts         # MCP logging utilities
```

### Features
- **Tools**: Calculator operations (add, subtract, multiply, divide)
- **Resources**: Server info, capabilities, and sample data
- **Prompts**: Calculate, explain-math, and help templates
- **Sampling**: Automatic prompt preprocessing for Claude Desktop
- **Logging**: Comprehensive MCP logging with file output

## Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Start the server
npm start

# Development mode (build + start)
npm run dev

# Watch mode for development
npm run watch
```

## MCP Server Usage

### With Claude Desktop
The server is configured for Claude Desktop at:
- Config: `~/Library/Application Support/Claude/config.json`
- Command: `node /Users/yama/Documents/src/testmcp/dist/server.js`

### Log Monitoring
```bash
# View logs with utility
node view-logs.js

# Watch logs in real-time
node view-logs.js --watch

# Log file location
/Users/yama/.mcp-logs/mcp-server.log
```

## Code Conventions

- Use TypeScript with strict typing
- Follow existing patterns in tool/resource/prompt handlers
- All MCP operations should include proper error handling
- Use the mcpLogger utility for consistent logging
- Tools should validate input parameters before processing