import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// const openai = new OpenAI({ 
//   apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
// });

export interface HealthAnalysisResult {
  overallHealthScore: number;
  cardiacRisk: number;
  fitnessLevel: number;
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
  recommendations: string[];
  predictiveScore: number;
  riskFactors: string[];
}

export async function analyzeHealthData(healthData: any): Promise<HealthAnalysisResult> {
  console.log("Mock analyzeHealthData called with:", healthData);
  return {
    overallHealthScore: 85,
    cardiacRisk: 20,
    fitnessLevel: 90,
    insights: [
      { type: "positive", title: "Excellent Vitals", description: "Your recent vital signs are within optimal ranges." },
      { type: "info", title: "Consistent Activity", description: "Maintaining a regular exercise routine is beneficial." },
      { type: "warning", title: "Dietary Review", description: "Consider reducing processed foods for better long-term health." },
    ],
    recommendations: [
      "Continue daily walks or light exercise.",
      "Incorporate more leafy greens and fruits into your diet.",
      "Ensure adequate hydration throughout the day.",
      "Schedule a routine check-up with your primary care physician."
    ],
    predictiveScore: 90,
    riskFactors: ["family history (mild)"],
  };
}

export async function generateHealthInsights(analysisHistory: any[]): Promise<string[]> {
  console.log("Mock generateHealthInsights called with:", analysisHistory);
  return [
    "Your cardiovascular health shows consistent improvement over the past few months.",
    "Maintaining a balanced diet and regular exercise routine is key to your well-being.",
    "Keep an eye on slight fluctuations in weight, and adjust activity if needed."
  ];
}
