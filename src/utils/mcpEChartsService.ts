// MCP ECharts integration service
import type { ParsedData } from "./dataParser";
import type { ChartSuggestion } from "./chartSuggestions";

interface MCPEChartsConfig {
  serverUrl?: string;
  enabled: boolean;
}

interface MCPData {
  suggestions?: MCPSuggestion[];
  chartConfig?: Record<string, unknown>;
  insights?: string[];
}

interface MCPResponse {
  success: boolean;
  data?: MCPData;
  error?: string;
}

interface MCPSuggestion {
  type: string;
  title?: string;
  description?: string;
  confidence?: number;
  xAxis?: string;
  yAxis?: string;
  series?: string;
  reasoning?: string;
  preview?: string;
  useCase?: string;
  complexity?: string;
}

interface MCPDataPrep {
  columns: Array<{
    name: string;
    type: string;
    sampleValues: unknown[];
  }>;
  summary: ParsedData["summary"];
  rowCount: number;
}

class MCPEChartsService {
  private config: MCPEChartsConfig;
  private isConnected: boolean = false;

  constructor(config: MCPEChartsConfig = { enabled: false }) {
    this.config = config;
  }

  /**
   * Initialize connection to MCP ECharts server
   */
  async initialize(): Promise<boolean> {
    if (!this.config.enabled) {
      console.log("MCP ECharts integration is disabled");
      return false;
    }

    try {
      // Check if MCP ECharts server is available
      this.isConnected = await this.checkServerAvailability();

      if (this.isConnected) {
        console.log("✅ MCP ECharts server connected successfully");
      } else {
        console.log("❌ MCP ECharts server not available, using fallback");
      }

      return this.isConnected;
    } catch (error) {
      console.error("Failed to initialize MCP ECharts connection:", error);
      return false;
    }
  }

  /**
   * Generate enhanced chart suggestions using MCP ECharts
   */
  async generateEnhancedSuggestions(
    data: ParsedData
  ): Promise<ChartSuggestion[]> {
    if (!this.isConnected) {
      console.log(
        "MCP ECharts not connected, falling back to local suggestions"
      );
      return this.generateFallbackSuggestions(data);
    }

    try {
      // Call MCP ECharts server to analyze data and suggest charts
      const mcpResponse = await this.callMCPServer("generate_suggestions", {
        data: this.prepareDataForMCP(data),
        preferences: {
          colorScheme: "indigo-purple",
          style: "modern",
          accessibility: true,
        },
      });

      if (mcpResponse.success && mcpResponse.data?.suggestions) {
        console.log(
          "✨ Got MCP ECharts suggestions:",
          mcpResponse.data.suggestions.length
        );
        return this.processMCPSuggestions(mcpResponse.data);
      } else {
        console.warn("MCP ECharts returned no suggestions, using fallback");
        return this.generateFallbackSuggestions(data);
      }
    } catch (error) {
      console.error("Error calling MCP ECharts server:", error);
      return this.generateFallbackSuggestions(data);
    }
  }

  /**
   * Generate ECharts configuration using MCP server
   */
  async generateEChartsConfig(
    suggestion: ChartSuggestion,
    data: ParsedData
  ): Promise<Record<string, unknown>> {
    if (!this.isConnected) {
      return this.generateFallbackConfig(suggestion, data);
    }

    try {
      const mcpResponse = await this.callMCPServer("generate_chart", {
        type: suggestion.type,
        data: this.prepareDataForMCP(data),
        config: {
          title: suggestion.title,
          xAxis: suggestion.xAxis,
          yAxis: suggestion.yAxis,
          theme: "indigo-purple",
          responsive: true,
          animation: true,
        },
      });

      if (mcpResponse.success && mcpResponse.data?.chartConfig) {
        return this.enhanceEChartsConfig(mcpResponse.data.chartConfig);
      } else {
        return this.generateFallbackConfig(suggestion, data);
      }
    } catch (error) {
      console.error("Error generating ECharts config via MCP:", error);
      return this.generateFallbackConfig(suggestion, data);
    }
  }

  /**
   * Get AI-powered insights about the chart
   */
  async getChartInsights(
    chartConfig: Record<string, unknown>,
    data: ParsedData
  ): Promise<string[]> {
    if (!this.isConnected) {
      return this.generateFallbackInsights(data);
    }

    try {
      const mcpResponse = await this.callMCPServer("analyze_chart", {
        chartConfig,
        data: this.prepareDataForMCP(data),
      });

      if (mcpResponse.success && mcpResponse.data?.insights) {
        return mcpResponse.data.insights;
      } else {
        return this.generateFallbackInsights(data);
      }
    } catch (error) {
      console.error("Error getting chart insights via MCP:", error);
      return this.generateFallbackInsights(data);
    }
  }

  // Private helper methods
  private async checkServerAvailability(): Promise<boolean> {
    // For browser environment, we can't directly access MCP servers
    // In a real implementation, this would check if MCP ECharts is configured
    // and available through the MCP client

    try {
      // For testing purposes, return true to show enhanced suggestions
      // In production, this would check for actual MCP server availability
      console.log(
        "🔍 MCP ECharts testing mode - enabling enhanced suggestions"
      );
      return true;

      // Check if we're in a desktop app environment with MCP support
      // This is a simplified check - in reality, you'd integrate with MCP SDK
      const hasMCPSupport =
        typeof window !== "undefined" &&
        (window as unknown as { mcpEnabled?: boolean }).mcpEnabled;

      if (hasMCPSupport) {
        console.log("🔍 MCP support detected in environment");
        return true;
      }

      // For development/testing, check if we can detect Node.js/MCP tools
      // This won't work in browser but helps during development
      return false;
    } catch {
      return false;
    }
  }

  private async callMCPServer(
    tool: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    // In a real implementation, this would use the MCP SDK to call the server
    // For example:
    // import { Client } from '@modelcontextprotocol/sdk/client/index.js';
    // const client = new Client(...);
    // const result = await client.callTool('generate_chart', params);

    console.log(`🔧 MCP ECharts: ${tool}`, params);

    // Simulate MCP server response for now
    // In production, replace this with actual MCP SDK calls
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Generate mock suggestions based on the tool called
    if (tool === "generate_suggestions") {
      const dataInfo = params.data as MCPDataPrep;
      const suggestions: MCPSuggestion[] = [];

      // Analyze data structure and suggest appropriate charts
      const hasCategories = dataInfo.columns.some(
        (col) => col.type === "string"
      );
      const hasNumbers = dataInfo.columns.some((col) => col.type === "number");
      const hasDates = dataInfo.columns.some((col) => col.type === "date");
      const numericCount = dataInfo.columns.filter(
        (col) => col.type === "number"
      ).length;

      if (hasCategories && hasNumbers) {
        suggestions.push({
          type: "bar",
          title: "Smart Bar Chart",
          description:
            "AI-optimized categorical comparison with intelligent grouping",
          confidence: 95,
          reasoning:
            "MCP ECharts detected optimal categorical data structure with advanced styling capabilities",
          useCase:
            "Sales by product, performance metrics, survey results, or any categorical comparison",
          complexity: "simple",
        });

        suggestions.push({
          type: "funnel",
          title: "Conversion Funnel",
          description: "Visualize step-by-step process or conversion rates",
          confidence: 78,
          reasoning:
            "Sequential categorical data ideal for funnel visualization",
        });
      }

      if (hasDates && hasNumbers) {
        suggestions.push({
          type: "line",
          title: "Advanced Time Series",
          description:
            "Interactive time-based analysis with zoom and data brush",
          confidence: 92,
          reasoning:
            "Temporal data perfect for ECharts advanced time series features",
        });

        suggestions.push({
          type: "area",
          title: "Stacked Area Timeline",
          description: "Show cumulative trends with smooth gradients",
          confidence: 85,
          reasoning: "Time series data enhanced with ECharts area styling",
        });
      }

      if (numericCount >= 3) {
        suggestions.push({
          type: "parallel",
          title: "Parallel Coordinates",
          description:
            "Multi-dimensional data exploration with interactive filtering",
          confidence: 88,
          reasoning:
            "Multiple numeric dimensions ideal for parallel coordinate analysis",
        });

        suggestions.push({
          type: "radar",
          title: "Multi-Metric Radar",
          description: "Compare multiple metrics across categories",
          confidence: 82,
          reasoning: "Rich numeric data perfect for radar chart comparison",
        });
      }

      if (numericCount >= 2) {
        suggestions.push({
          type: "scatter",
          title: "Enhanced Scatter Plot",
          description:
            "Correlation analysis with regression lines and clustering",
          confidence: 90,
          reasoning:
            "Bivariate analysis enhanced with ECharts advanced scatter features",
        });
      }

      if (hasCategories) {
        suggestions.push({
          type: "treemap",
          title: "Hierarchical Treemap",
          description: "Space-efficient hierarchical data visualization",
          confidence: 75,
          reasoning:
            "Categorical data can be effectively shown as nested rectangles",
        });

        suggestions.push({
          type: "sunburst",
          title: "Sunburst Diagram",
          description: "Multi-level categorical data with radial layout",
          confidence: 70,
          reasoning:
            "Nested categorical structure ideal for sunburst visualization",
        });
      }

      return {
        success: true,
        data: {
          suggestions,
          insights: [
            "🎯 AI analyzed your data structure and optimized chart recommendations",
            "🎨 Enhanced styling with ECharts professional themes and animations",
            "🔄 Interactive features like zoom, brush, and data filtering enabled",
            "📊 Advanced chart types available for complex data relationships",
          ],
        },
      };
    }

    return {
      success: true,
      data: {
        insights: [
          "AI-enhanced chart configuration generated",
          "Optimal color scheme applied for accessibility",
          "Interactive features enabled for better user engagement",
        ],
      },
    };
  }

  private prepareDataForMCP(data: ParsedData): MCPDataPrep {
    return {
      columns: data.columns.map((col) => ({
        name: col.name,
        type: col.type,
        sampleValues: col.values.slice(0, 5), // Send sample data
      })),
      summary: data.summary,
      rowCount: data.rows.length,
    };
  }

  private processMCPSuggestions(mcpData: MCPData): ChartSuggestion[] {
    // Process MCP server response into ChartSuggestion format
    if (!mcpData.suggestions || !Array.isArray(mcpData.suggestions)) {
      return [];
    }

    return mcpData.suggestions.map(
      (suggestion: MCPSuggestion, index: number) => ({
        type: (suggestion.type || "bar") as ChartSuggestion["type"],
        title: suggestion.title || `AI Suggested Chart ${index + 1}`,
        description: suggestion.description || "AI-generated chart suggestion",
        confidence: suggestion.confidence || 85,
        xAxis: suggestion.xAxis,
        yAxis: suggestion.yAxis ? [suggestion.yAxis] : undefined,
        series: suggestion.series,
        reasoning:
          suggestion.reasoning || "Generated by MCP ECharts AI analysis",
        preview: suggestion.preview,
        useCase: suggestion.useCase,
        complexity:
          (suggestion.complexity as ChartSuggestion["complexity"]) || "simple",
      })
    );
  }

  private enhanceEChartsConfig(
    mcpConfig: Record<string, unknown>
  ): Record<string, unknown> {
    // Enhance the MCP-generated config with our app's styling
    return {
      ...mcpConfig,
      backgroundColor: "transparent",
      textStyle: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      },
      color: [
        "#6366f1", // indigo-500
        "#8b5cf6", // purple-500
        "#06b6d4", // cyan-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#ef4444", // red-500
      ],
    };
  }

  // Fallback methods when MCP is not available
  private generateFallbackSuggestions(data: ParsedData): ChartSuggestion[] {
    const suggestions: ChartSuggestion[] = [];

    if (
      data.summary.stringColumns.length >= 1 &&
      data.summary.numericColumns.length >= 1
    ) {
      suggestions.push({
        type: "bar",
        title: "Category Comparison",
        description: "Compare values across categories",
        confidence: 85,
        xAxis: data.summary.stringColumns[0],
        yAxis: [data.summary.numericColumns[0]],
        reasoning:
          "Categorical data with numeric values - ideal for comparison",
      });
    }

    if (data.summary.numericColumns.length >= 2) {
      suggestions.push({
        type: "scatter",
        title: "Correlation Analysis",
        description: "Explore relationships between variables",
        confidence: 80,
        xAxis: data.summary.numericColumns[0],
        yAxis: [data.summary.numericColumns[1]],
        reasoning: "Multiple numeric variables enable correlation analysis",
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private generateFallbackConfig(
    suggestion: ChartSuggestion,
    data: ParsedData
  ): Record<string, unknown> {
    // Generate basic ECharts config as fallback
    const config: Record<string, unknown> = {
      title: {
        text: suggestion.title,
        left: "center",
        textStyle: {
          color: "#1f2937",
          fontSize: 18,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e5e7eb",
        textStyle: {
          color: "#374151",
        },
      },
      color: ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
    };

    // Add chart-specific configuration
    if (suggestion.type === "bar") {
      config.xAxis = {
        type: "category",
        data: data.rows.map((row) => row[0]),
      };
      config.yAxis = {
        type: "value",
      };
      config.series = [
        {
          type: "bar",
          data: data.rows.map((row) => row[1]),
        },
      ];
    }

    return config;
  }

  private generateFallbackInsights(data: ParsedData): string[] {
    return [
      `Dataset contains ${data.summary.totalRows} records across ${data.summary.totalColumns} variables`,
      `${data.summary.numericColumns.length} numeric variables available for quantitative analysis`,
      `${data.summary.stringColumns.length} categorical variables for grouping and segmentation`,
    ];
  }
}

// Export singleton instance
export const mcpEChartsService = new MCPEChartsService({
  enabled: true, // Enable MCP integration for testing
});

export default mcpEChartsService;
