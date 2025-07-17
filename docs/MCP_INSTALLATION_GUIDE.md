# MCP Server Installation & Integration Guide

## Overview

ChartGenie integrates with **Model Context Protocol (MCP) servers** to provide enhanced chart suggestions powered by AI. The MCP integration enables more intelligent chart recommendations, advanced configuration options, and contextual insights about your data visualization choices.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol that allows applications to connect to AI models and services. In ChartGenie, MCP integration provides:

- **AI-Enhanced Chart Suggestions**: More intelligent recommendations based on data analysis
- **Advanced Chart Configurations**: Complex ECharts configurations with optimal settings
- **Data Insights**: Contextual analysis of your data for better visualization choices
- **Dynamic Recommendations**: Suggestions that adapt to your specific data patterns

## Architecture

```
ChartGenie App
    ↓
MCPEChartsService
    ↓
MCP SDK (@modelcontextprotocol/sdk)
    ↓
MCP ECharts Server (External)
    ↓
AI Model (LLM)
```

## Installation & Setup

### 1. Dependencies Installation

ChartGenie already includes the MCP SDK dependency:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.15.1"
  }
}
```

### 2. MCP ECharts Server Setup

#### Option A: Using Claude Desktop (Recommended)

1. **Install Claude Desktop** from Anthropic
2. **Configure MCP in Claude Desktop**:
   ```json
   {
     "mcpServers": {
       "echarts": {
         "command": "npx",
         "args": ["@anthropic-ai/mcp-echarts"],
         "env": {}
       }
     }
   }
   ```

#### Option B: Standalone MCP Server

1. **Install MCP ECharts Server**:

   ```bash
   npm install -g @anthropic-ai/mcp-echarts
   ```

2. **Start the MCP Server**:
   ```bash
   mcp-echarts --port 3001
   ```

#### Option C: Custom MCP Server

Create your own MCP server with chart generation capabilities:

```typescript
// server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "echarts-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add chart generation tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_chart_suggestions",
        description: "Generate intelligent chart suggestions based on data",
        inputSchema: {
          type: "object",
          properties: {
            data: { type: "object" },
            preferences: { type: "object" },
          },
        },
      },
    ],
  };
});
```

### 3. Environment Configuration

#### Development Environment

Create `.env.local` file:

```env
# MCP Configuration
MCP_ECHARTS_ENABLED=true
MCP_ECHARTS_SERVER_URL=http://localhost:3001
MCP_ECHARTS_TIMEOUT=5000

# Development settings
VITE_MCP_DEBUG=true
```

#### Production Environment

```env
# MCP Configuration
MCP_ECHARTS_ENABLED=true
MCP_ECHARTS_SERVER_URL=https://your-mcp-server.com
MCP_ECHARTS_TIMEOUT=10000
```

### 4. ChartGenie Configuration

Update the MCP service configuration in your app:

```typescript
// src/utils/mcpEChartsService.ts
const mcpConfig = {
  enabled: true, // Set to false to disable MCP
  serverUrl: process.env.MCP_ECHARTS_SERVER_URL,
  timeout: parseInt(process.env.MCP_ECHARTS_TIMEOUT || "5000"),
  debug: process.env.VITE_MCP_DEBUG === "true",
};

export const mcpEChartsService = new MCPEChartsService(mcpConfig);
```

## Usage

### 1. Basic Integration

The MCP integration works automatically when enabled:

```typescript
// Chart suggestions with MCP enhancement
const suggestions = await generateChartSuggestions(parsedData);

// Suggestions marked with aiEnhanced: true come from MCP
const aiSuggestions = suggestions.filter((s) => s.aiEnhanced);
```

### 2. Manual MCP Calls

You can also call MCP services directly:

```typescript
import { mcpEChartsService } from "./utils/mcpEChartsService";

// Initialize MCP connection
await mcpEChartsService.initialize();

// Get enhanced suggestions
const suggestions = await mcpEChartsService.generateEnhancedSuggestions(data);

// Generate advanced chart configuration
const chartConfig = await mcpEChartsService.generateEChartsConfig(
  suggestion,
  data
);

// Get data insights
const insights = await mcpEChartsService.generateDataInsights(data);
```

### 3. Configuration Options

```typescript
const mcpService = new MCPEChartsService({
  enabled: true,
  serverUrl: "http://localhost:3001",
  timeout: 5000,
  retries: 3,
  fallbackEnabled: true, // Use local suggestions if MCP fails
  debug: true, // Enable debug logging
});
```

## Features

### 1. AI-Enhanced Chart Suggestions

```typescript
interface ChartSuggestion {
  type: string;
  title: string;
  description: string;
  confidence: number; // 0-100, higher with MCP
  reasoning: string; // AI-generated explanation
  useCase: string; // When to use this chart
  complexity: "simple" | "intermediate" | "advanced";
  aiEnhanced: boolean; // True for MCP suggestions
  preview?: string; // AI-generated preview description
}
```

### 2. Advanced Chart Configuration

MCP can generate complex ECharts configurations:

```typescript
const chartConfig = await mcpEChartsService.generateEChartsConfig(
  suggestion,
  data
);
// Returns optimized ECharts option with:
// - Advanced styling
// - Accessibility features
// - Performance optimizations
// - Interactive elements
```

### 3. Data Insights

```typescript
const insights = await mcpEChartsService.generateDataInsights(data);
// Returns:
// - Data quality assessment
// - Pattern detection
// - Visualization recommendations
// - Best practices suggestions
```

## Error Handling & Fallbacks

ChartGenie includes comprehensive fallback mechanisms:

### 1. Automatic Fallback

```typescript
// MCP failure automatically falls back to local suggestions
try {
  const mcpSuggestions = await mcpEChartsService.generateEnhancedSuggestions(
    data
  );
  return mcpSuggestions;
} catch (error) {
  console.warn("MCP unavailable, using local suggestions:", error);
  return generateLocalSuggestions(data);
}
```

### 2. Graceful Degradation

- **MCP Unavailable**: Falls back to local algorithm-based suggestions
- **Partial Failure**: Uses available MCP features with local fallbacks
- **Timeout**: Implements timeout protection with fallback
- **Network Issues**: Offline mode with cached suggestions

### 3. User Experience

- **Transparent Operation**: Users get suggestions regardless of MCP status
- **Enhanced Indicators**: AI-enhanced suggestions are marked visually
- **Error Feedback**: Clear indication when MCP features are unavailable

## Testing MCP Integration

### 1. Test MCP Connection

```typescript
// Test if MCP server is available
const isConnected = await mcpEChartsService.initialize();
console.log("MCP Connected:", isConnected);
```

### 2. Test Suggestion Generation

```typescript
// Test enhanced suggestions
const testData = {
  columns: [
    { name: "Product", type: "string" },
    { name: "Sales", type: "number" },
  ],
  rows: [
    ["Product A", 100],
    ["Product B", 150],
  ],
  summary: {
    rowCount: 2,
    columnCount: 2,
    numericColumns: ["Sales"],
    stringColumns: ["Product"],
  },
};

const suggestions = await mcpEChartsService.generateEnhancedSuggestions(
  testData
);
console.log("MCP Suggestions:", suggestions);
```

### 3. Debug Mode

Enable debug logging to monitor MCP interactions:

```typescript
const mcpService = new MCPEChartsService({
  enabled: true,
  debug: true, // Enables detailed console logging
});
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**

   ```
   Error: Failed to connect to MCP server
   Solution: Check server URL and ensure MCP server is running
   ```

2. **Timeout Errors**

   ```
   Error: MCP request timeout
   Solution: Increase timeout value or check server performance
   ```

3. **Permission Errors**
   ```
   Error: MCP server access denied
   Solution: Check authentication and server configuration
   ```

### Debug Commands

```bash
# Check MCP server status
curl http://localhost:3001/health

# Test MCP tools
npx @modelcontextprotocol/inspector

# Validate MCP configuration
mcp validate config.json
```

## Performance Considerations

### 1. Caching

```typescript
// MCP service includes intelligent caching
const cachedSuggestions = await mcpEChartsService.getCachedSuggestions(
  dataHash
);
```

### 2. Async Loading

```typescript
// Load MCP suggestions asynchronously
const localSuggestions = generateLocalSuggestions(data);
const mcpSuggestions = mcpEChartsService.generateEnhancedSuggestions(data);

// Show local suggestions immediately, enhance with MCP when ready
return Promise.race([
  Promise.resolve(localSuggestions),
  mcpSuggestions.then((mcp) => (mcp.length > 0 ? mcp : localSuggestions)),
]);
```

### 3. Resource Management

- **Connection Pooling**: Reuse MCP connections
- **Request Batching**: Combine multiple requests
- **Timeout Management**: Prevent hanging requests
- **Memory Optimization**: Clean up unused connections

## Security Considerations

### 1. Data Privacy

- **Local Processing**: Sensitive data can be processed locally
- **Selective Sharing**: Choose what data to send to MCP
- **Encryption**: Use HTTPS for MCP communication
- **Access Control**: Implement proper authentication

### 2. Server Security

```typescript
// Secure MCP configuration
const secureConfig = {
  enabled: true,
  serverUrl: "https://secure-mcp-server.com",
  apiKey: process.env.MCP_API_KEY,
  encryption: true,
  validateCertificates: true,
};
```

## Best Practices

### 1. Development

- **Test with and without MCP** to ensure fallback works
- **Use debug mode** during development
- **Monitor performance** impact of MCP calls
- **Implement proper error handling**

### 2. Production

- **Monitor MCP server health**
- **Implement circuit breakers** for reliability
- **Cache frequently used suggestions**
- **Log MCP usage** for analytics

### 3. User Experience

- **Show loading states** for MCP requests
- **Provide fallback options** when MCP fails
- **Indicate enhanced features** clearly
- **Allow users to disable MCP** if needed

## Future Enhancements

The MCP integration is designed to support future enhancements:

- **Custom AI Models**: Integration with different LLMs
- **Advanced Analytics**: Deeper data analysis capabilities
- **Real-time Collaboration**: Multi-user chart editing
- **Learning Capabilities**: Personalized suggestions based on usage
- **Extended Chart Types**: Support for specialized visualizations
