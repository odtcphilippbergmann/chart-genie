// Simple test script to verify radar chart creation
import {
  analyzeDataAndSuggestCharts,
  generateChartConfig,
} from "./src/utils/chartSuggestions.ts";

// Mock data that should trigger radar chart suggestions
const mockData = {
  columns: [
    { name: "Product", type: "string" },
    { name: "Performance", type: "number" },
    { name: "Quality", type: "number" },
    { name: "Price", type: "number" },
    { name: "Support", type: "number" },
  ],
  rows: [
    ["Product A", 85, 90, 75, 80],
    ["Product B", 75, 85, 85, 70],
    ["Product C", 90, 80, 70, 85],
  ],
  summary: {
    rowCount: 3,
    columnCount: 5,
    numericColumns: ["Performance", "Quality", "Price", "Support"],
    stringColumns: ["Product"],
  },
};

console.log("Testing radar chart generation...");

try {
  // Test suggestion generation
  const suggestions = analyzeDataAndSuggestCharts(mockData);
  console.log("Generated suggestions:", suggestions.length);

  // Find radar suggestion
  const radarSuggestion = suggestions.find((s) => s.type === "radar");
  if (!radarSuggestion) {
    console.log("No radar suggestion found");
    process.exit(1);
  }

  console.log("Found radar suggestion:", radarSuggestion.title);

  // Test chart config generation
  const chartConfig = generateChartConfig(radarSuggestion, mockData);
  console.log("Generated chart config:", chartConfig.title);
  console.log("Has radar property:", !!chartConfig.radar);
  console.log("Series count:", chartConfig.series?.length || 0);
  console.log("Series types:", chartConfig.series?.map((s) => s.type) || []);

  console.log("✅ Radar chart test passed!");
} catch (error) {
  console.error("❌ Radar chart test failed:", error);
  process.exit(1);
}
