import type { ParsedData } from "./dataParser";

interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}

interface DataAnalysisResult {
  summary: {
    description: string;
    rowCount: number;
    columnCount: number;
    dataQuality: string;
  };
  columns: Array<{
    name: string;
    type: string;
    description: string;
    sampleValues: any[];
    statistics?: {
      min?: number;
      max?: number;
      mean?: number;
      uniqueCount?: number;
    };
  }>;
  insights: string[];
  recommendations: Array<{
    chartType: string;
    reason: string;
    columns: {
      x?: string;
      y?: string[];
      category?: string;
      value?: string;
    };
  }>;
}

class OpenAIService {
  private config: OpenAIConfig;
  private baseURL = "https://api.openai.com/v1";

  constructor(apiKey?: string) {
    this.config = {
      apiKey: apiKey || import.meta.env.VITE_OPENAI_API_KEY || "",
      model: "gpt-4o-mini",
      temperature: 0.3,
    };
  }

  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  async analyzeData(parsedData: ParsedData, userContext?: string): Promise<DataAnalysisResult> {
    console.log("🤖 [OpenAI] Starting data analysis...");
    
    if (!this.config.apiKey) {
      console.error("❌ [OpenAI] No API key configured");
      throw new Error("OpenAI API key not configured");
    }

    const dataSnapshot = this.prepareDataSnapshot(parsedData);
    console.log("📊 [OpenAI] Data snapshot prepared:", {
      columns: dataSnapshot.columns.length,
      rows: dataSnapshot.totalRows,
      columnTypes: dataSnapshot.columns.map(c => `${c.name}: ${c.type}`),
      hasContext: !!userContext
    });
    
    const systemPrompt = `You are a data analysis expert. Analyze the provided dataset and return a structured JSON response with insights and chart recommendations.

Return a JSON object with this exact structure:
{
  "summary": {
    "description": "Brief description of what this data represents",
    "rowCount": number,
    "columnCount": number,
    "dataQuality": "high|medium|low"
  },
  "columns": [
    {
      "name": "column name",
      "type": "string|number|date|boolean",
      "description": "What this column represents",
      "sampleValues": [sample values],
      "statistics": {
        "min": number (for numeric),
        "max": number (for numeric),
        "mean": number (for numeric),
        "uniqueCount": number
      }
    }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "recommendations": [
    {
      "chartType": "bar|line|scatter|pie|area|radar|heatmap|treemap",
      "reason": "Why this chart type is suitable",
      "columns": {
        "x": "column name for x-axis",
        "y": ["column names for y-axis"],
        "category": "column for categorization",
        "value": "column for values"
      }
    }
  ]
}`;

    const userPrompt = `Analyze this dataset:

${userContext ? `Context: ${userContext}\n` : ""}
Column Information:
${JSON.stringify(dataSnapshot.columns, null, 2)}

Sample Data (first 10 rows):
${JSON.stringify(dataSnapshot.sampleRows, null, 2)}

Data Summary:
${JSON.stringify(parsedData.summary, null, 2)}

Please provide a comprehensive analysis including data quality assessment, column descriptions, key insights, and chart recommendations.${userContext ? " Take into account the provided context about what this data represents." : ""}`;

    try {
      console.log("🔄 [OpenAI] Sending request to API...");
      console.log("📝 [OpenAI] Request config:", {
        model: this.config.model,
        temperature: this.config.temperature,
        promptLength: userPrompt.length,
        dataRows: dataSnapshot.sampleRows.length
      });

      const startTime = Date.now();
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: this.config.temperature,
          response_format: { type: "json_object" },
        }),
      });

      const responseTime = Date.now() - startTime;
      console.log(`⏱️ [OpenAI] Response received in ${responseTime}ms`);

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ [OpenAI] API error:", error);
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ [OpenAI] Response parsed successfully");
      console.log("🔍 [OpenAI] Tokens used:", {
        prompt: result.usage?.prompt_tokens,
        completion: result.usage?.completion_tokens,
        total: result.usage?.total_tokens
      });

      const analysis = JSON.parse(result.choices[0].message.content);
      console.log("📈 [OpenAI] Analysis extracted:", {
        insights: analysis.insights?.length || 0,
        recommendations: analysis.recommendations?.length || 0,
        columns: analysis.columns?.length || 0
      });

      const validatedAnalysis = this.validateAndEnrichAnalysis(analysis, parsedData);
      console.log("✨ [OpenAI] Analysis validated and enriched");
      
      return validatedAnalysis;
    } catch (error) {
      console.error("❌ [OpenAI] Analysis failed:", error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    console.log("🔌 [OpenAI] Testing connection...");
    
    if (!this.config.apiKey) {
      console.log("⚠️ [OpenAI] No API key provided for connection test");
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (response.ok) {
        console.log("✅ [OpenAI] Connection test successful");
        return true;
      } else {
        console.error("❌ [OpenAI] Connection test failed:", response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error("❌ [OpenAI] Connection test error:", error);
      return false;
    }
  }

  private prepareDataSnapshot(parsedData: ParsedData) {
    return {
      columns: parsedData.columns.map(col => ({
        name: col.name,
        type: col.type,
        sampleValues: col.values.slice(0, 5),
        uniqueCount: new Set(col.values).size,
      })),
      sampleRows: parsedData.rows.slice(0, 10),
      totalRows: parsedData.rows.length,
    };
  }

  private validateAndEnrichAnalysis(
    analysis: any,
    parsedData: ParsedData
  ): DataAnalysisResult {
    // Ensure all required fields are present
    const validated: DataAnalysisResult = {
      summary: {
        description: analysis.summary?.description || "Dataset analysis",
        rowCount: analysis.summary?.rowCount || parsedData.rows.length,
        columnCount: analysis.summary?.columnCount || parsedData.columns.length,
        dataQuality: analysis.summary?.dataQuality || "medium",
      },
      columns: analysis.columns || parsedData.columns.map(col => ({
        name: col.name,
        type: col.type,
        description: `${col.name} column`,
        sampleValues: col.values.slice(0, 5),
      })),
      insights: analysis.insights || ["Data loaded successfully"],
      recommendations: analysis.recommendations || [],
    };

    // Add statistics for numeric columns
    validated.columns = validated.columns.map(col => {
      const originalCol = parsedData.columns.find(c => c.name === col.name);
      if (originalCol && originalCol.type === "number") {
        const numericValues = originalCol.values.filter(v => typeof v === "number") as number[];
        if (numericValues.length > 0) {
          col.statistics = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            uniqueCount: new Set(numericValues).size,
          };
        }
      }
      return col;
    });

    return validated;
  }
}

export const openAIService = new OpenAIService();
export default openAIService;