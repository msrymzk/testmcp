import { Resource } from '@modelcontextprotocol/sdk/types.js';

export const staticResources: Resource[] = [
  {
    uri: 'test://server-info',
    name: 'Server Information',
    description: 'Basic information about this test MCP server',
    mimeType: 'text/plain'
  },
  {
    uri: 'test://capabilities',
    name: 'Server Capabilities',
    description: 'List of capabilities provided by this server',
    mimeType: 'application/json'
  },
  {
    uri: 'test://sample-data',
    name: 'Sample Data',
    description: 'Sample data for testing purposes',
    mimeType: 'application/json'
  }
];

export async function handleResourceRequest(uri: string) {
  switch (uri) {
    case 'test://server-info':
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: `Test MCP Server v1.0.0

This is a simple test server for the Model Context Protocol.
It provides basic calculator tools, static resources, and prompt templates.

Features:
- Calculator operations (add, subtract, multiply, divide)
- Static resource serving
- Prompt templates for common tasks

Created for testing MCP functionality.`
        }]
      };

    case 'test://capabilities':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            tools: ['add', 'subtract', 'multiply', 'divide'],
            resources: ['server-info', 'capabilities', 'sample-data'],
            prompts: ['calculate', 'explain-math', 'help'],
            version: '1.0.0',
            protocol: 'MCP'
          }, null, 2)
        }]
      };

    case 'test://sample-data':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            numbers: [1, 2, 3, 4, 5],
            operations: ['addition', 'subtraction', 'multiplication', 'division'],
            examples: [
              { operation: 'add', a: 5, b: 3, result: 8 },
              { operation: 'multiply', a: 4, b: 7, result: 28 },
              { operation: 'divide', a: 15, b: 3, result: 5 }
            ],
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}