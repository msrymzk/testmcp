import { Prompt } from '@modelcontextprotocol/sdk/types.js';

export const promptTemplates: Prompt[] = [
  {
    name: 'calculate',
    description: 'Perform a calculation with explanation',
    arguments: [
      {
        name: 'operation',
        description: 'The mathematical operation to perform',
        required: true
      },
      {
        name: 'numbers',
        description: 'Comma-separated list of numbers',
        required: true
      }
    ]
  },
  {
    name: 'explain-math',
    description: 'Explain a mathematical concept or operation',
    arguments: [
      {
        name: 'concept',
        description: 'The mathematical concept to explain',
        required: true
      },
      {
        name: 'level',
        description: 'Target difficulty level (beginner, intermediate, advanced)',
        required: false
      }
    ]
  },
  {
    name: 'help',
    description: 'Get help with using this MCP server',
    arguments: []
  }
];

export async function handlePromptRequest(name: string, args: Record<string, string>) {
  switch (name) {
    case 'calculate':
      const { operation, numbers } = args;
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text',
              text: `Please perform the ${operation} operation on these numbers: ${numbers}. 
              
Use the available calculator tools to perform the calculation and provide a step-by-step explanation of the process.`
            }
          }
        ]
      };

    case 'explain-math':
      const { concept, level = 'beginner' } = args;
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text',
              text: `Please explain the mathematical concept "${concept}" at a ${level} level.

Include:
1. A clear definition
2. Examples where applicable
3. Common use cases or applications
4. Any related concepts that might be helpful to understand`
            }
          }
        ]
      };

    case 'help':
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text',
              text: `This is a test MCP server. Here's what you can do:

TOOLS AVAILABLE:
- add: Add two numbers
- subtract: Subtract two numbers  
- multiply: Multiply two numbers
- divide: Divide two numbers

RESOURCES AVAILABLE:
- test://server-info: Information about this server
- test://capabilities: Server capabilities and features
- test://sample-data: Sample calculation data

PROMPTS AVAILABLE:
- calculate: Perform calculations with explanation
- explain-math: Get explanations of mathematical concepts
- help: Show this help message

You can use these tools and resources to test MCP functionality.`
            }
          }
        ]
      };

    default:
      throw new Error(`Prompt template not found: ${name}`);
  }
}