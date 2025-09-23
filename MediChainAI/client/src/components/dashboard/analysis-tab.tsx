import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function AnalysisTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses = [] } = useQuery({
    queryKey: ["/api/ai-analyses"],
  });

  const { data: healthRecords = [] } = useQuery({
    queryKey: ["/api/health-records"],
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/ai-analysis', {});
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/ai-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "Analysis Complete!",
        description: `Your AI health analysis is ready. You earned ${data.rewardEarned} HTK!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const latestAnalysis = analyses[0];
  const analysisResults = latestAnalysis?.results;

  return (
    <div className="space-y-8">
      {/* Analysis Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">AI Health Analysis</CardTitle>
            <p className="text-slate-600 mt-2">Powered by advanced machine learning models</p>
          </div>
          <Button 
            onClick={() => runAnalysisMutation.mutate()}
            disabled={runAnalysisMutation.isPending || healthRecords.length === 0}
            className="bg-medical-blue-500 hover:bg-medical-blue-600"
          >
            {runAnalysisMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-brain mr-2"></i>
                Run New Analysis
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      {healthRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Health Data Available</h3>
            <p className="text-slate-600 mb-4">Upload some health data first to get AI-powered insights</p>
            <Button variant="outline">
              <i className="fas fa-upload mr-2"></i>
              Upload Health Data
            </Button>
          </CardContent>
        </Card>
      ) : !analysisResults ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-medical-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-brain text-medical-blue-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready for AI Analysis</h3>
            <p className="text-slate-600 mb-4">Click "Run New Analysis" to get AI-powered health insights</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Health Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Health Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="10" fill="none"></circle>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        stroke="#059669" 
                        strokeWidth="10" 
                        fill="none" 
                        strokeDasharray="282.7" 
                        strokeDashoffset={282.7 - (282.7 * analysisResults.overallHealthScore / 100)}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-health-green-600">
                        {analysisResults.overallHealthScore}%
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900">Overall Health</h4>
                  <p className="text-sm text-slate-600">
                    {analysisResults.overallHealthScore >= 80 ? 'Excellent' : 
                     analysisResults.overallHealthScore >= 60 ? 'Good' : 'Needs Attention'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="10" fill="none"></circle>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        stroke="#f59e0b" 
                        strokeWidth="10" 
                        fill="none" 
                        strokeDasharray="282.7" 
                        strokeDashoffset={282.7 - (282.7 * analysisResults.cardiacRisk / 100)}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-crypto-gold-600">
                        {analysisResults.cardiacRisk}%
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900">Cardiac Risk</h4>
                  <p className="text-sm text-slate-600">
                    {analysisResults.cardiacRisk <= 30 ? 'Low risk' : 
                     analysisResults.cardiacRisk <= 60 ? 'Moderate risk' : 'High risk'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="10" fill="none"></circle>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        stroke="#059669" 
                        strokeWidth="10" 
                        fill="none" 
                        strokeDasharray="282.7" 
                        strokeDashoffset={282.7 - (282.7 * analysisResults.fitnessLevel / 100)}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-health-green-600">
                        {analysisResults.fitnessLevel}%
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900">Fitness Level</h4>
                  <p className="text-sm text-slate-600">
                    {analysisResults.fitnessLevel >= 80 ? 'Excellent' : 
                     analysisResults.fitnessLevel >= 60 ? 'Good' : 'Below Average'}
                  </p>
                </div>
              </div>

              {/* Detailed Insights */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-4">AI Insights & Recommendations</h4>
                <div className="space-y-4">
                  {analysisResults.insights?.map((insight: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        insight.type === 'positive' ? 'bg-health-green-100' :
                        insight.type === 'warning' ? 'bg-yellow-100' : 'bg-medical-blue-100'
                      }`}>
                        <i className={`text-xs ${
                          insight.type === 'positive' ? 'fas fa-check text-health-green-600' :
                          insight.type === 'warning' ? 'fas fa-exclamation text-yellow-600' : 
                          'fas fa-info text-medical-blue-600'
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{insight.title}</p>
                        <p className="text-sm text-slate-600">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Health Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold text-health-green-600 mb-2">
                  {analysisResults.predictiveScore}
                </div>
                <p className="text-slate-600 mb-4">
                  Your health is likely to remain stable over the next 6 months
                </p>
                <div className="bg-health-green-50 text-health-green-700 px-4 py-2 rounded-lg text-sm">
                  <i className="fas fa-chart-line mr-2"></i>
                  {analysisResults.predictiveScore >= 80 ? 'Trending upward' : 'Stable outlook'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResults.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
