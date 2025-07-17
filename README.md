# ChartGenie: AI-Powered Interactive Chart Builder

Transform your data into beautiful, interactive charts with AI assistance. From data upload to presentation-ready visuals in minutes.

## Current Status

- **Core Features Complete**: Upload, parse, and visualize CSV/JSON/Excel files
- **Chart Engine**: Full ECharts integration with 7+ chart types
- **Export System**: PNG, SVG, React component, and HTML exports
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **MCP Integration**: Ready for AI-enhanced suggestions via MCP ECharts server
- **Fallback Logic**: Works perfectly without MCP - robust local chart generation

**Note**: MCP ECharts integration is **optional** and enhances the experience when available. The app provides intelligent local chart suggestions by default.

## Features

- **Smart Data Upload**: Support for CSV, JSON, and Excel files with intelligent parsing
- **AI Chart Suggestions**: Intelligent chart recommendations using local algorithms + optional MCP enhancement
- **Interactive Preview**: Real-time chart generation with Apache ECharts
- **15+ Chart Types**: From simple bar charts to advanced radar, parallel coordinates, and treemaps
- **Multiple Export Options**:
  - PNG/SVG images for presentations
  - React component code for developers
  - Self-contained interactive HTML files
- **Beautiful UI**: Modern, responsive design with accessibility focus
- **Fast Processing**: Instant chart generation and preview
- **Robust Fallbacks**: Works seamlessly with or without MCP integration

**For details on chart types and recommendation logic, see [Chart Suggestion System Documentation](./docs/CHART_SUGGESTION_SYSTEM.md)**

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Apache ECharts + echarts-for-react
- **Icons**: Lucide React
- **Data Processing**: PapaParse (CSV), native JSON parsing
- **File Exports**: html2canvas, file-saver

## Installation

1. **Clone and install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** and visit `http://localhost:5173`

## MCP (Model Context Protocol) Integration

ChartGenie includes a **custom MCP client integration** that connects to external MCP servers for enhanced AI capabilities. The app works perfectly without MCP (using intelligent local algorithms), but MCP integration provides advanced AI-powered features.

### Architecture

**What ChartGenie Includes:**

- **Custom MCP Client** (`src/utils/mcpEChartsService.ts`) - Built-in client that connects to MCP servers
- **Hybrid Suggestion Engine** - Local algorithms + optional MCP enhancement
- **Automatic Fallback** - Seamlessly works with or without MCP servers
- **Dual-Mode Operation** - Always functional, enhanced when MCP is available

**What You Need to Provide:**

- **MCP Server** - External server for AI processing (Claude Desktop, standalone, or custom)

### Quick Setup

1. **Install an MCP ECharts server** (choose one option):

   **Option A: Claude Desktop (Recommended)**

   ```json
   {
     "mcpServers": {
       "mcp-echarts": {
         "command": "npx",
         "args": ["-y", "mcp-echarts"]
       }
     }
   }
   ```

   **Option B: Standalone Server**

   ```bash
   npx -y mcp-echarts
   ```

2. **ChartGenie automatically connects** - No additional configuration needed!

3. **Benefits of MCP Integration**:
   - Advanced AI chart recommendations with higher confidence scores
   - Context-aware chart type suggestions based on data analysis
   - Optimized ECharts configurations with accessibility features
   - Intelligent data insights and pattern detection

**For detailed MCP setup and configuration, see [MCP Installation Guide](./docs/MCP_INSTALLATION_GUIDE.md)**

## Usage Guide

### Step 1: Upload Data

- Drag and drop your CSV, JSON, or Excel file
- Or click "Choose File" to browse
- Supported formats: `.csv`, `.json`, `.xlsx`, `.xls`

### Step 2: Review Data

- View data summary and column types
- Check AI-generated insights
- Examine data preview table

### Step 3: Choose Chart Type

- Browse intelligent chart suggestions (enhanced by AI when MCP is available)
- View confidence scores and detailed reasoning
- See complexity indicators (Simple, Intermediate, Advanced)
- Select the best chart for your data and use case

**Learn about the suggestion algorithm in [Chart Suggestion System Documentation](./docs/CHART_SUGGESTION_SYSTEM.md)**

### Step 4: Export & Share

- **PNG/SVG**: Perfect for presentations and documents
- **React Component**: Copy-paste into your web applications
- **Interactive HTML**: Self-contained file for live presentations

## Example Use Cases

### Sales Dashboard

Upload monthly sales data → Get bar chart suggestions → Export interactive HTML for team presentations

### Time Series Analysis

Upload financial data → Get line chart recommendations → Export React component for web app

### Market Research

Upload survey data → Get pie chart suggestions → Export PNG for reports

## Project Structure

```
src/
├── components/           # React components
│   ├── FileUpload.tsx   # File upload interface
│   ├── DataPreview.tsx  # Data summary and insights
│   ├── ChartSuggestions.tsx  # AI chart recommendations
│   └── ChartPreview.tsx # Chart display and exports
├── utils/               # Utility functions
│   ├── dataParser.ts    # Data processing and insights
│   ├── chartSuggestions.ts  # Chart recommendation engine
│   └── exportUtils.ts   # Export functionality
└── App.tsx              # Main application
```

## Customization

### Adding New Chart Types

1. Extend the `ChartSuggestion` type in `chartSuggestions.ts`
2. Add chart creation logic in `createEChartsOption`
3. Update the icon mapping in `ChartSuggestions.tsx`

### Custom Themes

Modify `tailwind.config.js` to customize colors and styling:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        // ...
      }
    }
  }
}
```

## Deployment

1. **Build for production**:

   ```bash
   npm run build
   ```

2. **Preview the build**:

   ```bash
   npm run preview
   ```

3. **Deploy** to your favorite hosting platform (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Apache ECharts](https://echarts.apache.org/) for the amazing charting library
- [Model Context Protocol](https://mcp.so/) for AI integration capabilities
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Made with care for data visualization enthusiasts**
