# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChartGenie is an AI-powered interactive chart builder that transforms data files (CSV, JSON, Excel) into beautiful, interactive charts. It features smart chart suggestions, 15+ chart types, and multiple export options (PNG, SVG, React components, HTML).

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Components Flow
1. **FileUpload.tsx** → Two-step file upload: selection + context input + send button
2. **dataParser.ts** → Processes CSV/JSON/Excel files into structured data
3. **DataAnalysis.tsx** → AI-powered analysis using OpenAI API (displayed at top)
4. **DataPreview.tsx** → Displays data summary and insights
5. **chartSuggestions.ts** → Analyzes data and recommends appropriate chart types
6. **ChartSuggestions.tsx** → Shows AI-powered chart recommendations
7. **ChartPreview.tsx** → Renders selected chart with ECharts
8. **exportUtils.ts** → Handles exports to various formats

### Key Architectural Decisions

- **Hybrid AI Approach**: The app works standalone with local chart suggestion algorithms. When MCP is available, it enhances suggestions with AI capabilities via `mcpEChartsService.ts`.
- **Chart Library**: Uses Apache ECharts for rendering all visualizations. Chart configurations are generated dynamically based on data structure.
- **State Management**: Uses React's built-in state (useState) for simplicity. No external state management library.
- **Data Processing**: All file parsing happens client-side using PapaParse (CSV) and XLSX (Excel).

### Chart Suggestion System

The chart recommendation engine (`src/utils/chartSuggestions.ts`) analyzes data characteristics:
- Categorical vs numerical data
- Number of data points
- Data distribution
- Temporal patterns

See `docs/CHART_SUGGESTION_SYSTEM.md` for detailed algorithm documentation.

### MCP Integration

Optional AI enhancement through Model Context Protocol:
- Client implementation in `src/utils/mcpEChartsService.ts`
- Connects to MCP server when available
- Falls back gracefully to local algorithms
- Setup guide in `docs/MCP_INSTALLATION_GUIDE.md`

### OpenAI Integration

Direct OpenAI API integration for data analysis:
- Service implementation in `src/utils/openaiService.ts`
- UI configuration in `src/components/OpenAIConfig.tsx` (hidden when using env vars)
- Analysis display in `src/components/DataAnalysis.tsx`
- Uses GPT-4 to analyze uploaded data and provide:
  - Data quality assessment
  - Column descriptions and statistics
  - Key insights about the data
  - Chart recommendations with reasoning
- **Environment Variables**: Set `VITE_OPENAI_API_KEY` in `.env` file (auto-loads)
- **Fallback**: API key stored locally in browser localStorage if no env var
- **Context Enhancement**: User can provide optional context about their data
- Test with: `node test-openai.js`

## Testing

Currently uses manual test scripts in the root directory:
- `test-functionality.js` - General functionality testing
- `test-excel-parsing.js` - Excel parsing verification
- `test-mcp.js` - MCP integration testing

Run tests with: `node test-functionality.js`

## Animation System

Uses the `motion` library for smooth transitions between app phases:
- **File upload to analysis**: Staggered fade-in animations for preview items
- **Chart selection**: Slide-in animation for chart preview
- **App reset**: Fade-out then fade-in transition
- **File selection**: Smooth transition to ready-to-send state
- **Step indicator**: Subtle scale animations during phase changes
- **Performance**: Animations use CSS transforms for 60fps performance

## AI Analysis Data Flow

The AI analysis results are shared across components:
1. **DataAnalysis** component completes analysis and calls `onAnalysisComplete`
2. **App.tsx** stores the analysis in `aiAnalysis` state
3. **DataPreview**, **ChartSuggestions**, and **ChartPreview** receive `aiAnalysis` prop
4. Components can access the full analysis object and its properties

### Accessing AI Analysis Data in Components

Each component that receives the `aiAnalysis` prop can access:

```typescript
// Component props interface
interface ComponentProps {
  // ... other props
  aiAnalysis?: {
    summary: {
      description: string;
      rowCount: number;
      columnCount: number;
      dataQuality: "high" | "medium" | "low";
    };
    columns: Array<{
      name: string;
      type: "string" | "number" | "date" | "boolean";
      description: string;
      sampleValues: any[];
      statistics?: {
        min?: number;
        max?: number;
        mean?: number;
        uniqueCount?: number;
      };
    }>;
    insights: string[];
    recommendations: Array<{
      chartType: string;
      reason: string;
      columns: {
        x?: string;
        y?: string[];
        category?: string;
        value?: string;
      };
    }>;
  };
}

// Usage examples in components:
const Component = ({ aiAnalysis, ...otherProps }) => {
  // Access insights
  const aiInsights = aiAnalysis?.insights || [];
  
  // Access data quality
  const dataQuality = aiAnalysis?.summary?.dataQuality || "unknown";
  
  // Access column descriptions
  const columnDescriptions = aiAnalysis?.columns || [];
  
  // Access AI chart recommendations
  const aiRecommendations = aiAnalysis?.recommendations || [];
  
  // Find specific column info
  const salesColumn = aiAnalysis?.columns?.find(col => col.name === "Sales");
  
  // Use in JSX
  return (
    <div>
      {dataQuality === "high" && <div>✅ High quality data</div>}
      {aiInsights.map((insight, i) => (
        <p key={i}>{insight}</p>
      ))}
    </div>
  );
};
```

### Current Implementation Status

- **DataPreview**: Receives `aiAnalysis` prop, logs to console for debugging
- **ChartSuggestions**: Receives `aiAnalysis` prop, logs to console for debugging  
- **ChartPreview**: Receives `aiAnalysis` prop, logs to console for debugging
- **Console Logging**: Check browser console to see AI analysis data flow

### Enhancement Opportunities

Components can be enhanced to use AI analysis for:
- **Smart tooltips** using AI column descriptions
- **Data quality indicators** in the UI
- **Enhanced chart suggestions** based on AI recommendations
- **Contextual help text** derived from AI insights
- **Intelligent defaults** for chart configuration

## Important Implementation Notes

1. **Two-Step Upload**: Files are selected first, then users can add context before sending. This prevents accidental auto-processing and allows thoughtful context input.

2. **Chart Types**: All 15+ chart types are defined in `chartSuggestions.ts`. Each has specific data requirements (e.g., scatter plots need 2+ numeric columns).

3. **Export Functionality**: 
   - PNG/SVG exports use html2canvas
   - React component export generates clean, reusable code
   - HTML export creates standalone interactive charts

4. **Error Handling**: File parsing errors are caught and displayed with user-friendly messages. Invalid data structures are handled gracefully.

5. **Accessibility**: Components include proper ARIA labels and keyboard navigation support for WCAG 2.1 AA compliance.

6. **Performance**: Large datasets (10,000+ rows) may impact chart rendering performance. The app includes data sampling for previews when needed.

7. **Environment Setup**: Copy `.env.example` to `.env` and add your OpenAI API key for automatic AI analysis.