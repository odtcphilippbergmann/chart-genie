import { useState, useCallback } from "react";
import { Sparkles, Database, BarChart3 } from "lucide-react";
import { animate, stagger } from "motion";
import FileUpload from "./components/FileUpload";
import DataPreview from "./components/DataPreview";
import ChartSuggestions from "./components/ChartSuggestions";
import ChartPreview from "./components/ChartPreview";
import DataAnalysis from "./components/DataAnalysis";
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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ParsedData | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ChartSuggestion | null>(null);
  const [chartOption, setChartOption] = useState<EChartsOption | null>(null);
  const [dataContext, setDataContext] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const isOpenAIConfigured = !!import.meta.env.VITE_OPENAI_API_KEY;

  const handleFileSelect = useCallback(async (file: File, context?: string) => {
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
      setDataContext(context || "");
      setInsights(dataInsights);
      setSuggestions(chartSuggestions);
      setCurrentStep("preview");

      // Animate transition to preview step
      setTimeout(() => {
        animate(
          ".step-indicator",
          { scale: [0.95, 1] },
          { duration: 0.3 }
        );
        animate(
          ".preview-container",
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.6 }
        );
        animate(
          ".preview-item",
          { opacity: [0, 1], y: [30, 0] },
          { duration: 0.5, delay: stagger(0.1) }
        );
      }, 100);

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

      // Animate transition to chart step
      setTimeout(() => {
        animate(
          ".chart-container",
          { opacity: [0, 1], x: [30, 0] },
          { duration: 0.6 }
        );
      }, 100);
    },
    [data]
  );

  const handleReset = () => {
    // Animate fade out before reset
    animate(
      ".main-content",
      { opacity: [1, 0], y: [0, -20] },
      { duration: 0.4 }
    ).then(() => {
      setCurrentStep("upload");
      setData(null);
      setInsights([]);
      setSuggestions([]);
      setSelectedSuggestion(null);
      setChartOption(null);
      setAiAnalysis(null);
      
      // Animate fade in after reset
      setTimeout(() => {
        animate(
          ".upload-container",
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.6 }
        );
      }, 100);
    });
  };

  const renderStepIndicator = () => (
    <nav
      className="step-indicator flex items-center justify-center space-x-8 mb-16 animate-slide-up"
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
          className="main-content space-y-8"
        >
          {/* Upload Step - Full Width */}
          {currentStep === "upload" && (
            <div className="upload-container flex justify-center">
              <div className="w-full max-w-2xl">
                <FileUpload onFileSelect={handleFileSelect} loading={loading} />
              </div>
            </div>
          )}

          {/* Data Processing Steps */}
          {currentStep !== "upload" && (
            <div className="preview-container">
              {/* AI Analysis - Full Width at Top */}
              {data && isOpenAIConfigured && (
                <div className="preview-item w-full mb-8">
                  <DataAnalysis 
                    data={data} 
                    context={dataContext} 
                    onAnalysisComplete={setAiAnalysis}
                  />
                </div>
              )}

              {/* Three Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Data Preview */}
                <div className="preview-item lg:col-span-1">
                  {data && <DataPreview data={data} insights={insights} aiAnalysis={aiAnalysis} />}
                </div>

                {/* Middle Column - Chart Suggestions */}
                <div className="preview-item lg:col-span-1">
                  <ChartSuggestions
                    suggestions={suggestions}
                    selectedSuggestion={selectedSuggestion}
                    onSelectSuggestion={handleSuggestionSelect}
                    aiAnalysis={aiAnalysis}
                  />
                </div>

                {/* Right Column - Chart Preview */}
                {currentStep === "chart" && (
                  <div className="chart-container lg:col-span-1">
                    <ChartPreview
                      chartOption={chartOption}
                      title={selectedSuggestion?.title || "Generated Chart"}
                      aiAnalysis={aiAnalysis}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default App;
