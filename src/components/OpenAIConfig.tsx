import { useState, useEffect } from "react";
import { Key, CheckCircle, XCircle, Loader } from "lucide-react";
import { openAIService } from "../utils/openaiService";

interface OpenAIConfigProps {
  onConfigured: (isConfigured: boolean) => void;
}

export default function OpenAIConfig({ onConfigured }: OpenAIConfigProps) {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("🔧 [OpenAIConfig] Initializing configuration...");
    
    // Check if API key is in environment variables first
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envKey) {
      console.log("✅ [OpenAIConfig] Using API key from environment variables");
      setApiKey(envKey);
      openAIService.setApiKey(envKey);
      setIsConfigured(true);
      onConfigured(true);
      return;
    }
    
    // Otherwise check localStorage
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey) {
      console.log("✅ [OpenAIConfig] Using API key from localStorage");
      setApiKey(storedKey);
      openAIService.setApiKey(storedKey);
      setIsConfigured(true);
      onConfigured(true);
    } else {
      console.log("⚠️ [OpenAIConfig] No API key found");
    }
  }, [onConfigured]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;

    console.log("🔑 [OpenAIConfig] Testing and saving API key...");
    setIsTesting(true);
    openAIService.setApiKey(apiKey);

    try {
      const isValid = await openAIService.testConnection();
      setTestResult(isValid);

      if (isValid) {
        console.log("✅ [OpenAIConfig] API key validated and saved");
        localStorage.setItem("openai_api_key", apiKey);
        setIsConfigured(true);
        onConfigured(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 1500);
      } else {
        console.error("❌ [OpenAIConfig] API key validation failed");
      }
    } catch (error) {
      console.error("❌ [OpenAIConfig] Error during API key validation:", error);
      setTestResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem("openai_api_key");
    setApiKey("");
    setIsConfigured(false);
    setTestResult(null);
    openAIService.setApiKey("");
    onConfigured(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-lg transition-all ${
          isConfigured
            ? "bg-green-50 text-green-600 hover:bg-green-100"
            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
        }`}
        title={isConfigured ? "OpenAI Connected" : "Configure OpenAI"}
      >
        <Key className="w-5 h-5" />
      </button>

      {/* Configuration Panel */}
      {isVisible && (
        <div className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            OpenAI Configuration
          </h3>

          {isConfigured ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Connected to OpenAI</span>
              </div>
              <p className="text-sm text-gray-600">
                Your data will be analyzed using GPT-4 for enhanced insights and recommendations.
              </p>
              <button
                onClick={handleRemoveKey}
                className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Disconnect OpenAI
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Connect to OpenAI for AI-powered data analysis and chart recommendations.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {testResult === false && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Invalid API key or connection failed</span>
                </div>
              )}

              <button
                onClick={handleSaveKey}
                disabled={!apiKey.trim() || isTesting}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isTesting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <span>Connect to OpenAI</span>
                )}
              </button>

              <p className="text-xs text-gray-500">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}