import React, { useRef, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import ReactECharts from "echarts-for-react";
import { Download, Code, FileText, Share2, AlertTriangle } from "lucide-react";
import type { EChartsOption } from "../utils/chartSuggestions";
import { chartExports } from "../utils/exportUtils";

interface ChartPreviewProps {
  chartOption: EChartsOption | null;
  title?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string | number; // Key to reset the error boundary
}

class ChartErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chart rendering error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error boundary when resetKey changes
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Chart Rendering Error
          </h3>
          <p className="text-red-700 dark:text-red-300 text-center max-w-md">
            Unable to render this chart. This may be due to incompatible data or
            chart configuration. Please try a different chart type.
          </p>
          {this.state.error && (
            <details className="mt-4 text-sm text-red-600 dark:text-red-400">
              <summary className="cursor-pointer">Technical Details</summary>
              <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded text-xs overflow-auto max-w-md">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ChartPreviewProps {
  chartOption: EChartsOption | null;
  title?: string;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartOption,
  title = "Generated Chart",
}) => {
  const chartRef = useRef<ReactECharts>(null);

  const handleExportPNG = async () => {
    if (!chartRef.current) return;

    const chartElement = chartRef.current.getEchartsInstance().getDom();
    try {
      await chartExports.png(chartElement, {
        filename: title.toLowerCase().replace(/\s+/g, "-"),
        width: 800,
        height: 600,
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PNG. Please try again.");
    }
  };

  const handleExportSVG = () => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current.getEchartsInstance();
    try {
      chartExports.svg(chartInstance, {
        filename: title.toLowerCase().replace(/\s+/g, "-"),
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export SVG. Please try again.");
    }
  };

  const handleExportReact = () => {
    if (!chartOption) return;

    try {
      chartExports.reactComponent(
        chartOption,
        "GeneratedChart",
        "GeneratedChart.tsx"
      );
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export React component. Please try again.");
    }
  };

  const handleExportHTML = () => {
    if (!chartOption) return;

    try {
      chartExports.interactiveHTML(
        chartOption,
        title,
        `${title.toLowerCase().replace(/\s+/g, "-")}.html`
      );
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export HTML. Please try again.");
    }
  };

  // Early return if chartOption is invalid
  if (!chartOption) {
    return (
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700"
        aria-labelledby="no-chart-heading"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3
            id="no-chart-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
          >
            No Chart Preview
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Upload data and select a chart suggestion to see the preview
          </p>
        </div>
      </section>
    );
  }

  // Enhanced validation with deep checking
  const hasValidSeries =
    chartOption.series &&
    Array.isArray(chartOption.series) &&
    chartOption.series.length > 0;

  const hasValidSeriesTypes =
    hasValidSeries &&
    chartOption.series.every((s, index) => {
      if (!s || typeof s !== "object") {
        console.error(`Invalid series object at index ${index}:`, s);
        return false;
      }
      if (!s.type || typeof s.type !== "string") {
        console.error(`Series at index ${index} missing or invalid type:`, s);
        return false;
      }
      return true;
    });

  if (!hasValidSeries || !hasValidSeriesTypes) {
    console.error("Chart option validation failed:", {
      hasValidSeries,
      hasValidSeriesTypes,
      series: chartOption.series,
    });

    return (
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700"
        aria-labelledby="invalid-chart-heading"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h3
            id="invalid-chart-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
          >
            Invalid Chart Configuration
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The chart configuration is invalid. Please try a different chart
            type.
          </p>
          <details className="text-sm text-red-600 dark:text-red-400">
            <summary className="cursor-pointer">Debug Information</summary>
            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded text-xs overflow-auto max-w-md text-left">
              {JSON.stringify(
                {
                  hasValidSeries,
                  hasValidSeriesTypes,
                  seriesCount: chartOption.series?.length || 0,
                  seriesTypes: chartOption.series?.map((s) => s?.type) || [],
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </section>
    );
  }

  // Final sanitization of chart option before rendering
  const sanitizedChartOption = {
    ...chartOption,
    series: chartOption.series.map((s, index) => {
      if (!s || !s.type) {
        console.error(`Sanitizing invalid series at index ${index}:`, s);
        return {
          type: "bar",
          data: [0],
          name: `Invalid Series ${index + 1}`,
        };
      }
      return s;
    }),
  };

  return (
    <div className="space-y-6">
      {/* Chart Display */}
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="chart-preview-heading"
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            id="chart-preview-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Chart Preview
          </h3>
          <div
            className="flex space-x-2"
            role="group"
            aria-label="Quick export options"
          >
            <button
              onClick={handleExportPNG}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              aria-label="Download chart as PNG image"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              PNG
            </button>
            <button
              onClick={handleExportSVG}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              aria-label="Download chart as SVG vector image"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              SVG
            </button>
          </div>
        </div>

        <div
          className="relative"
          role="img"
          aria-label={`Interactive chart: ${title}`}
        >
          <ChartErrorBoundary
            resetKey={
              JSON.stringify(chartOption?.title || "") +
              JSON.stringify(chartOption?.series?.[0]?.type || "")
            }
          >
            <ReactECharts
              ref={chartRef}
              option={sanitizedChartOption}
              style={{ height: "500px", width: "100%" }}
              opts={{ renderer: "canvas" }}
            />
          </ChartErrorBoundary>
        </div>
      </section>

      {/* Export Options */}
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="export-options-heading"
      >
        <div className="flex items-center mb-4">
          <Share2 className="w-5 h-5 text-green-500 mr-2" aria-hidden="true" />
          <h3
            id="export-options-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Export Options
          </h3>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          role="group"
          aria-labelledby="export-options-heading"
        >
          {/* React Component Export */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Code
                className="w-5 h-5 text-purple-500 mr-2"
                aria-hidden="true"
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                React Component
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Download ready-to-use React component code for developers
            </p>
            <button
              onClick={handleExportReact}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-describedby="react-export-description"
            >
              <Code className="w-4 h-4 mr-2" aria-hidden="true" />
              Export TSX
            </button>
            <p id="react-export-description" className="sr-only">
              Exports a TypeScript React component file that you can use in your
              own projects
            </p>
          </div>

          {/* Interactive HTML Export */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FileText
                className="w-5 h-5 text-green-500 mr-2"
                aria-hidden="true"
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Interactive HTML
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Self-contained HTML file for presentations and sharing
            </p>
            <button
              onClick={handleExportHTML}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 focus:bg-green-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-describedby="html-export-description"
            >
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
              Export HTML
            </button>
            <p id="html-export-description" className="sr-only">
              Exports a standalone HTML file with embedded chart that works in
              any web browser
            </p>
          </div>
        </div>

        <div
          className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
          role="note"
        >
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Export Benefits:
          </h4>
          <ul
            className="text-sm text-purple-800 dark:text-purple-200 space-y-1"
            role="list"
          >
            <li>
              • <strong>PNG/SVG:</strong> Perfect for presentations and
              documents
            </li>
            <li>
              • <strong>React Component:</strong> Easy integration into web
              applications
            </li>
            <li>
              • <strong>Interactive HTML:</strong> Standalone file with full
              interactivity
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ChartPreview;
