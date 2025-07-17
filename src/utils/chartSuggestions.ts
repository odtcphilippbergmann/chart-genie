// Chart recommendation and configuration utilities
import type { ParsedData } from "./dataParser";
import { mcpEChartsService } from "./mcpEChartsService";

export interface ChartSuggestion {
  type:
    | "bar"
    | "line"
    | "pie"
    | "scatter"
    | "area"
    | "radar"
    | "heatmap"
    | "funnel"
    | "gauge"
    | "tree"
    | "treemap"
    | "sunburst"
    | "parallel"
    | "sankey"
    | "graph"
    | "boxplot"
    | "candlestick"
    | "themeRiver";
  title: string;
  description: string;
  confidence: number; // 0-100
  xAxis?: string;
  yAxis?: string[];
  series?: string;
  reasoning: string;
  aiEnhanced?: boolean; // Indicates if suggestion came from MCP
  preview?: string; // Mini preview description
  useCase?: string; // When to use this chart
  complexity?: "simple" | "intermediate" | "advanced";
}

export interface EChartsOption {
  title: {
    text: string;
    left: string;
  };
  tooltip: Record<string, unknown>;
  legend?: Record<string, unknown>;
  xAxis?: Record<string, unknown>;
  yAxis?: Record<string, unknown>;
  series: Record<string, unknown>[];
  color?: string[]; // Add color property to fix TypeScript errors
  radar?: Record<string, unknown>; // For radar charts
  visualMap?: Record<string, unknown>; // For heatmaps
  parallelAxis?: Record<string, unknown>[]; // For parallel coordinates
  parallel?: Record<string, unknown>; // For parallel charts
}

export async function generateChartSuggestions(
  data: ParsedData
): Promise<ChartSuggestion[]> {
  // Try to get enhanced suggestions from MCP ECharts first
  try {
    await mcpEChartsService.initialize();
    const mcpSuggestions = await mcpEChartsService.generateEnhancedSuggestions(
      data
    );

    if (mcpSuggestions.length > 0) {
      return mcpSuggestions.map((s) => ({ ...s, aiEnhanced: true }));
    }
  } catch (error) {
    console.warn("MCP ECharts not available, using local suggestions:", error);
  }

  // Fallback to local suggestions
  console.log("📊 Using local chart suggestions");
  return generateLocalSuggestions(data);
}

function generateLocalSuggestions(data: ParsedData): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  const { summary } = data;

  // Bar Chart suggestions
  if (summary.stringColumns.length >= 1 && summary.numericColumns.length >= 1) {
    suggestions.push({
      type: "bar",
      title: "Category Comparison",
      description:
        "Compare values across different categories with clear visual bars",
      confidence: 85,
      xAxis: summary.stringColumns[0],
      yAxis: [summary.numericColumns[0]],
      reasoning:
        "Categorical data with numeric values - ideal for comparison visualization",
      useCase:
        "Comparing sales by product, performance by team, or values by category",
      complexity: "simple",
    });
  }

  // Line Chart suggestions
  if (summary.dateColumns.length >= 1 && summary.numericColumns.length >= 1) {
    suggestions.push({
      type: "line",
      title: "Time Series Trends",
      description:
        "Track changes and trends over time with connected data points",
      confidence: 90,
      xAxis: summary.dateColumns[0],
      yAxis: [summary.numericColumns[0]],
      reasoning: "Time-based data perfect for trend analysis and forecasting",
      useCase:
        "Stock prices, website traffic, sales over time, or any temporal data",
      complexity: "simple",
    });
  }

  // Pie Chart suggestions
  if (summary.stringColumns.length >= 1 && summary.numericColumns.length >= 1) {
    suggestions.push({
      type: "pie",
      title: "Proportion Analysis",
      description: "Show how parts relate to the whole with intuitive slices",
      confidence: 70,
      series: summary.stringColumns[0],
      reasoning:
        "Categorical data suitable for showing parts of a whole relationship",
      useCase:
        "Market share, budget allocation, survey responses, or composition analysis",
      complexity: "simple",
    });
  }

  // Scatter Plot suggestions
  if (summary.numericColumns.length >= 2) {
    suggestions.push({
      type: "scatter",
      title: "Correlation Explorer",
      description:
        "Discover relationships and patterns between two numeric variables",
      confidence: 80,
      xAxis: summary.numericColumns[0],
      yAxis: [summary.numericColumns[1]],
      reasoning:
        "Multiple numeric variables enable correlation and pattern analysis",
      useCase:
        "Height vs weight, advertising spend vs sales, or any two-variable relationship",
      complexity: "intermediate",
    });
  }

  // Area Chart suggestions
  if (summary.dateColumns.length >= 1 && summary.numericColumns.length >= 1) {
    suggestions.push({
      type: "area",
      title: "Cumulative Timeline",
      description:
        "Emphasize volume and cumulative values over time with filled areas",
      confidence: 75,
      xAxis: summary.dateColumns[0],
      yAxis: [summary.numericColumns[0]],
      reasoning:
        "Time series data with emphasis on cumulative values and volume",
      useCase:
        "Revenue accumulation, user growth, inventory levels, or volume over time",
      complexity: "simple",
    });
  }

  // Radar Chart for multiple metrics
  if (summary.numericColumns.length >= 3) {
    suggestions.push({
      type: "radar",
      title: "Multi-Metric Comparison",
      description:
        "Compare multiple metrics simultaneously with spider web visualization",
      confidence: 75,
      reasoning:
        "Multiple numeric dimensions perfect for comprehensive comparison",
      useCase:
        "Performance evaluation, skill assessment, product comparison across features",
      complexity: "intermediate",
    });
  }

  // Heatmap for dense data
  if (summary.numericColumns.length >= 2 && summary.stringColumns.length >= 1) {
    suggestions.push({
      type: "heatmap",
      title: "Pattern Heatmap",
      description: "Reveal patterns in dense data using color intensity",
      confidence: 65,
      reasoning:
        "Dense data structure ideal for pattern recognition through color coding",
      useCase:
        "Website activity, correlation matrices, time-based patterns, or density visualization",
      complexity: "advanced",
    });
  }

  // Sort by confidence score
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

export async function createEChartsOption(
  suggestion: ChartSuggestion,
  data: ParsedData,
  title?: string
): Promise<EChartsOption> {
  // Try to use MCP ECharts for enhanced configuration
  if (suggestion.aiEnhanced) {
    try {
      const mcpConfig = await mcpEChartsService.generateEChartsConfig(
        suggestion,
        data
      );
      if (mcpConfig && isValidEChartsOption(mcpConfig)) {
        console.log("✨ Using MCP ECharts enhanced configuration");
        return mcpConfig as unknown as EChartsOption;
      }
    } catch (error) {
      console.warn("Failed to get MCP ECharts config, using fallback:", error);
    }
  }

  // Fallback to local chart generation
  console.log("📊 Using local chart configuration");
  return createLocalEChartsOption(suggestion, data, title);
}

// Helper function to validate if MCP config matches EChartsOption structure
function isValidEChartsOption(config: Record<string, unknown>): boolean {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "tooltip" in config &&
    "series" in config &&
    Array.isArray(config.series)
  );
}

function createLocalEChartsOption(
  suggestion: ChartSuggestion,
  data: ParsedData,
  title?: string
): EChartsOption {
  const chartTitle = title || suggestion.title;
  const baseConfig: EChartsOption = {
    title: {
      text: chartTitle,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      textStyle: {
        color: "#374151",
      },
    },
    series: [],
  };

  // Enhanced color scheme for indigo/purple theme
  const colorPalette = [
    "#6366f1", // indigo-500
    "#8b5cf6", // purple-500
    "#06b6d4", // cyan-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#ec4899", // pink-500
    "#6d28d9", // violet-700
  ];

  let chartConfig: EChartsOption;

  try {
    switch (suggestion.type) {
      case "bar":
        chartConfig = createBarChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "line":
        chartConfig = createLineChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "pie":
        chartConfig = createPieChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "scatter":
        chartConfig = createScatterChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "area":
        chartConfig = createAreaChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "radar":
        chartConfig = createRadarChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "heatmap":
        chartConfig = createHeatmapChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "funnel":
        chartConfig = createFunnelChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "gauge":
        chartConfig = createGaugeChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "treemap":
        chartConfig = createTreemapChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "sunburst":
        chartConfig = createSunburstChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "parallel":
        chartConfig = createParallelChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "sankey":
        chartConfig = createSankeyChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "graph":
        chartConfig = createGraphChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "boxplot":
        chartConfig = createBoxplotChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "candlestick":
        chartConfig = createCandlestickChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      case "themeRiver":
        chartConfig = createThemeRiverChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
      default:
        console.warn(
          `Chart type "${suggestion.type}" not implemented, falling back to bar chart`
        );
        chartConfig = createBarChart(
          baseConfig,
          data,
          suggestion,
          colorPalette
        );
        break;
    }
  } catch (error) {
    console.error(`Error creating ${suggestion.type} chart:`, error);
    console.log("Falling back to bar chart");
    chartConfig = createBarChart(baseConfig, data, suggestion, colorPalette);
  }

  // Validate and sanitize the series array before returning
  if (chartConfig.series && Array.isArray(chartConfig.series)) {
    chartConfig.series = validateAndSanitizeSeries(chartConfig.series);

    // Final safety check - ensure no series is undefined and all have types
    chartConfig.series = chartConfig.series.filter((s) => {
      if (!s || !s.type) {
        console.error("Found invalid series after validation:", s);
        return false;
      }
      return true;
    });

    // If all series were filtered out, add a safe fallback
    if (chartConfig.series.length === 0) {
      console.warn("All series were filtered out, adding safe fallback");
      chartConfig.series = [
        {
          type: "bar",
          data: [0],
          name: "No Data",
        },
      ];
    }
  } else {
    console.warn("Chart config has no series array, adding safe fallback");
    chartConfig.series = [
      {
        type: "bar",
        data: [0],
        name: "No Data",
      },
    ];
  }

  console.log("Final chart config series:", chartConfig.series);
  return chartConfig;
}

// Chart type specific creators
function createBarChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const xAxisColumn = suggestion.xAxis || data.summary.stringColumns[0];
  const yAxisColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const xAxisIndex = data.columns.findIndex((col) => col.name === xAxisColumn);
  const yAxisIndex = data.columns.findIndex((col) => col.name === yAxisColumn);

  if (xAxisIndex === -1 || yAxisIndex === -1) {
    throw new Error("Cannot find specified columns for chart");
  }

  return {
    ...baseConfig,
    color: colors,
    xAxis: {
      type: "category",
      data: data.rows.map((row) => row[xAxisIndex]),
      axisLabel: {
        color: "#6b7280",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#d1d5db",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#d1d5db",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#f3f4f6",
        },
      },
    },
    series: [
      {
        name: yAxisColumn,
        type: "bar",
        data: data.rows.map((row) => row[yAxisIndex]),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
      },
    ],
  };
}

function createLineChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const xAxisColumn =
    suggestion.xAxis ||
    data.summary.dateColumns[0] ||
    data.summary.stringColumns[0];
  const yAxisColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const xAxisIndex = data.columns.findIndex((col) => col.name === xAxisColumn);
  const yAxisIndex = data.columns.findIndex((col) => col.name === yAxisColumn);

  return {
    ...baseConfig,
    color: colors,
    xAxis: {
      type: "category",
      data: data.rows.map((row) => row[xAxisIndex]),
      axisLabel: {
        color: "#6b7280",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280",
      },
    },
    series: [
      {
        name: yAxisColumn,
        type: "line",
        data: data.rows.map((row) => row[yAxisIndex]),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          opacity: 0.1,
        },
      },
    ],
  };
}

function createPieChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const categoryColumn = suggestion.series || data.summary.stringColumns[0];
  const valueColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const categoryIndex = data.columns.findIndex(
    (col) => col.name === categoryColumn
  );
  const valueIndex = data.columns.findIndex((col) => col.name === valueColumn);

  const pieData = data.rows.map((row) => ({
    name: row[categoryIndex],
    value: row[valueIndex],
  }));

  return {
    ...baseConfig,
    color: colors,
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "#6b7280",
      },
    },
    series: [
      {
        name: categoryColumn,
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
}

function createScatterChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const xAxisColumn = suggestion.xAxis || data.summary.numericColumns[0];
  const yAxisColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[1];

  const xAxisIndex = data.columns.findIndex((col) => col.name === xAxisColumn);
  const yAxisIndex = data.columns.findIndex((col) => col.name === yAxisColumn);

  const scatterData = data.rows.map((row) => [
    row[xAxisIndex],
    row[yAxisIndex],
  ]);

  return {
    ...baseConfig,
    color: colors,
    xAxis: {
      type: "value",
      name: xAxisColumn,
      axisLabel: {
        color: "#6b7280",
      },
    },
    yAxis: {
      type: "value",
      name: yAxisColumn,
      axisLabel: {
        color: "#6b7280",
      },
    },
    series: [
      {
        name: `${xAxisColumn} vs ${yAxisColumn}`,
        type: "scatter",
        data: scatterData,
        symbolSize: 8,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    ],
  };
}

function createAreaChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const xAxisColumn =
    suggestion.xAxis ||
    data.summary.dateColumns[0] ||
    data.summary.stringColumns[0];
  const yAxisColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const xAxisIndex = data.columns.findIndex((col) => col.name === xAxisColumn);
  const yAxisIndex = data.columns.findIndex((col) => col.name === yAxisColumn);

  return {
    ...baseConfig,
    color: colors,
    xAxis: {
      type: "category",
      data: data.rows.map((row) => row[xAxisIndex]),
      axisLabel: {
        color: "#6b7280",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280",
      },
    },
    series: [
      {
        name: yAxisColumn,
        type: "line",
        data: data.rows.map((row) => row[yAxisIndex]),
        smooth: true,
        areaStyle: {
          opacity: 0.6,
        },
        lineStyle: {
          width: 2,
        },
      },
    ],
  };
}

function createRadarChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  _suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const numericColumns = data.summary.numericColumns.slice(0, 6); // Limit to 6 metrics for readability

  // Fallback if no numeric columns available
  if (numericColumns.length === 0) {
    return {
      ...baseConfig,
      color: colors,
      series: [
        {
          type: "bar",
          data: [0],
          itemStyle: {
            color: colors[0],
          },
        },
      ],
      xAxis: {
        type: "category",
        data: ["No Data"],
      },
      yAxis: {
        type: "value",
      },
    };
  }

  const categoryColumn = data.summary.stringColumns[0];
  const categoryIndex = data.columns.findIndex(
    (col) => col.name === categoryColumn
  );

  // Create radar indicator with safe max calculation
  const radar = {
    indicator: numericColumns.map((col) => {
      const colIndex = data.columns.findIndex((c) => c.name === col);
      const values = data.rows
        .map((row) => Number(row[colIndex]) || 0)
        .filter((val) => !isNaN(val) && isFinite(val));

      const maxValue = values.length > 0 ? Math.max(...values) : 100;

      return {
        name: col,
        max: maxValue * 1.2 || 100, // Ensure we have a valid max value
      };
    }),
  };

  // Create safe data series
  const seriesData = data.rows.slice(0, 5).map((row, index) => {
    const values = numericColumns.map((col) => {
      const colIndex = data.columns.findIndex((c) => c.name === col);
      const value = Number(row[colIndex]) || 0;
      return isNaN(value) || !isFinite(value) ? 0 : value;
    });

    return {
      value: values,
      name:
        categoryIndex >= 0 && row[categoryIndex] !== undefined
          ? String(row[categoryIndex])
          : `Item ${index + 1}`,
    };
  });

  return {
    ...baseConfig,
    color: colors,
    radar,
    series: validateAndSanitizeSeries([
      {
        type: "radar",
        data: seriesData,
        areaStyle: {
          opacity: 0.3,
        },
      },
    ]),
  };
}

function createHeatmapChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const xColumn = suggestion.xAxis || data.summary.stringColumns[0];
  const yColumn =
    data.summary.stringColumns[1] || data.summary.stringColumns[0];
  const valueColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  // Fallback if no suitable columns available
  if (!xColumn || !valueColumn) {
    return {
      ...baseConfig,
      color: colors,
      series: [
        {
          type: "bar",
          data: [0],
          itemStyle: {
            color: colors[0],
          },
        },
      ],
      xAxis: {
        type: "category",
        data: ["No Data"],
      },
      yAxis: {
        type: "value",
      },
    };
  }

  const xIndex = data.columns.findIndex((col) => col.name === xColumn);
  const yIndex = data.columns.findIndex((col) => col.name === yColumn);
  const valueIndex = data.columns.findIndex((col) => col.name === valueColumn);

  const heatmapData = data.rows.map((row, i) => {
    const xValue = xIndex >= 0 ? String(row[xIndex]) : `X${i}`;
    const yValue = yIndex >= 0 ? String(row[yIndex]) : `Y${i}`;
    const value =
      valueIndex >= 0 ? Number(row[valueIndex]) || 0 : Math.random() * 100;

    return [xValue, yValue, isNaN(value) || !isFinite(value) ? 0 : value];
  });

  // Safe calculation of max value
  const values = heatmapData
    .map((d) => d[2] as number)
    .filter((v) => !isNaN(v) && isFinite(v));
  const maxValue = values.length > 0 ? Math.max(...values) : 100;

  return {
    ...baseConfig,
    color: colors,
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "5%",
    },
    xAxis: {
      type: "category",
      data: [...new Set(heatmapData.map((d) => d[0]))],
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: [...new Set(heatmapData.map((d) => d[1]))],
      splitArea: { show: true },
    },
    series: [
      {
        type: "heatmap",
        data: heatmapData,
        label: { show: true },
      },
    ],
  };
}

function createFunnelChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const nameColumn = suggestion.xAxis || data.summary.stringColumns[0];
  const valueColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const nameIndex = data.columns.findIndex((col) => col.name === nameColumn);
  const valueIndex = data.columns.findIndex((col) => col.name === valueColumn);

  const funnelData = data.rows
    .map((row) => ({
      name:
        nameIndex >= 0
          ? String(row[nameIndex])
          : `Stage ${data.rows.indexOf(row) + 1}`,
      value: valueIndex >= 0 ? Number(row[valueIndex]) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    ...baseConfig,
    color: colors,
    series: [
      {
        type: "funnel",
        left: "10%",
        top: 60,
        bottom: 60,
        width: "80%",
        min: 0,
        max: Math.max(...funnelData.map((d) => d.value)),
        minSize: "0%",
        maxSize: "100%",
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        data: funnelData,
      },
    ],
  };
}

function createGaugeChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const valueColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];
  const valueIndex = data.columns.findIndex((col) => col.name === valueColumn);

  const values = data.rows.map((row) =>
    valueIndex >= 0 ? Number(row[valueIndex]) : 0
  );
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    ...baseConfig,
    color: colors,
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "90%",
        min: 0,
        max: maxValue * 1.2,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.25, "#FF6E76"],
              [0.5, "#FDDD60"],
              [0.75, "#58D9F9"],
              [1, "#7CFFB2"],
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "12%",
          width: 20,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 2,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: "auto",
            width: 5,
          },
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 20,
        },
        detail: {
          fontSize: 30,
          offsetCenter: [0, "-35%"],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value * 100) / 100;
          },
          color: "auto",
        },
        data: [
          {
            value: avgValue,
            name: valueColumn,
          },
        ],
      },
    ],
  };
}

function createTreemapChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const nameColumn = suggestion.xAxis || data.summary.stringColumns[0];
  const valueColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const nameIndex = data.columns.findIndex((col) => col.name === nameColumn);
  const valueIndex = data.columns.findIndex((col) => col.name === valueColumn);

  const treemapData = data.rows.map((row) => ({
    name:
      nameIndex >= 0
        ? String(row[nameIndex])
        : `Item ${data.rows.indexOf(row) + 1}`,
    value: valueIndex >= 0 ? Number(row[valueIndex]) : Math.random() * 100,
  }));

  return {
    ...baseConfig,
    color: colors,
    series: [
      {
        type: "treemap",
        data: treemapData,
        label: {
          show: true,
          formatter: "{b}\n{c}",
        },
        itemStyle: {
          borderColor: "#fff",
        },
      },
    ],
  };
}

function createSunburstChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const nameColumn = suggestion.xAxis || data.summary.stringColumns[0];
  const valueColumn = suggestion.yAxis?.[0] || data.summary.numericColumns[0];

  const nameIndex = data.columns.findIndex((col) => col.name === nameColumn);
  const valueIndex = data.columns.findIndex((col) => col.name === valueColumn);

  // Create hierarchical data structure
  const sunburstData = {
    name: "Root",
    children: data.rows.slice(0, 10).map((row) => ({
      name:
        nameIndex >= 0
          ? String(row[nameIndex])
          : `Item ${data.rows.indexOf(row) + 1}`,
      value: valueIndex >= 0 ? Number(row[valueIndex]) : Math.random() * 100,
    })),
  };

  return {
    ...baseConfig,
    color: colors,
    series: [
      {
        type: "sunburst",
        data: [sunburstData],
        radius: [0, "95%"],
        sort: null,
        emphasis: {
          focus: "ancestor",
        },
        levels: [
          {},
          {
            r0: "15%",
            r: "35%",
            itemStyle: {
              borderWidth: 2,
            },
            label: {
              rotate: "tangential",
            },
          },
          {
            r0: "35%",
            r: "70%",
            label: {
              align: "right",
            },
          },
        ],
      },
    ],
  };
}

function createParallelChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  _suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  const numericColumns = data.summary.numericColumns.slice(0, 6);

  // Fallback if no numeric columns available
  if (numericColumns.length === 0) {
    return {
      ...baseConfig,
      color: colors,
      series: [
        {
          type: "bar",
          data: [0],
          itemStyle: {
            color: colors[0],
          },
        },
      ],
      xAxis: {
        type: "category",
        data: ["No Data"],
      },
      yAxis: {
        type: "value",
      },
    };
  }

  const parallelAxis = numericColumns.map((col, index) => {
    const colIndex = data.columns.findIndex((c) => c.name === col);
    const values = data.rows
      .map((row) => Number(row[colIndex]) || 0)
      .filter((val) => !isNaN(val) && isFinite(val));

    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 100;

    return {
      dim: index,
      name: col,
      min: minValue,
      max: maxValue,
    };
  });

  const parallelData = data.rows.slice(0, 50).map((row) =>
    numericColumns.map((col) => {
      const colIndex = data.columns.findIndex((c) => c.name === col);
      const value = Number(row[colIndex]) || 0;
      return isNaN(value) || !isFinite(value) ? 0 : value;
    })
  );

  return {
    ...baseConfig,
    color: colors,
    parallelAxis,
    parallel: {
      left: "5%",
      right: "18%",
      bottom: "10%",
      top: "20%",
    },
    series: [
      {
        type: "parallel",
        lineStyle: {
          width: 2,
          opacity: 0.8,
        },
        data: parallelData,
      },
    ],
  };
}

// Simplified implementations for remaining chart types
function createSankeyChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  // For now, create a simple bar chart as sankey requires specific data structure
  console.warn(
    "Sankey chart requires specific data structure - falling back to bar chart"
  );
  return createBarChart(baseConfig, data, suggestion, colors);
}

function createGraphChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  // For now, create a simple scatter chart as graph requires node/edge data
  console.warn(
    "Graph chart requires node/edge data structure - falling back to scatter chart"
  );
  return createScatterChart(baseConfig, data, suggestion, colors);
}

function createBoxplotChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  // For now, create a simple bar chart as boxplot requires statistical analysis
  console.warn(
    "Boxplot chart requires statistical analysis - falling back to bar chart"
  );
  return createBarChart(baseConfig, data, suggestion, colors);
}

function createCandlestickChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  // For now, create a simple line chart as candlestick requires OHLC data
  console.warn(
    "Candlestick chart requires OHLC data - falling back to line chart"
  );
  return createLineChart(baseConfig, data, suggestion, colors);
}

function createThemeRiverChart(
  baseConfig: EChartsOption,
  data: ParsedData,
  suggestion: ChartSuggestion,
  colors: string[]
): EChartsOption {
  // For now, create a simple area chart as theme river requires time series data
  console.warn(
    "Theme river chart requires time series data - falling back to area chart"
  );
  return createAreaChart(baseConfig, data, suggestion, colors);
}

// Utility function to validate and sanitize series objects
function validateAndSanitizeSeries(
  series: Record<string, unknown>[]
): Record<string, unknown>[] {
  if (!Array.isArray(series)) {
    console.warn("Series is not an array, returning empty array");
    return [];
  }

  console.log("Validating series:", series);

  const validatedSeries = series
    .filter((s, index) => {
      if (!s || typeof s !== "object") {
        console.warn(`Invalid series object at index ${index}:`, s);
        return false;
      }
      if (!s.type || typeof s.type !== "string") {
        console.warn(`Series at index ${index} missing type property:`, s);
        return false;
      }
      return true;
    })
    .map((s, index) => {
      // Ensure basic required properties exist
      const validatedSeries = {
        type: s.type,
        ...s,
        // Ensure data property exists
        data: s.data || [],
      };

      // Double-check that type still exists after spread
      if (!validatedSeries.type) {
        console.error(
          `Type property lost during validation at index ${index}:`,
          s
        );
        validatedSeries.type = "bar"; // Emergency fallback
      }

      return validatedSeries;
    });

  console.log("Validated series result:", validatedSeries);
  return validatedSeries;
}
