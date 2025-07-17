// Quick test to verify Excel parsing works
import { parseExcel } from "./src/utils/dataParser.ts";
import fs from "fs";

// Read the sample Excel file
const filePath = "./public/sample-sales-data.xlsx";
const buffer = fs.readFileSync(filePath);

// Create a File-like object for testing
const file = new File([buffer], "sample-sales-data.xlsx", {
  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
});

try {
  const result = await parseExcel(file);
  console.log("Excel parsing successful!");
  console.log(
    "Columns:",
    result.columns.map((c) => `${c.name} (${c.type})`)
  );
  console.log("Summary:", result.summary);
  console.log("First few rows:", result.rows.slice(0, 3));
} catch (error) {
  console.error("Excel parsing failed:", error);
}
