# My JavaScript MCP Server

A Model Context Protocol (MCP) server built with JavaScript that provides basic tools and resources.

## Features

### Tools
- **echo**: Echo back any message
- **calculate**: Perform basic arithmetic operations (add, subtract, multiply, divide)
- **get_system_info**: Get basic system information

### Resources
- **package.json**: Access to the server's package configuration

## Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Server
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

### Testing with MCP Inspector
You can test your server using the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector node server.js
```

## Configuration

This server runs on stdio transport, which means it communicates through standard input/output. This is the most common way to run MCP servers.

## Example Usage

Once connected to an MCP client, you can:

1. **Echo a message**:
   - Tool: `echo`
   - Parameters: `{"message": "Hello, World!"}`

2. **Perform calculations**:
   - Tool: `calculate`
   - Parameters: `{"operation": "add", "a": 5, "b": 3}`

3. **Get system information**:
   - Tool: `get_system_info`
   - Parameters: `{}`

4. **Read resources**:
   - Resource: `file://package.json`

## Extending the Server

To add new tools or resources:

1. Add tool definitions to the `ListToolsRequestSchema` handler
2. Add tool logic to the `CallToolRequestSchema` handler
3. Add resource definitions to the `ListResourcesRequestSchema` handler
4. Add resource reading logic to the `ReadResourceRequestSchema` handler

## Error Handling

The server includes proper error handling for:
- Division by zero in calculations
- Unknown tools and resources
- File reading errors
- Graceful shutdown on SIGINT
