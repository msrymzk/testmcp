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
import { mcpLogger, logMCPRequest, logMCPResponse } from './utils/logger.js';

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
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('ListTools', request);
      
      try {
        const response = {
          tools: calculatorTools
        };
        
        logMCPResponse('ListTools', requestId, startTime, response);
        return response;
      } catch (error) {
        logMCPResponse('ListTools', requestId, startTime, null, error as Error);
        throw error;
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('CallTool', request);
      
      try {
        const { name, arguments: args } = request.params;
        
        if (calculatorTools.some(tool => tool.name === name)) {
          const response = await handleCalculatorTool(name, args);
          logMCPResponse('CallTool', requestId, startTime, response);
          return response;
        }
        
        throw new Error(`Tool not found: ${name}`);
      } catch (error) {
        logMCPResponse('CallTool', requestId, startTime, null, error as Error);
        throw error;
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('ListResources', request);
      
      try {
        const response = {
          resources: staticResources
        };
        
        logMCPResponse('ListResources', requestId, startTime, response);
        return response;
      } catch (error) {
        logMCPResponse('ListResources', requestId, startTime, null, error as Error);
        throw error;
      }
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('ReadResource', request);
      
      try {
        const { uri } = request.params;
        const response = await handleResourceRequest(uri);
        
        logMCPResponse('ReadResource', requestId, startTime, response);
        return response;
      } catch (error) {
        logMCPResponse('ReadResource', requestId, startTime, null, error as Error);
        throw error;
      }
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('ListPrompts', request);
      
      try {
        const response = {
          prompts: promptTemplates
        };
        
        logMCPResponse('ListPrompts', requestId, startTime, response);
        return response;
      } catch (error) {
        logMCPResponse('ListPrompts', requestId, startTime, null, error as Error);
        throw error;
      }
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('GetPrompt', request);
      
      try {
        const { name, arguments: args } = request.params;
        const response = await handlePromptRequest(name, args || {});
        
        logMCPResponse('GetPrompt', requestId, startTime, response);
        return response;
      } catch (error) {
        logMCPResponse('GetPrompt', requestId, startTime, null, error as Error);
        throw error;
      }
    });

    this.server.setRequestHandler(CreateMessageRequestSchema, async (request) => {
      const { requestId, startTime } = logMCPRequest('CreateMessage', request);
      
      try {
        const processedRequest = await handlePreprocessing(request, defaultPreprocessingConfig);
        
        const response = {
          model: processedRequest.params.model,
          messages: processedRequest.params.messages,
          ...processedRequest.params
        };
        
        // 特別なログ情報を追加
        mcpLogger.info(`[${requestId}] Preprocessing details`, {
          requestId,
          originalMessages: request.params.messages?.length || 0,
          processedMessages: processedRequest.params.messages?.length || 0,
          model: processedRequest.params.model
        });
        
        logMCPResponse('CreateMessage', requestId, startTime, response);
        return response;
      } catch (error) {
        logMCPResponse('CreateMessage', requestId, startTime, null, error as Error);
        throw error;
      }
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