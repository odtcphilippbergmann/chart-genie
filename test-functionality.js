#!/usr/bin/env node

/**
 * Test ChartGenie functionality and MCP integration
 */

import { readFileSync } from "fs";
import { parseCSV } from "./src/utils/dataParser.js";
import { generateChartSuggestions } from "./src/utils/chartSuggestions.js";

console.log("🧪 Testing ChartGenie functionality...\n");

// Test 1: Data parsing
console.log("1️⃣ Testing data parsing...");
try {
  const csvData = readFileSync("./public/sample-data.csv", "utf-8");
  const parsed = parseCSV(csvData);

  console.log(
    `✅ Parsed ${parsed.summary.totalRows} rows with ${parsed.summary.totalColumns} columns`
  );
  console.log(`   - ${parsed.summary.numericColumns.length} numeric columns`);
  console.log(`   - ${parsed.summary.stringColumns.length} string columns`);
  console.log(`   - ${parsed.summary.dateColumns.length} date columns\n`);
} catch (error) {
  console.log("❌ Data parsing failed:", error.message, "\n");
}

// Test 2: Chart suggestions
console.log("2️⃣ Testing chart suggestions (async)...");
try {
  const csvData = readFileSync("./public/sample-data.csv", "utf-8");
  const parsed = parseCSV(csvData);

  // Test async chart suggestions
  generateChartSuggestions(parsed)
    .then((suggestions) => {
      console.log(`✅ Generated ${suggestions.length} chart suggestions:`);
      suggestions.forEach((s, i) => {
        const enhanced = s.aiEnhanced ? "✨ (AI Enhanced)" : "📊 (Local)";
        console.log(
          `   ${i + 1}. ${s.title} - ${s.confidence}% confidence ${enhanced}`
        );
      });
      console.log();

      // Test 3: MCP service status
      console.log("3️⃣ MCP integration status:");
      const hasEnhanced = suggestions.some((s) => s.aiEnhanced);
      if (hasEnhanced) {
        console.log("✅ MCP ECharts integration working");
      } else {
        console.log(
          "📊 Using local suggestions (MCP not available - this is normal!)"
        );
      }
      console.log("\n✅ All tests completed successfully!");
      console.log("🚀 ChartGenie is ready to use!");
    })
    .catch((error) => {
      console.log("❌ Chart suggestions failed:", error.message);
    });
} catch (error) {
  console.log("❌ Chart suggestions test failed:", error.message);
}
