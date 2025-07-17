// Export utilities for charts and components
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import type { EChartsOption } from "./chartSuggestions";

export interface ExportOptions {
  filename: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface EChartsInstance {
  renderToSVGString(): string;
  getDataURL(options?: {
    type?: "png" | "jpeg" | "svg";
    pixelRatio?: number;
    backgroundColor?: string;
    excludeComponents?: string[];
  }): string;
  getDom(): HTMLElement;
}

export async function exportChartAsPNG(
  chartElement: HTMLElement,
  options: ExportOptions
): Promise<void> {
  try {
    const canvas = await html2canvas(chartElement, {
      width: options.width || 800,
      height: options.height || 600,
      backgroundColor: options.backgroundColor || "#ffffff",
      useCORS: true,
      scale: 2, // Higher resolution
    });

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${options.filename}.png`);
      }
    });
  } catch (error) {
    console.error("Failed to export chart as PNG:", error);
    throw new Error("Failed to export chart as PNG");
  }
}

export function exportChartAsSVG(
  chartInstance: EChartsInstance,
  options: ExportOptions
): void {
  try {
    const svgString = chartInstance.renderToSVGString();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    saveAs(blob, `${options.filename}.svg`);
  } catch (error) {
    console.error("Failed to export chart as SVG:", error);
    throw new Error("Failed to export chart as SVG");
  }
}

export function generateReactComponent(
  chartOption: EChartsOption,
  componentName: string = "GeneratedChart"
): string {
  const optionString = JSON.stringify(chartOption, null, 2);

  return `import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ${componentName}Props {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  width = '100%', 
  height = '400px',
  style 
}) => {
  const option = ${optionString};

  return (
    <ReactECharts
      option={option}
      style={{ width, height, ...style }}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default ${componentName};
`;
}

export function exportReactComponent(
  chartOption: EChartsOption,
  componentName: string = "GeneratedChart",
  filename?: string
): void {
  const componentCode = generateReactComponent(chartOption, componentName);
  const blob = new Blob([componentCode], { type: "text/plain" });
  const finalFilename = filename || `${componentName}.tsx`;
  saveAs(blob, finalFilename);
}

export function generateInteractiveHTML(
  chartOption: EChartsOption,
  title: string = "Interactive Chart"
): string {
  const optionString = JSON.stringify(chartOption, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
        #chart {
            width: 100%;
            height: 600px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
        .controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #3b82f6;
            color: white;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="controls">
            <button class="btn" onclick="downloadPNG()">Download PNG</button>
            <button class="btn" onclick="downloadSVG()">Download SVG</button>
            <button class="btn" onclick="toggleTheme()">Toggle Theme</button>
        </div>
        <div id="chart"></div>
        <div class="footer">
            <p>Generated with ChartGenie • Interactive chart powered by Apache ECharts</p>
        </div>
    </div>

    <script>
        // Initialize chart
        const chartDom = document.getElementById('chart');
        const myChart = echarts.init(chartDom);
        
        let option = ${optionString};
        
        let isDarkTheme = false;

        function updateChart() {
            myChart.setOption(option, true);
        }

        function downloadPNG() {
            const url = myChart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff'
            });
            const link = document.createElement('a');
            link.download = '${title.toLowerCase().replace(/\\s+/g, "-")}.png';
            link.href = url;
            link.click();
        }

        function downloadSVG() {
            const svgStr = myChart.renderToSVGString();
            const blob = new Blob([svgStr], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = '${title.toLowerCase().replace(/\\s+/g, "-")}.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }

        function toggleTheme() {
            isDarkTheme = !isDarkTheme;
            
            if (isDarkTheme) {
                document.body.style.backgroundColor = '#1a1a1a';
                document.querySelector('.container').style.backgroundColor = '#2d2d2d';
                document.querySelector('.container').style.color = '#ffffff';
                option.backgroundColor = '#2d2d2d';
                option.textStyle = { color: '#ffffff' };
            } else {
                document.body.style.backgroundColor = '#f5f5f5';
                document.querySelector('.container').style.backgroundColor = '#ffffff';
                document.querySelector('.container').style.color = '#333333';
                option.backgroundColor = '#ffffff';
                option.textStyle = { color: '#333333' };
            }
            
            updateChart();
        }

        // Set initial chart
        updateChart();

        // Handle resize
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    </script>
</body>
</html>`;
}

export function exportInteractiveHTML(
  chartOption: EChartsOption,
  title: string = "Interactive Chart",
  filename?: string
): void {
  const htmlContent = generateInteractiveHTML(chartOption, title);
  const blob = new Blob([htmlContent], { type: "text/html" });
  const finalFilename =
    filename || `${title.toLowerCase().replace(/\s+/g, "-")}.html`;
  saveAs(blob, finalFilename);
}

export interface ChartExports {
  png: (element: HTMLElement, options: ExportOptions) => Promise<void>;
  svg: (chartInstance: EChartsInstance, options: ExportOptions) => void;
  reactComponent: (
    chartOption: EChartsOption,
    componentName?: string,
    filename?: string
  ) => void;
  interactiveHTML: (
    chartOption: EChartsOption,
    title?: string,
    filename?: string
  ) => void;
}

export const chartExports: ChartExports = {
  png: exportChartAsPNG,
  svg: exportChartAsSVG,
  reactComponent: exportReactComponent,
  interactiveHTML: exportInteractiveHTML,
};
