import React from "react";
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  TrendingUp,
  Lightbulb,
  Zap,
  Target,
  TreePine,
  Globe,
  Activity,
  GitBranch,
  Layers,
  Compass,
  Network,
  Filter,
  BarChart2,
  Gauge,
  Bot,
} from "lucide-react";
import type { ChartSuggestion } from "../utils/chartSuggestions";

interface ChartSuggestionsProps {
  suggestions: ChartSuggestion[];
  selectedSuggestion: ChartSuggestion | null;
  onSelectSuggestion: (suggestion: ChartSuggestion) => void;
}

const ChartSuggestions: React.FC<ChartSuggestionsProps> = ({
  suggestions,
  selectedSuggestion,
  onSelectSuggestion,
}) => {
  const getChartIcon = (type: string) => {
    switch (type) {
      case "bar":
        return BarChart3;
      case "line":
        return LineChart;
      case "pie":
        return PieChart;
      case "scatter":
        return ScatterChart;
      case "area":
        return TrendingUp;
      case "radar":
        return Compass;
      case "heatmap":
        return Layers;
      case "funnel":
        return Filter;
      case "gauge":
        return Gauge;
      case "tree":
        return TreePine;
      case "treemap":
        return BarChart2;
      case "sunburst":
        return Globe;
      case "parallel":
        return Activity;
      case "sankey":
        return GitBranch;
      case "graph":
        return Network;
      case "boxplot":
        return Target;
      case "candlestick":
        return Zap;
      case "themeRiver":
        return Bot;
      default:
        return BarChart3;
    }
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "simple":
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80)
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (confidence >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  return (
    <div className="space-y-6">
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="chart-suggestions-heading"
      >
        <div className="flex items-center mb-6">
          <Lightbulb
            className="w-5 h-5 text-yellow-500 mr-2"
            aria-hidden="true"
          />
          <h3
            id="chart-suggestions-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            AI Chart Suggestions
          </h3>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-8" role="status" aria-live="polite">
            <div className="text-gray-500 dark:text-gray-400">
              No chart suggestions available. Please upload data first.
            </div>
          </div>
        ) : (
          <div
            className="grid gap-4"
            role="group"
            aria-labelledby="chart-suggestions-heading"
          >
            {suggestions.map((suggestion, index) => {
              const IconComponent = getChartIcon(suggestion.type);
              const isSelected = selectedSuggestion?.type === suggestion.type;

              return (
                <button
                  key={index}
                  onClick={() => onSelectSuggestion(suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectSuggestion(suggestion);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                  aria-pressed={isSelected}
                  aria-describedby={`suggestion-${index}-details`}
                >
                  <div className="flex flex-col space-y-4">
                    {/* Header with icon, title, and confidence */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-3 rounded-xl ${
                            isSelected
                              ? "bg-indigo-100 dark:bg-indigo-800"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${
                              isSelected
                                ? "text-indigo-600 dark:text-indigo-300"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            {suggestion.aiEnhanced && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                <Bot className="w-3 h-3 mr-1" />
                                AI Enhanced
                              </span>
                            )}
                            {suggestion.complexity && (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(
                                  suggestion.complexity
                                )}`}
                              >
                                {suggestion.complexity}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end space-y-1">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                            suggestion.confidence
                          )}`}
                          aria-label={`${suggestion.confidence}% confidence level`}
                        >
                          {suggestion.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Use case and preview if available */}
                    {(suggestion.useCase || suggestion.preview) && (
                      <div className="space-y-2">
                        {suggestion.useCase && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Best for:</span>{" "}
                            {suggestion.useCase}
                          </div>
                        )}
                        {suggestion.preview && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Preview:</span>{" "}
                            {suggestion.preview}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reasoning */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{suggestion.reasoning}</span>
                      </div>
                    </div>

                    {/* Chart Configuration */}
                    <div
                      className="flex flex-wrap gap-2 text-xs"
                      id={`suggestion-${index}-details`}
                    >
                      {suggestion.xAxis && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md">
                          X: {suggestion.xAxis}
                        </span>
                      )}
                      {suggestion.yAxis && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md">
                          Y: {suggestion.yAxis.join(", ")}
                        </span>
                      )}
                      {suggestion.series && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                          Series: {suggestion.series}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {suggestions.length > 0 && (
          <div
            className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
            role="note"
          >
            <div className="flex items-start">
              <Lightbulb
                className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="text-sm text-purple-800 dark:text-purple-300">
                <strong>Pro Tip:</strong> Higher confidence scores indicate
                better matches for your data structure. Click on any suggestion
                to preview the chart!
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChartSuggestions;
