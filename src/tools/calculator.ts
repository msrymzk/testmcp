import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const calculatorTools: Tool[] = [
  {
    name: 'add',
    description: 'Add two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' }
      },
      required: ['a', 'b']
    }
  },
  {
    name: 'subtract',
    description: 'Subtract two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' }
      },
      required: ['a', 'b']
    }
  },
  {
    name: 'multiply',
    description: 'Multiply two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' }
      },
      required: ['a', 'b']
    }
  },
  {
    name: 'divide',
    description: 'Divide two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'Dividend' },
        b: { type: 'number', description: 'Divisor' }
      },
      required: ['a', 'b']
    }
  }
];

export async function handleCalculatorTool(name: string, args: any) {
  const { a, b } = args;

  switch (name) {
    case 'add':
      return {
        content: [{ type: 'text', text: `${a} + ${b} = ${a + b}` }]
      };
    case 'subtract':
      return {
        content: [{ type: 'text', text: `${a} - ${b} = ${a - b}` }]
      };
    case 'multiply':
      return {
        content: [{ type: 'text', text: `${a} × ${b} = ${a * b}` }]
      };
    case 'divide':
      if (b === 0) {
        return {
          content: [{ type: 'text', text: 'Error: Division by zero is not allowed' }],
          isError: true
        };
      }
      return {
        content: [{ type: 'text', text: `${a} ÷ ${b} = ${a / b}` }]
      };
    default:
      return {
        content: [{ type: 'text', text: 'Unknown calculator operation' }],
        isError: true
      };
  }
}