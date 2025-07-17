// Data parsing and processing utilities
import Papa from "papaparse";
import * as XLSX from "xlsx";

export type DataValue = string | number | boolean | null;

export interface DataColumn {
  name: string;
  type: "string" | "number" | "date";
  values: DataValue[];
}

export interface ParsedData {
  columns: DataColumn[];
  rows: DataValue[][];
  summary: {
    totalRows: number;
    totalColumns: number;
    numericColumns: string[];
    stringColumns: string[];
    dateColumns: string[];
  };
}

export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, DataValue>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results: Papa.ParseResult<Record<string, DataValue>>) => {
        try {
          const parsedData = processData(results.data);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function parseJSON(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Find the array data in the JSON structure
        let dataArray: unknown[] = [];

        if (Array.isArray(jsonData)) {
          dataArray = jsonData;
        } else if (typeof jsonData === "object" && jsonData !== null) {
          // Look for array properties in the object
          const arrayKeys = Object.keys(jsonData).filter((key) =>
            Array.isArray(jsonData[key])
          );

          if (arrayKeys.length > 0) {
            // Use the first array found
            dataArray = jsonData[arrayKeys[0]];
          } else {
            // If no arrays found, treat the object as a single row
            dataArray = [jsonData];
          }
        } else {
          throw new Error("JSON data must be an object or array");
        }

        if (dataArray.length === 0) {
          throw new Error("No data rows found in JSON file");
        }

        const parsedData = processData(
          dataArray as Record<string, DataValue>[]
        );
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read JSON file"));
    reader.readAsText(file);
  });
}

export function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error("No worksheets found in Excel file");
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Use first row as header
          defval: null, // Default value for empty cells
          raw: false, // Don't use raw values, format them
        }) as unknown[][];

        if (jsonData.length === 0) {
          throw new Error("Excel file appears to be empty");
        }

        // Convert to object format expected by processData
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        const objectData: Record<string, DataValue>[] = rows.map((row) => {
          const rowObject: Record<string, DataValue> = {};
          headers.forEach((header, index) => {
            const value = (row as unknown[])[index];
            // Convert undefined to null and ensure proper typing
            rowObject[header] =
              value === undefined ? null : (value as DataValue);
          });
          return rowObject;
        });

        const parsedData = processData(objectData);
        resolve(parsedData);
      } catch (error) {
        console.error("Excel parsing error:", error);
        reject(
          new Error(
            `Failed to parse Excel file: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }
    };
    reader.onerror = () => reject(new Error("Failed to read Excel file"));
    reader.readAsArrayBuffer(file);
  });
}

function processData(rawData: Record<string, DataValue>[]): ParsedData {
  if (!rawData || rawData.length === 0) {
    throw new Error("No data found in file");
  }

  const firstRow = rawData[0];
  const columnNames = Object.keys(firstRow);

  const columns: DataColumn[] = columnNames.map((name) => {
    const values = rawData
      .map((row) => row[name])
      .filter((val) => val !== null && val !== undefined);
    const type = inferColumnType(values);

    return {
      name,
      type,
      values,
    };
  });

  const rows = rawData.map((row) => columnNames.map((col) => row[col]));

  const numericColumns = columns
    .filter((col) => col.type === "number")
    .map((col) => col.name);
  const stringColumns = columns
    .filter((col) => col.type === "string")
    .map((col) => col.name);
  const dateColumns = columns
    .filter((col) => col.type === "date")
    .map((col) => col.name);

  return {
    columns,
    rows,
    summary: {
      totalRows: rawData.length,
      totalColumns: columns.length,
      numericColumns,
      stringColumns,
      dateColumns,
    },
  };
}

function inferColumnType(values: DataValue[]): "string" | "number" | "date" {
  const nonEmptyValues = values.filter(
    (val) => val !== null && val !== undefined && val !== ""
  );

  if (nonEmptyValues.length === 0) return "string";

  // Check if all values are numbers
  const numericCount = nonEmptyValues.filter(
    (val) =>
      typeof val === "number" ||
      (!isNaN(Number(val)) && !isNaN(parseFloat(String(val))))
  ).length;

  if (numericCount === nonEmptyValues.length) {
    return "number";
  }

  // Check if values look like dates
  const dateCount = nonEmptyValues.filter((val) => {
    const date = new Date(String(val));
    return !isNaN(date.getTime()) && typeof val === "string";
  }).length;

  if (dateCount > nonEmptyValues.length * 0.8) {
    return "date";
  }

  return "string";
}

export function generateDataInsights(data: ParsedData): string[] {
  const insights: string[] = [];
  const { summary } = data;

  insights.push(
    `Dataset contains ${summary.totalRows} rows and ${summary.totalColumns} columns`
  );

  if (summary.numericColumns.length > 0) {
    insights.push(`Numeric columns: ${summary.numericColumns.join(", ")}`);
  }

  if (summary.stringColumns.length > 0) {
    insights.push(`Text columns: ${summary.stringColumns.join(", ")}`);
  }

  if (summary.dateColumns.length > 0) {
    insights.push(`Date columns: ${summary.dateColumns.join(", ")}`);
  }

  // Suggest chart types based on data structure
  if (summary.numericColumns.length >= 2) {
    insights.push("💡 Good for: Scatter plots, bubble charts");
  }

  if (summary.stringColumns.length >= 1 && summary.numericColumns.length >= 1) {
    insights.push("💡 Good for: Bar charts, pie charts, line charts");
  }

  if (summary.dateColumns.length >= 1 && summary.numericColumns.length >= 1) {
    insights.push("💡 Good for: Time series, trend analysis");
  }

  return insights;
}
