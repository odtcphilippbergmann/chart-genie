import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { openAIService } from "../utils/openaiService";
import type { ParsedData } from "../utils/dataParser";

interface DataAnalysisProps {
  data: ParsedData;
  context?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function DataAnalysis({ data, context, onAnalysisComplete }: DataAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    console.log("🎯 [DataAnalysis] Component mounted/data changed");
    analyzeData();
  }, [data]);

  const analyzeData = async () => {
    const hasApiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem("openai_api_key");
    if (!hasApiKey) {
      console.log("⚠️ [DataAnalysis] No API key found, skipping analysis");
      return;
    }

    console.log("🚀 [DataAnalysis] Starting analysis for data with", data.rows.length, "rows");
    setIsLoading(true);
    setError(null);

    try {
      const result = await openAIService.analyzeData(data, context);
      console.log("✅ [DataAnalysis] Analysis completed successfully");
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed";
      console.error("❌ [DataAnalysis] Analysis error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!import.meta.env.VITE_OPENAI_API_KEY && !localStorage.getItem("openai_api_key")) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Data Analysis
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <span className="text-sm text-gray-600">Analyzing...</span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Analyzing your data with AI...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Analysis Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Dataset Summary</h4>
                <p className="text-gray-600">{analysis.summary.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {analysis.summary.rowCount} rows
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {analysis.summary.columnCount} columns
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    analysis.summary.dataQuality === 'high' 
                      ? 'bg-green-100 text-green-700'
                      : analysis.summary.dataQuality === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {analysis.summary.dataQuality} quality
                  </span>
                </div>
              </div>

              {/* Key Insights */}
              {analysis.insights && analysis.insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>Key Insights</span>
                  </h4>
                  <ul className="space-y-2">
                    {analysis.insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span className="text-gray-600 text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Column Analysis */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Column Analysis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {analysis.columns.map((col: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 flex flex-col">
                      <div className="mb-2">
                        <div className="font-medium text-gray-900 text-sm truncate" title={col.name}>
                          {col.name}
                        </div>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
                          col.type === 'number' 
                            ? 'bg-blue-100 text-blue-700'
                            : col.type === 'date'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {col.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 flex-1 line-clamp-2">{col.description}</p>
                      {col.statistics && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {col.statistics.min !== undefined && typeof col.statistics.min === 'number' && (
                            <div>Min: {col.statistics.min.toFixed(2)}</div>
                          )}
                          {col.statistics.max !== undefined && typeof col.statistics.max === 'number' && (
                            <div>Max: {col.statistics.max.toFixed(2)}</div>
                          )}
                          {col.statistics.mean !== undefined && typeof col.statistics.mean === 'number' && (
                            <div>Avg: {col.statistics.mean.toFixed(2)}</div>
                          )}
                          {col.statistics.uniqueCount !== undefined && (
                            <div>Unique: {col.statistics.uniqueCount}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggle for Raw JSON */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {showRawJson ? "Hide" : "Show"} Raw JSON Response
                </button>
                
                {showRawJson && (
                  <div className="mt-3">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(analysis, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}