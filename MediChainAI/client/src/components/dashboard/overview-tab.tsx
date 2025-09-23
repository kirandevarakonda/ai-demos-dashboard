import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthTrendsChart } from "@/components/charts/health-trends-chart";

export function OverviewTab() {
  const { user } = useAuth();
  
  const { data: healthRecords = [] } = useQuery({
    queryKey: ["/api/health-records"],
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ["/api/ai-analyses"],
  });

  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const recentTransactions = walletData?.transactions?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-blue-500 to-health-green-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-medical-blue-100 text-lg">Your health data is secure and earning you rewards.</p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold mb-1">{healthRecords.length}</div>
            <div className="text-sm text-medical-blue-100">Health Records</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold mb-1">{analyses.length}</div>
            <div className="text-sm text-medical-blue-100">AI Insights</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold mb-1">{walletData?.balance || 0}</div>
            <div className="text-sm text-medical-blue-100">HTK Earned</div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Health Chart */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Health Trends Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Health Trends</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <HealthTrendsChart data={healthRecords} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transaction.transactionType === 'earned' 
                        ? 'bg-health-green-100' 
                        : 'bg-red-100'
                    }`}>
                      <i className={`text-sm ${
                        transaction.transactionType === 'earned'
                          ? 'fas fa-plus text-health-green-600'
                          : 'fas fa-minus text-red-600'
                      }`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`text-xs font-medium ${
                      transaction.transactionType === 'earned'
                        ? 'text-crypto-gold-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.transactionType === 'earned' ? '+' : ''}{transaction.amount} HTK
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <i className="fas fa-history text-2xl mb-2 block"></i>
                  <p>No recent activity</p>
                  <p className="text-xs">Start by uploading health data to see activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-health-green-100 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-upload text-health-green-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Health Data</h3>
            <p className="text-sm text-slate-600">Add new health records and earn tokens</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-medical-blue-100 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-brain text-medical-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Get AI Insights</h3>
            <p className="text-sm text-slate-600">Analyze your data with AI</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-share-alt text-purple-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Share & Earn</h3>
            <p className="text-sm text-slate-600">Share data with researchers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
