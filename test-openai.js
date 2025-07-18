// Test script for OpenAI integration
// Run with: node test-openai.js

const testOpenAI = async () => {
  console.log("🧪 Testing OpenAI Data Analysis Integration\n");

  // Sample data structure similar to what the app uses
  const sampleParsedData = {
    columns: [
      {
        name: "Month",
        type: "string",
        values: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
      {
        name: "Sales",
        type: "number",
        values: [45000, 52000, 48000, 61000, 58000, 67000]
      },
      {
        name: "Profit",
        type: "number",
        values: [12000, 15000, 13500, 18000, 16500, 21000]
      },
      {
        name: "Region",
        type: "string",
        values: ["North", "North", "South", "East", "West", "East"]
      }
    ],
    rows: [
      ["Jan", 45000, 12000, "North"],
      ["Feb", 52000, 15000, "North"],
      ["Mar", 48000, 13500, "South"],
      ["Apr", 61000, 18000, "East"],
      ["May", 58000, 16500, "West"],
      ["Jun", 67000, 21000, "East"]
    ],
    summary: {
      totalRows: 6,
      totalColumns: 4,
      numericColumns: ["Sales", "Profit"],
      stringColumns: ["Month", "Region"],
      dateColumns: [],
      hasNullValues: false
    }
  };

  console.log("📊 Sample Data Structure:");
  console.log("- Columns:", sampleParsedData.columns.map(c => `${c.name} (${c.type})`).join(", "));
  console.log("- Rows:", sampleParsedData.summary.totalRows);
  console.log();

  console.log("🤖 Expected OpenAI Analysis Response:");
  const expectedResponse = {
    summary: {
      description: "Monthly sales and profit data across different regions",
      rowCount: 6,
      columnCount: 4,
      dataQuality: "high"
    },
    columns: [
      {
        name: "Month",
        type: "string",
        description: "Month of the year for temporal analysis",
        sampleValues: ["Jan", "Feb", "Mar", "Apr", "May"],
        statistics: { uniqueCount: 6 }
      },
      {
        name: "Sales",
        type: "number",
        description: "Total sales revenue in dollars",
        sampleValues: [45000, 52000, 48000, 61000, 58000],
        statistics: {
          min: 45000,
          max: 67000,
          mean: 55166.67,
          uniqueCount: 6
        }
      },
      {
        name: "Profit",
        type: "number",
        description: "Net profit after expenses",
        sampleValues: [12000, 15000, 13500, 18000, 16500],
        statistics: {
          min: 12000,
          max: 21000,
          mean: 16000,
          uniqueCount: 6
        }
      },
      {
        name: "Region",
        type: "string",
        description: "Geographic region of operations",
        sampleValues: ["North", "South", "East", "West"],
        statistics: { uniqueCount: 4 }
      }
    ],
    insights: [
      "Sales show an upward trend from $45,000 to $67,000 (48.9% growth)",
      "Profit margins remain consistent at approximately 27-31% of sales",
      "East region shows the highest performance in both April and June",
      "The data represents 6 months of business performance across 4 regions"
    ],
    recommendations: [
      {
        chartType: "line",
        reason: "Perfect for showing sales and profit trends over time",
        columns: {
          x: "Month",
          y: ["Sales", "Profit"]
        }
      },
      {
        chartType: "bar",
        reason: "Compare sales performance across different regions",
        columns: {
          category: "Region",
          value: "Sales"
        }
      },
      {
        chartType: "scatter",
        reason: "Analyze the correlation between sales and profit",
        columns: {
          x: "Sales",
          y: ["Profit"]
        }
      },
      {
        chartType: "area",
        reason: "Visualize cumulative sales growth over time",
        columns: {
          x: "Month",
          y: ["Sales"]
        }
      }
    ]
  };

  console.log(JSON.stringify(expectedResponse, null, 2));
  console.log();

  console.log("✅ Test Setup Complete!");
  console.log("\n📝 Instructions to test in the app:");
  console.log("1. Start the app with: npm run dev");
  console.log("2. Click the key icon in the top-right corner");
  console.log("3. Enter your OpenAI API key");
  console.log("4. Upload a test data file (CSV, JSON, or Excel)");
  console.log("5. The AI Data Analysis panel will appear below the data preview");
  console.log("6. Click 'Show Raw JSON Response' to see the full API response");
  console.log("\n⚠️  Note: You need a valid OpenAI API key with access to GPT-4");
};

testOpenAI();