import React from "react";
import { Database, Info, TrendingUp } from "lucide-react";
import type { ParsedData } from "../utils/dataParser";

interface DataPreviewProps {
  data: ParsedData;
  insights: string[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, insights }) => {
  const maxRowsToShow = 10;
  const displayRows = data.rows.slice(0, maxRowsToShow);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Data Summary */}
      <section
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-labelledby="data-summary-heading"
      >
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-md mr-4">
            <Database className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h3
            id="data-summary-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Data Summary
          </h3>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          role="list"
          aria-label="Data statistics"
        >
          <div
            className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
            role="listitem"
          >
            <div
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
              aria-label={`${data.summary.totalRows} total rows`}
            >
              {data.summary.totalRows}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rows</div>
          </div>
          <div
            className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
            role="listitem"
          >
            <div
              className="text-2xl font-bold text-green-600 dark:text-green-400"
              aria-label={`${data.summary.totalColumns} total columns`}
            >
              {data.summary.totalColumns}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Columns
            </div>
          </div>
          <div
            className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
            role="listitem"
          >
            <div
              className="text-2xl font-bold text-purple-600 dark:text-purple-400"
              aria-label={`${data.summary.numericColumns.length} numeric columns`}
            >
              {data.summary.numericColumns.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Numeric
            </div>
          </div>
          <div
            className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
            role="listitem"
          >
            <div
              className="text-2xl font-bold text-orange-600 dark:text-orange-400"
              aria-label={`${data.summary.stringColumns.length} text columns`}
            >
              {data.summary.stringColumns.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Text</div>
          </div>
        </div>
      </section>

      {/* Data Insights */}
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="data-insights-heading"
      >
        <div className="flex items-center mb-4">
          <TrendingUp
            className="w-5 h-5 text-green-500 mr-2"
            aria-hidden="true"
          />
          <h3
            id="data-insights-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Data Insights
          </h3>
        </div>

        <ul
          className="space-y-2"
          role="list"
          aria-label="Data insights and recommendations"
        >
          {insights.map((insight, index) => (
            <li
              key={index}
              className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <Info
                className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {insight}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Column Information */}
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="column-types-heading"
      >
        <h3
          id="column-types-heading"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Column Types
        </h3>

        <ul
          className="grid gap-2"
          role="list"
          aria-label="Column information and data types"
        >
          {data.columns.map((column, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {column.name}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  column.type === "number"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : column.type === "date"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                }`}
                aria-label={`Column ${column.name} is of type ${column.type}`}
              >
                {column.type}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Data Table Preview */}
      <section
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="data-table-heading"
      >
        <h3
          id="data-table-heading"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Data Preview
          {data.summary.totalRows > maxRowsToShow && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              (showing first {maxRowsToShow} of {data.summary.totalRows} rows)
            </span>
          )}
        </h3>

        <div
          className="overflow-x-auto"
          role="region"
          aria-labelledby="data-table-heading"
          tabIndex={0}
        >
          <table
            className="min-w-full divide-y divide-gray-200 dark:divide-gray-600"
            role="table"
            aria-label="Data preview table"
          >
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr role="row">
                {data.columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {displayRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  role="row"
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      role="cell"
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {cell?.toString() || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DataPreview;
