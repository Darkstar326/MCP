#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create the server
const server = new Server(
  {
    name: 'my-javascript-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'echo',
        description: 'Echo back the input message',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to echo back',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'calculate',
        description: 'Perform basic arithmetic calculations',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['add', 'subtract', 'multiply', 'divide'],
              description: 'The arithmetic operation to perform',
            },
            a: {
              type: 'number',
              description: 'First number',
            },
            b: {
              type: 'number',
              description: 'Second number',
            },
          },
          required: ['operation', 'a', 'b'],
        },
      },
      {
        name: 'get_system_info',
        description: 'Get basic system information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'echo':
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${args.message}`,
          },
        ],
      };
      
    case 'calculate':
      let result;
      switch (args.operation) {
        case 'add':
          result = args.a + args.b;
          break;
        case 'subtract':
          result = args.a - args.b;
          break;
        case 'multiply':
          result = args.a * args.b;
          break;
        case 'divide':
          if (args.b === 0) {
            throw new Error('Division by zero is not allowed');
          }
          result = args.a / args.b;
          break;
        default:
          throw new Error(`Unknown operation: ${args.operation}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `${args.a} ${args.operation} ${args.b} = ${result}`,
          },
        ],
      };
      
    case 'get_system_info':
      const os = await import('os');
      const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: os.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      };
      
      return {
        content: [
          {
            type: 'text',
            text: `System Information:\n${JSON.stringify(systemInfo, null, 2)}`,
          },
        ],
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'file://package.json',
        name: 'Package Configuration',
        description: 'The package.json file for this MCP server',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'file://package.json') {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile('package.json', 'utf-8');
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read package.json: ${error.message}`);
    }
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // This will be logged to stderr so it doesn't interfere with the MCP protocol
  console.error('JavaScript MCP Server running on stdio');
}

// Handle errors
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});