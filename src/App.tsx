import { useState, useCallback } from "react";
import { Sparkles, Database, BarChart3 } from "lucide-react";
import FileUpload from "./components/FileUpload";
import DataPreview from "./components/DataPreview";
import ChartSuggestions from "./components/ChartSuggestions";
import ChartPreview from "./components/ChartPreview";
import {
  parseCSV,
  parseJSON,
  parseExcel,
  generateDataInsights,
  type ParsedData,
} from "./utils/dataParser";
import {
  generateChartSuggestions,
  createEChartsOption,
  type ChartSuggestion,
  type EChartsOption,
} from "./utils/chartSuggestions";

function App() {
  const [currentStep, setCurrentStep] = useState<
    "upload" | "preview" | "chart"
  >("upload");
  const [chartLibrary, setChartLibrary] = useState<"echarts" | "nivo">(
    "echarts"
  );
  const [colorPalette, setColorPalette] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ParsedData | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ChartSuggestion | null>(null);
  const [chartOption, setChartOption] = useState<EChartsOption | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    try {
      let parsedData: ParsedData;

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      switch (fileExtension) {
        case "csv":
          parsedData = await parseCSV(file);
          break;
        case "json":
          parsedData = await parseJSON(file);
          break;
        case "xlsx":
        case "xls":
          parsedData = await parseExcel(file);
          break;
        default:
          throw new Error(
            "Unsupported file format. Please use CSV, JSON, or Excel files."
          );
      }

      const dataInsights = generateDataInsights(parsedData);
      const chartSuggestions = await generateChartSuggestions(parsedData);

      setData(parsedData);
      setInsights(dataInsights);
      setSuggestions(chartSuggestions);
      setCurrentStep("preview");

      // Auto-select the first suggestion
      if (chartSuggestions.length > 0) {
        const firstSuggestion = chartSuggestions[0];
        setSelectedSuggestion(firstSuggestion);
        const option = await createEChartsOption(firstSuggestion, parsedData);
        setChartOption(option);
      }
    } catch (error) {
      console.error("File processing error:", error);
      alert(error instanceof Error ? error.message : "Failed to process file");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSuggestionSelect = useCallback(
    async (suggestion: ChartSuggestion) => {
      if (!data) return;

      setSelectedSuggestion(suggestion);
      const option = await createEChartsOption(
        suggestion,
        data,
        suggestion.title
      );
      setChartOption(option);
      setCurrentStep("chart");
    },
    [data]
  );

  const handleReset = () => {
    setCurrentStep("upload");
    setData(null);
    setInsights([]);
    setSuggestions([]);
    setSelectedSuggestion(null);
    setChartOption(null);
  };

  const renderStepIndicator = () => (
    <nav
      className="flex items-center justify-center space-x-8 mb-16 animate-slide-up"
      aria-label="Progress indicator"
      role="navigation"
    >
      {[
        { step: "upload", icon: Database, label: "Upload Data" },
        { step: "preview", icon: BarChart3, label: "Choose Chart" },
        { step: "chart", icon: Sparkles, label: "Export & Share" },
      ].map(({ step, icon: Icon, label }, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-md transition-all duration-300 ${
              currentStep === step
                ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl scale-110"
                : (currentStep === "preview" && step === "upload") ||
                  (currentStep === "chart" && step !== "chart")
                ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
            }`}
            aria-label={`Step ${index + 1}: ${label} ${
              currentStep === step
                ? "(current)"
                : (currentStep === "preview" && step === "upload") ||
                  (currentStep === "chart" && step !== "chart")
                ? "(completed)"
                : "(upcoming)"
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <div
              className={`text-sm font-semibold ${
                currentStep === step
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Step {index + 1}
            </div>
          </div>
          {step !== "chart" && (
            <div
              className={`w-16 h-0.5 ml-8 rounded-full transition-all duration-300 ${
                currentStep === "chart" ||
                (currentStep === "preview" && step === "upload")
                  ? "bg-gradient-to-r from-purple-500 to-purple-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Skip Links */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-6 py-3 rounded-2xl z-50 shadow-lg font-medium"
      >
        Skip to main content
      </a>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl shadow-lg mr-4">
              <Sparkles className="w-12 h-12 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-indigo-600 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-indigo-500">
              ChartGenie
            </h1>
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            AI-Powered Interactive Chart Builder
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-light">
            From data upload to presentation-ready visuals
          </p>
          {data && (
            <button
              onClick={handleReset}
              className="mt-8 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl transition-all duration-300 ease-out shadow-md hover:shadow-lg transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 font-medium"
              aria-describedby="reset-description"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Start New Project
              </div>
            </button>
          )}
          <p id="reset-description" className="sr-only">
            Clear all current data and start over with a new file upload
          </p>
        </header>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <main
          id="main-content"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Upload Step - Full Width */}
          {currentStep === "upload" && (
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-full max-w-2xl">
                <FileUpload onFileSelect={handleFileSelect} loading={loading} />
              </div>
            </div>
          )}

          {/* Data Processing Steps */}
          {currentStep !== "upload" && (
            <>
              {/* top Row - Settings */}
              <div className="lg:col-span-3 mb-8 space-y-4">
                <div className="w-full lg:w-1/2 mx-auto">
                  {/* Chart Library Dropdown */}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chart Library
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={chartLibrary}
                    onChange={(e) =>
                      setChartLibrary(e.target.value as "echarts" | "nivo")
                    }
                  >
                    <option value="echarts">Apache ECharts</option>
                    <option value="nivo">Nivo (coming soon)</option>
                  </select>
                </div>

                <div className="w-full lg:w-1/2 mx-auto">
                  {/* Color Palette Dropdown */}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-4">
                    Color Palette
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="pastel">Pastel (coming soon)</option>
                    <option value="vibrant">Vibrant (coming soon)</option>
                    <option value="dark">Dark (coming soon)</option>
                  </select>
                </div>
              </div>
              {/* Left Column - Data Preview */}
              <div className="lg:col-span-1 space-y-6">
                {data && <DataPreview data={data} insights={insights} />}
              </div>

              {/* Middle Column - Chart Suggestions */}
              <div className="lg:col-span-1">
                <ChartSuggestions
                  suggestions={suggestions}
                  selectedSuggestion={selectedSuggestion}
                  onSelectSuggestion={handleSuggestionSelect}
                />
              </div>

              {/* Right Column - Chart Preview */}
              {currentStep === "chart" && (
                <div className="lg:col-span-1">
                  <ChartPreview
                    chartOption={chartOption}
                    title={selectedSuggestion?.title || "Generated Chart"}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Powered by Apache ECharts • Built with React & TypeScript
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
