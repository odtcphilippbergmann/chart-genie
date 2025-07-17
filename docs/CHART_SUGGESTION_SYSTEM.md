# Chart Suggestion System Documentation

## Overview

ChartGenie's chart suggestion system is the core intelligence that analyzes your data and recommends the most appropriate chart types for visualization. The system combines algorithmic analysis with optional AI enhancement through MCP (Model Context Protocol) integration.

## Architecture

```
Data Upload
    ↓
Data Parsing & Analysis
    ↓
Chart Suggestion Engine
    ├── Local Algorithm-Based Suggestions
    └── AI-Enhanced Suggestions (MCP)
    ↓
Suggestion Ranking & Filtering
    ↓
User Interface Display
    ↓
Chart Generation & Preview
```

## Core Components

### 1. Data Analysis Engine

The system first analyzes your uploaded data to understand its structure:

```typescript
interface ParsedData {
  columns: Array<{
    name: string;
    type: "string" | "number" | "date" | "boolean";
  }>;
  rows: unknown[][];
  summary: {
    rowCount: number;
    columnCount: number;
    numericColumns: string[];
    stringColumns: string[];
    dateColumns: string[];
    booleanColumns: string[];
  };
}
```

### 2. Suggestion Generation

The engine generates suggestions based on data patterns:

```typescript
interface ChartSuggestion {
  type: string; // Chart type (bar, line, pie, etc.)
  title: string; // Human-readable title
  description: string; // Detailed description
  confidence: number; // Confidence score (0-100)
  xAxis?: string; // Recommended X-axis column
  yAxis?: string[]; // Recommended Y-axis column(s)
  series?: string; // Series/grouping column
  reasoning: string; // Why this chart is recommended
  useCase: string; // When to use this chart type
  complexity: "simple" | "intermediate" | "advanced";
  aiEnhanced?: boolean; // Whether enhanced by AI
  preview?: string; // Preview description
}
```

## Supported Chart Types

### 1. Basic Charts

#### Bar Chart

- **Use Case**: Comparing values across categories
- **Data Requirements**: ≥1 categorical column, ≥1 numeric column
- **Best For**: Sales by product, performance by team, counts by category
- **Complexity**: Simple

```typescript
{
  type: "bar",
  title: "Category Comparison",
  description: "Compare values across different categories with clear visual bars",
  confidence: 85,
  reasoning: "Categorical data with numeric values - ideal for comparison",
  useCase: "Comparing sales by product, performance by team, or values by category",
  complexity: "simple"
}
```

#### Line Chart

- **Use Case**: Showing trends over time
- **Data Requirements**: ≥1 date/time column, ≥1 numeric column
- **Best For**: Time series, trends, progression analysis
- **Complexity**: Simple

#### Pie Chart

- **Use Case**: Showing proportions of a whole
- **Data Requirements**: ≥1 categorical column, ≥1 numeric column
- **Best For**: Market share, budget allocation, composition analysis
- **Complexity**: Simple

### 2. Advanced Charts

#### Scatter Plot

- **Use Case**: Exploring relationships between variables
- **Data Requirements**: ≥2 numeric columns
- **Best For**: Correlation analysis, outlier detection, pattern discovery
- **Complexity**: Intermediate

#### Radar Chart

- **Use Case**: Multi-dimensional comparison
- **Data Requirements**: ≥3 numeric columns
- **Best For**: Performance evaluation, skill assessment, product comparison
- **Complexity**: Intermediate

#### Heatmap

- **Use Case**: Visualizing data density and patterns
- **Data Requirements**: ≥2 categorical columns, ≥1 numeric column
- **Best For**: Correlation matrices, time-based patterns, geographic data
- **Complexity**: Advanced

#### Parallel Coordinates

- **Use Case**: Multi-dimensional data exploration
- **Data Requirements**: ≥4 numeric columns
- **Best For**: High-dimensional data analysis, pattern detection, filtering
- **Complexity**: Advanced

### 3. Specialized Charts

#### Funnel Chart

- **Use Case**: Process flow visualization
- **Data Requirements**: Sequential categorical data with numeric values
- **Best For**: Sales pipeline, conversion rates, process efficiency
- **Complexity**: Intermediate

#### Sankey Diagram

- **Use Case**: Flow and relationship visualization
- **Data Requirements**: Source-target relationships with flow values
- **Best For**: Energy flows, budget allocation, process mapping
- **Complexity**: Advanced

#### Treemap

- **Use Case**: Hierarchical data visualization
- **Data Requirements**: Hierarchical categorical data with numeric values
- **Best For**: File systems, organizational structures, portfolio allocation
- **Complexity**: Advanced

#### Sunburst Chart

- **Use Case**: Multi-level hierarchical data
- **Data Requirements**: Nested categorical data with numeric values
- **Best For**: Multi-level categorization, drill-down analysis
- **Complexity**: Advanced

## Suggestion Algorithm

### 1. Data Pattern Recognition

The algorithm analyzes data patterns to suggest appropriate charts:

```typescript
function analyzeDataPatterns(data: ParsedData): DataPatterns {
  return {
    hasCategorical: data.summary.stringColumns.length > 0,
    hasNumerical: data.summary.numericColumns.length > 0,
    hasTemporal: data.summary.dateColumns.length > 0,
    hasHierarchical: detectHierarchy(data),
    hasRelationships: detectRelationships(data),
    dimensionality: data.summary.numericColumns.length,
    complexity: calculateComplexity(data),
  };
}
```

### 2. Rule-Based Suggestion Engine

```typescript
function generateLocalSuggestions(data: ParsedData): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  const { summary } = data;

  // Bar Chart Rule
  if (summary.stringColumns.length >= 1 && summary.numericColumns.length >= 1) {
    suggestions.push(createBarChartSuggestion(data));
  }

  // Line Chart Rule
  if (summary.dateColumns.length >= 1 && summary.numericColumns.length >= 1) {
    suggestions.push(createLineChartSuggestion(data));
  }

  // Scatter Plot Rule
  if (summary.numericColumns.length >= 2) {
    suggestions.push(createScatterPlotSuggestion(data));
  }

  // Advanced Charts Rules
  if (summary.numericColumns.length >= 3) {
    suggestions.push(createRadarChartSuggestion(data));
  }

  if (summary.numericColumns.length >= 4) {
    suggestions.push(createParallelChartSuggestion(data));
  }

  return rankSuggestions(suggestions, data);
}
```

### 3. Confidence Scoring

Each suggestion receives a confidence score based on:

- **Data Suitability**: How well the data fits the chart type
- **Pattern Strength**: Strength of detected patterns
- **Column Quality**: Data quality and completeness
- **Best Practices**: Adherence to visualization best practices

```typescript
function calculateConfidence(
  suggestion: ChartSuggestion,
  data: ParsedData
): number {
  let confidence = 50; // Base confidence

  // Data suitability bonus
  confidence += calculateDataFit(suggestion.type, data) * 30;

  // Pattern strength bonus
  confidence += detectPatternStrength(data) * 20;

  // Column quality bonus
  confidence += assessColumnQuality(data) * 15;

  // Complexity penalty for advanced charts
  if (suggestion.complexity === "advanced") {
    confidence -= 10;
  }

  return Math.min(100, Math.max(0, confidence));
}
```

## AI Enhancement (MCP Integration)

### 1. Enhanced Suggestion Generation

When MCP is available, the system can provide AI-enhanced suggestions:

```typescript
async function generateEnhancedSuggestions(
  data: ParsedData
): Promise<ChartSuggestion[]> {
  const mcpResponse = await mcpEChartsService.generateSuggestions({
    data: prepareDataForMCP(data),
    preferences: {
      colorScheme: "indigo-purple",
      style: "modern",
      accessibility: true,
    },
  });

  return mcpResponse.suggestions.map((s) => ({
    ...s,
    aiEnhanced: true,
    confidence: Math.min(100, s.confidence + 15), // AI bonus
  }));
}
```

### 2. Contextual Reasoning

AI-enhanced suggestions include more sophisticated reasoning:

```typescript
interface AIEnhancedSuggestion extends ChartSuggestion {
  reasoning: string; // AI-generated explanation
  insights: string[]; // Data insights
  alternatives: string[]; // Alternative chart suggestions
  bestPractices: string[]; // Visualization best practices
  accessibility: {
    colorBlindSafe: boolean;
    screenReaderFriendly: boolean;
    recommendations: string[];
  };
}
```

### 3. Dynamic Configuration

AI can generate optimized chart configurations:

```typescript
async function generateAIChartConfig(
  suggestion: ChartSuggestion,
  data: ParsedData
): Promise<EChartsOption> {
  const aiConfig = await mcpEChartsService.generateEChartsConfig(
    suggestion,
    data
  );

  return {
    ...aiConfig,
    // AI-optimized styling
    color: generateOptimalColors(data),
    tooltip: generateSmartTooltips(data),
    animation: optimizeAnimations(data.summary.rowCount),
    accessibility: enhanceAccessibility(suggestion.type),
  };
}
```

## User Interface Integration

### 1. Suggestion Display

Suggestions are displayed as interactive cards with:

- **Chart Type Icon**: Visual indicator of chart type
- **Title & Description**: Clear explanation of the chart
- **Confidence Badge**: Visual confidence indicator
- **Complexity Badge**: Difficulty level indicator
- **AI Enhancement Indicator**: Shows AI-enhanced suggestions
- **Use Case Description**: When to use this chart

```tsx
<div className="suggestion-card">
  <div className="card-header">
    <ChartIcon type={suggestion.type} />
    <div className="badges">
      <ConfidenceBadge score={suggestion.confidence} />
      <ComplexityBadge level={suggestion.complexity} />
      {suggestion.aiEnhanced && <AIBadge />}
    </div>
  </div>

  <div className="card-content">
    <h3>{suggestion.title}</h3>
    <p>{suggestion.description}</p>
    <div className="use-case">
      <strong>Best for:</strong> {suggestion.useCase}
    </div>
    <div className="reasoning">
      <strong>Why:</strong> {suggestion.reasoning}
    </div>
  </div>
</div>
```

### 2. Interactive Selection

Users can:

- **Click to Preview**: Instantly generate chart preview
- **Hover for Details**: Show additional information
- **Filter by Complexity**: Show only simple, intermediate, or advanced charts
- **Sort by Confidence**: Order suggestions by recommendation strength

### 3. Real-time Updates

Suggestions update automatically when:

- **Data Changes**: New file uploaded or data modified
- **Filters Applied**: Data subset changes
- **Preferences Updated**: User changes visualization preferences

## Customization & Configuration

### 1. Suggestion Preferences

Users can customize suggestion behavior:

```typescript
interface SuggestionPreferences {
  maxSuggestions: number; // Maximum number to show
  minConfidence: number; // Minimum confidence threshold
  complexityLevels: ("simple" | "intermediate" | "advanced")[]; // Allowed complexity
  chartTypes: string[]; // Preferred chart types
  aiEnhanced: boolean; // Use AI enhancement when available
  colorScheme: string; // Preferred color scheme
  accessibility: boolean; // Prioritize accessible charts
}
```

### 2. Custom Chart Types

Developers can add custom chart suggestions:

```typescript
// Register custom chart type
registerCustomChartType({
  type: "custom-timeline",
  name: "Timeline Chart",
  description: "Custom timeline visualization",
  requirements: {
    minColumns: 2,
    requiredTypes: ["date", "string"],
  },
  suggestionLogic: (data: ParsedData) => {
    // Custom logic to determine if this chart is suitable
    return {
      suitable: true,
      confidence: 75,
      reasoning: "Data has temporal and categorical elements",
    };
  },
  chartCreator: (data: ParsedData) => {
    // Function to create ECharts configuration
    return createTimelineConfig(data);
  },
});
```

### 3. Plugin System

Extend functionality with plugins:

```typescript
// Example plugin for domain-specific suggestions
class FinancialChartsPlugin implements SuggestionPlugin {
  name = "financial-charts";

  analyze(data: ParsedData): ChartSuggestion[] {
    if (this.isFinancialData(data)) {
      return [
        this.createCandlestickSuggestion(data),
        this.createVolumeChartSuggestion(data),
      ];
    }
    return [];
  }

  private isFinancialData(data: ParsedData): boolean {
    const columns = data.columns.map((c) => c.name.toLowerCase());
    return ["open", "high", "low", "close"].every((col) =>
      columns.some((name) => name.includes(col))
    );
  }
}
```

## Performance Optimization

### 1. Intelligent Caching

```typescript
class SuggestionCache {
  private cache = new Map<string, ChartSuggestion[]>();
  private dataHashCache = new Map<ParsedData, string>();

  getCachedSuggestions(data: ParsedData): ChartSuggestion[] | null {
    const hash = this.generateDataHash(data);
    return this.cache.get(hash) || null;
  }

  cacheSuggestions(data: ParsedData, suggestions: ChartSuggestion[]): void {
    const hash = this.generateDataHash(data);
    this.cache.set(hash, suggestions);
  }
}
```

### 2. Async Processing

```typescript
// Process suggestions asynchronously
async function generateSuggestionsAsync(
  data: ParsedData
): Promise<ChartSuggestion[]> {
  // Start local suggestions immediately
  const localPromise = Promise.resolve(generateLocalSuggestions(data));

  // Start AI suggestions in parallel
  const aiPromise = mcpEChartsService
    .generateEnhancedSuggestions(data)
    .catch(() => []); // Fallback to empty array on error

  // Return local suggestions first, then merge with AI when ready
  const [local, ai] = await Promise.allSettled([localPromise, aiPromise]);

  const localSuggestions = local.status === "fulfilled" ? local.value : [];
  const aiSuggestions = ai.status === "fulfilled" ? ai.value : [];

  return mergeAndRankSuggestions(localSuggestions, aiSuggestions);
}
```

### 3. Progressive Enhancement

```typescript
// Show basic suggestions immediately, enhance progressively
function useProgressiveSuggestions(data: ParsedData) {
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Phase 1: Show local suggestions immediately
    const localSuggestions = generateLocalSuggestions(data);
    setSuggestions(localSuggestions);
    setLoading(false);

    // Phase 2: Enhance with AI suggestions
    mcpEChartsService
      .generateEnhancedSuggestions(data)
      .then((aiSuggestions) => {
        if (aiSuggestions.length > 0) {
          setSuggestions(
            mergeAndRankSuggestions(localSuggestions, aiSuggestions)
          );
        }
      })
      .catch((error) => {
        console.warn("AI enhancement failed:", error);
      });
  }, [data]);

  return { suggestions, loading };
}
```

## Best Practices

### 1. Data Quality Assessment

Always assess data quality before generating suggestions:

```typescript
function assessDataQuality(data: ParsedData): DataQuality {
  return {
    completeness: calculateCompleteness(data),
    consistency: checkConsistency(data),
    accuracy: validateDataTypes(data),
    validity: checkValueRanges(data),
    recommendations: generateQualityRecommendations(data),
  };
}
```

### 2. Accessibility Considerations

Ensure suggestions prioritize accessibility:

```typescript
function prioritizeAccessibleCharts(
  suggestions: ChartSuggestion[]
): ChartSuggestion[] {
  return suggestions.map((s) => ({
    ...s,
    accessibility: {
      colorBlindSafe: checkColorBlindCompatibility(s.type),
      screenReaderFriendly: checkScreenReaderSupport(s.type),
      keyboardNavigable: checkKeyboardSupport(s.type),
    },
  }));
}
```

### 3. User Experience Guidelines

- **Progressive Disclosure**: Show simple charts first, advanced on demand
- **Clear Explanations**: Always explain why a chart is recommended
- **Visual Previews**: Provide thumbnail previews when possible
- **Error Handling**: Gracefully handle data issues and provide helpful messages
- **Performance**: Keep suggestion generation under 500ms for good UX

## Troubleshooting

### Common Issues

1. **No Suggestions Generated**

   - Check data format and structure
   - Verify minimum column requirements
   - Ensure data types are correctly detected

2. **Low Confidence Scores**

   - Improve data quality
   - Add more rows for better pattern detection
   - Consider data preprocessing

3. **Missing Chart Types**
   - Check if data meets chart requirements
   - Verify chart type is enabled in configuration
   - Consider adding custom chart types

### Debug Tools

```typescript
// Enable debug logging
const debugSuggestions = generateSuggestions(data, { debug: true });

// Analyze suggestion generation
const analysis = analyzeSuggestionProcess(data);
console.log("Suggestion Analysis:", analysis);

// Test specific chart types
const testResult = testChartTypeSuitability("radar", data);
console.log("Radar Chart Suitability:", testResult);
```

This comprehensive suggestion system ensures users always get intelligent, contextual chart recommendations that match their data and visualization goals.
