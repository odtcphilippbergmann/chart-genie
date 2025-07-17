// Script to create sample Excel file for testing
import * as XLSX from "xlsx";

// Sample data
const data = [
  {
    Product: "Laptop",
    "Q1 Sales": 15000,
    "Q2 Sales": 18000,
    "Q3 Sales": 22000,
    "Q4 Sales": 25000,
    Category: "Electronics",
  },
  {
    Product: "Smartphone",
    "Q1 Sales": 12000,
    "Q2 Sales": 15000,
    "Q3 Sales": 18000,
    "Q4 Sales": 20000,
    Category: "Electronics",
  },
  {
    Product: "Tablet",
    "Q1 Sales": 8000,
    "Q2 Sales": 9000,
    "Q3 Sales": 11000,
    "Q4 Sales": 13000,
    Category: "Electronics",
  },
  {
    Product: "Desk Chair",
    "Q1 Sales": 5000,
    "Q2 Sales": 5500,
    "Q3 Sales": 6000,
    "Q4 Sales": 6500,
    Category: "Furniture",
  },
  {
    Product: "Standing Desk",
    "Q1 Sales": 7000,
    "Q2 Sales": 8000,
    "Q3 Sales": 9000,
    "Q4 Sales": 10000,
    Category: "Furniture",
  },
  {
    Product: "Monitor",
    "Q1 Sales": 6000,
    "Q2 Sales": 7000,
    "Q3 Sales": 8000,
    "Q4 Sales": 9000,
    Category: "Electronics",
  },
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");

// Write to file
XLSX.writeFile(workbook, "./public/sample-sales-data.xlsx");

console.log("Sample Excel file created: public/sample-sales-data.xlsx");
