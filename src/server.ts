import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CreateMessageRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { calculatorTools, handleCalculatorTool } from './tools/calculator.js';
import { staticResources, handleResourceRequest } from './resources/static.js';
import { promptTemplates, handlePromptRequest } from './prompts/templates.js';
import { handlePreprocessing, defaultPreprocessingConfig } from './prompts/preprocessing.js';
import { mcpLogger } from './utils/logger.js';

class TestMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'test-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          sampling: {}
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: calculatorTools
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (calculatorTools.some(tool => tool.name === name)) {
        return await handleCalculatorTool(name, args);
      }
      
      throw new Error(`Tool not found: ${name}`);
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: staticResources
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      return await handleResourceRequest(uri);
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: promptTemplates
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await handlePromptRequest(name, args || {});
    });

    this.server.setRequestHandler(CreateMessageRequestSchema, async (request) => {
      mcpLogger.info('Received sampling request');
      
      const processedRequest = await handlePreprocessing(request, defaultPreprocessingConfig);
      
      mcpLogger.info('Preprocessing completed', {
        originalMessages: request.params.messages?.length || 0,
        processedMessages: processedRequest.params.messages?.length || 0
      });
      
      return {
        model: processedRequest.params.model,
        messages: processedRequest.params.messages,
        ...processedRequest.params
      };
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    mcpLogger.info('Test MCP Server started successfully');
    mcpLogger.info('Server capabilities enabled', {
      tools: ['add', 'subtract', 'multiply', 'divide'],
      resources: ['server-info', 'capabilities', 'sample-data'],
      prompts: ['calculate', 'explain-math', 'help'],
      sampling: 'Prompt preprocessing enabled',
      logFile: mcpLogger.getLogFilePath()
    });
    
    console.error('Test MCP Server running on stdio');
    console.error('Server capabilities:');
    console.error('- Tools: Calculator operations (add, subtract, multiply, divide)');
    console.error('- Resources: Server info, capabilities, sample data');
    console.error('- Prompts: Calculate, explain-math, help');
    console.error('- Sampling: Prompt preprocessing enabled');
    console.error(`- Logs: ${mcpLogger.getLogFilePath()}`);
  }
}

async function main() {
  const server = new TestMCPServer();
  await server.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}