# MCP-to-MCP Communication Patterns

## Overview

The Model Context Protocol (MCP) supports server-to-server communication patterns where an MCP server can act as a client to another MCP server.
This enables powerful composition patterns and service chaining.

## Architecture

### Key Components

1. **MCP Client**: Can be embedded within an MCP server to communicate with other servers
2. **MCP Server**: Can host both server capabilities and client connections
3. **Transport Layer**: Supports multiple transport mechanisms (stdio, HTTP/SSE, Streamable HTTP)

### Communication Flow

```
┌─────────────┐     ┌────────────────────────┐     ┌─────────────┐
│   Client    │────▶│   MCP Server A         │────▶│ MCP Server B│
│Application  │     │ (Acts as Client to B)  │     │             │
└─────────────┘     └────────────────────────┘     └─────────────┘
```

## Transport Options

### 1. Stdio Transport (Local Process Communication)
- Best for: Local server-to-server communication
- Use case: When Server A needs to spawn Server B as a subprocess

### 2. Streamable HTTP Transport
- Best for: Remote server-to-server communication
- Features: Session management, resumability, bidirectional streaming
- Use case: Cloud-based MCP servers communicating across networks

### 3. SSE Transport (Server-Sent Events)
- Best for: One-way streaming from server to client
- Use case: Real-time updates, notifications

## Implementation Patterns

### Pattern 1: Basic Server-to-Server Communication

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Server A acts as both server and client
class CompositeServer {
  private server: Server;
  private clientToServerB: Client;
  
  constructor() {
    // Initialize as a server
    this.server = new Server({
      name: "composite-server",
      version: "1.0.0"
    });
    
    // Initialize as a client to Server B
    this.clientToServerB = new Client({
      name: "server-a-client",
      version: "1.0.0"
    });
  }
  
  async start() {
    // Connect to Server B
    const transport = new StreamableHTTPClientTransport(
      new URL("http://server-b:3000/mcp")
    );
    await this.clientToServerB.connect(transport);
    
    // Set up server capabilities that use Server B
    this.server.setRequestHandler("tools/call", async (request) => {
      // Forward request to Server B
      const result = await this.clientToServerB.callTool({
        name: request.params.name,
        arguments: request.params.arguments
      });
      
      return result;
    });
  }
}
```

### Pattern 2: Service Aggregation

```typescript
// Aggregator server that combines multiple MCP services
class AggregatorServer {
  private server: Server;
  private clients: Map<string, Client> = new Map();
  
  async connectToService(name: string, url: string) {
    const client = new Client({
      name: `aggregator-client-${name}`,
      version: "1.0.0"
    });
    
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await client.connect(transport);
    
    this.clients.set(name, client);
  }
  
  async initialize() {
    // Connect to multiple services
    await this.connectToService("weather", "http://weather-service:3000/mcp");
    await this.connectToService("news", "http://news-service:3000/mcp");
    await this.connectToService("stocks", "http://stocks-service:3000/mcp");
    
    // Expose aggregated tools
    this.server.setRequestHandler("tools/list", async () => {
      const allTools = [];
      
      for (const [service, client] of this.clients) {
        const tools = await client.listTools();
        allTools.push(...tools.tools.map(tool => ({
          ...tool,
          name: `${service}:${tool.name}`
        })));
      }
      
      return { tools: allTools };
    });
  }
}
```

### Pattern 3: Chain of Responsibility

```typescript
// Server that processes requests through a chain of MCP servers
class ChainProcessor {
  private server: Server;
  private chain: Client[] = [];
  
  async addToChain(serverUrl: string) {
    const client = new Client({
      name: `chain-client-${this.chain.length}`,
      version: "1.0.0"
    });
    
    const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
    await client.connect(transport);
    
    this.chain.push(client);
  }
  
  async processThrough(data: any) {
    let result = data;
    
    for (const client of this.chain) {
      result = await client.callTool({
        name: "process",
        arguments: { data: result }
      });
    }
    
    return result;
  }
}
```

### Pattern 4: Load Balancing

```typescript
// Load balancer that distributes requests across multiple MCP servers
class LoadBalancerServer {
  private server: Server;
  private backends: Client[] = [];
  private currentIndex = 0;
  
  async addBackend(url: string) {
    const client = new Client({
      name: `backend-client-${this.backends.length}`,
      version: "1.0.0"
    });
    
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await client.connect(transport);
    
    this.backends.push(client);
  }
  
  getNextClient(): Client {
    const client = this.backends[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.backends.length;
    return client;
  }
  
  async initialize() {
    this.server.setRequestHandler("tools/call", async (request) => {
      const client = this.getNextClient();
      return await client.callTool(request.params);
    });
  }
}
```

## Advanced Features

### Session Management

```typescript
// Using session IDs for stateful communication
const transport = new StreamableHTTPClientTransport(
  new URL("http://server:3000/mcp"),
  {
    sessionId: existingSessionId, // Resume existing session
    reconnectionOptions: {
      maxRetries: 5,
      initialReconnectionDelay: 1000,
      maxReconnectionDelay: 30000
    }
  }
);
```

### Authentication

```typescript
// OAuth authentication between servers
import { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";

const authProvider = new OAuthClientProvider({
  clientId: "server-a-client",
  authorizationUrl: "https://auth.example.com/authorize",
  tokenUrl: "https://auth.example.com/token",
  redirectUri: "http://server-a:3000/callback"
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://secured-server:3000/mcp"),
  { authProvider }
);
```

### Error Handling and Resilience

```typescript
class ResilientMcpClient {
  private client: Client;
  private transport: Transport;
  private reconnectAttempts = 0;
  
  async connect(url: string) {
    try {
      this.transport = new StreamableHTTPClientTransport(new URL(url));
      await this.client.connect(this.transport);
      this.reconnectAttempts = 0;
    } catch (error) {
      if (this.reconnectAttempts < 3) {
        this.reconnectAttempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * this.reconnectAttempts));
        return this.connect(url);
      }
      throw error;
    }
  }
  
  async callWithRetry(request: any, maxRetries = 3): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.client.request(request);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
}
```

## Best Practices

1. **Connection Management**
   - Reuse client connections when possible
   - Implement proper cleanup on shutdown
   - Handle reconnection gracefully

2. **Error Handling**
   - Implement circuit breakers for failing services
   - Provide fallback mechanisms
   - Log errors appropriately

3. **Performance**
   - Use connection pooling for high-traffic scenarios
   - Implement caching where appropriate
   - Monitor latency between services

4. **Security**
   - Use authentication between services
   - Validate all inputs
   - Encrypt transport when crossing network boundaries

5. **Observability**
   - Add request tracing
   - Monitor service health
   - Track request/response metrics

## Complete Example: Gateway Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Gateway server that provides unified access to multiple MCP services
class GatewayServer {
  private server: Server;
  private services: Map<string, {
    client: Client,
    url: string,
    capabilities: Set<string>
  }> = new Map();
  
  constructor() {
    this.server = new Server({
      name: "mcp-gateway",
      version: "1.0.0",
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      }
    });
  }
  
  async registerService(name: string, url: string, capabilities: string[]) {
    const client = new Client({
      name: `gateway-to-${name}`,
      version: "1.0.0"
    });
    
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await client.connect(transport);
    
    this.services.set(name, {
      client,
      url,
      capabilities: new Set(capabilities)
    });
    
    console.log(`Registered service: ${name} at ${url}`);
  }
  
  async initialize() {
    // Register backend services
    await this.registerService(
      "weather",
      "http://weather-service:3000/mcp",
      ["tools"]
    );
    
    await this.registerService(
      "documents",
      "http://document-service:3000/mcp",
      ["resources"]
    );
    
    await this.registerService(
      "ai-assistant",
      "http://ai-service:3000/mcp",
      ["prompts", "tools"]
    );
    
    // Set up request routing
    this.setupRequestHandlers();
  }
  
  private setupRequestHandlers() {
    // Route tool requests
    this.server.setRequestHandler("tools/list", async () => {
      const allTools = [];
      
      for (const [serviceName, service] of this.services) {
        if (!service.capabilities.has("tools")) continue;
        
        try {
          const result = await service.client.listTools();
          const prefixedTools = result.tools.map(tool => ({
            ...tool,
            name: `${serviceName}/${tool.name}`,
            description: `[${serviceName}] ${tool.description}`
          }));
          allTools.push(...prefixedTools);
        } catch (error) {
          console.error(`Failed to list tools from ${serviceName}:`, error);
        }
      }
      
      return { tools: allTools };
    });
    
    this.server.setRequestHandler("tools/call", async (request) => {
      const { name, arguments: args } = request.params;
      const [serviceName, toolName] = name.split("/", 2);
      
      const service = this.services.get(serviceName);
      if (!service) {
        throw new Error(`Unknown service: ${serviceName}`);
      }
      
      return await service.client.callTool({
        name: toolName,
        arguments: args
      });
    });
    
    // Route resource requests
    this.server.setRequestHandler("resources/list", async () => {
      const allResources = [];
      
      for (const [serviceName, service] of this.services) {
        if (!service.capabilities.has("resources")) continue;
        
        try {
          const result = await service.client.listResources();
          const prefixedResources = result.resources.map(resource => ({
            ...resource,
            uri: `${serviceName}://${resource.uri}`,
            name: `[${serviceName}] ${resource.name}`
          }));
          allResources.push(...prefixedResources);
        } catch (error) {
          console.error(`Failed to list resources from ${serviceName}:`, error);
        }
      }
      
      return { resources: allResources };
    });
    
    // Route prompt requests
    this.server.setRequestHandler("prompts/list", async () => {
      const allPrompts = [];
      
      for (const [serviceName, service] of this.services) {
        if (!service.capabilities.has("prompts")) continue;
        
        try {
          const result = await service.client.listPrompts();
          const prefixedPrompts = result.prompts.map(prompt => ({
            ...prompt,
            name: `${serviceName}/${prompt.name}`
          }));
          allPrompts.push(...prefixedPrompts);
        } catch (error) {
          console.error(`Failed to list prompts from ${serviceName}:`, error);
        }
      }
      
      return { prompts: allPrompts };
    });
  }
  
  async start() {
    await this.initialize();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.log("Gateway server started");
  }
}

// Start the gateway
const gateway = new GatewayServer();
gateway.start().catch(console.error);
```

## Testing MCP-to-MCP Communication

```typescript
// Test harness for MCP-to-MCP communication
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

async function testServerToServer() {
  // Create two servers
  const serverA = new Server({
    name: "server-a",
    version: "1.0.0"
  });
  
  const serverB = new Server({
    name: "server-b",
    version: "1.0.0"
  });
  
  // Server B provides a tool
  serverB.setRequestHandler("tools/list", async () => ({
    tools: [{
      name: "echo",
      description: "Echoes input"
    }]
  }));
  
  serverB.setRequestHandler("tools/call", async (request) => ({
    content: [{
      type: "text",
      text: `Echo: ${request.params.arguments.message}`
    }]
  }));
  
  // Create in-memory transport pair
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  
  // Connect Server B
  await serverB.connect(serverTransport);
  
  // Server A acts as client to Server B
  const clientInA = new Client({
    name: "server-a-as-client",
    version: "1.0.0"
  });
  
  await clientInA.connect(clientTransport);
  
  // Server A exposes a tool that uses Server B
  serverA.setRequestHandler("tools/call", async (request) => {
    if (request.params.name === "enhanced-echo") {
      // Call Server B's echo tool
      const result = await clientInA.callTool({
        name: "echo",
        arguments: { message: request.params.arguments.text }
      });
      
      // Enhance the result
      return {
        content: [{
          type: "text",
          text: `[Enhanced] ${result.content[0].text}`
        }]
      };
    }
  });
  
  // Test the chain
  const [clientToA, serverATransport] = InMemoryTransport.createLinkedPair();
  await serverA.connect(serverATransport);
  
  const testClient = new Client({
    name: "test-client",
    version: "1.0.0"
  });
  
  await testClient.connect(clientToA);
  
  const result = await testClient.callTool({
    name: "enhanced-echo",
    arguments: { text: "Hello MCP!" }
  });
  
  console.log("Result:", result.content[0].text);
  // Output: [Enhanced] Echo: Hello MCP!
}
```
