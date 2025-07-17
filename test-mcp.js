#!/usr/bin/env node

/**
 * Test script to check if MCP ECharts server is available
 */

import { spawn } from "child_process";

console.log("🔍 Testing MCP ECharts server availability...\n");

// Test if we can run the MCP ECharts server
const mcpProcess = spawn("npx", ["-y", "mcp-echarts"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let output = "";
let errorOutput = "";

mcpProcess.stdout.on("data", (data) => {
  output += data.toString();
});

mcpProcess.stderr.on("data", (data) => {
  errorOutput += data.toString();
});

// Timeout after 5 seconds
const timeout = setTimeout(() => {
  mcpProcess.kill();
  console.log("❌ MCP ECharts server test timed out (5s)");
  console.log(
    "This usually means the server is not properly configured or not available.\n"
  );

  console.log("📋 To set up MCP ECharts server:");
  console.log("1. Make sure you have Node.js installed");
  console.log("2. The server should be available via: npx -y mcp-echarts");
  console.log("3. For Claude Desktop, add this to your config:");
  console.log(
    JSON.stringify(
      {
        mcpServers: {
          "mcp-echarts": {
            command: "npx",
            args: ["-y", "mcp-echarts"],
          },
        },
      },
      null,
      2
    )
  );

  process.exit(1);
}, 5000);

mcpProcess.on("close", (code) => {
  clearTimeout(timeout);

  if (code === 0) {
    console.log("✅ MCP ECharts server is available and working!");
    console.log("Output:", output);
  } else {
    console.log(`❌ MCP ECharts server exited with code ${code}`);
    if (errorOutput) {
      console.log("Error output:", errorOutput);
    }
    if (output) {
      console.log("Standard output:", output);
    }
  }

  console.log(
    "\n📝 Note: In ChartGenie, we have fallback logic that will work even without MCP ECharts."
  );
  console.log(
    "The app will automatically use local chart suggestions if MCP is not available."
  );
});

mcpProcess.on("error", (error) => {
  clearTimeout(timeout);
  console.log("❌ Failed to start MCP ECharts server:", error.message);

  if (error.code === "ENOENT") {
    console.log("\n🔧 This usually means:");
    console.log("- npx is not available in your PATH");
    console.log("- Node.js/npm is not properly installed");
    console.log("- mcp-echarts package cannot be found");
  }

  console.log(
    "\n📝 ChartGenie will work without MCP ECharts using local chart generation."
  );
});
