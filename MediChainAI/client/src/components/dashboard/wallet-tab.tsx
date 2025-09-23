import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function WalletTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const redeemRewardMutation = useMutation({
    mutationFn: async ({ rewardType, cost }: { rewardType: string, cost: number }) => {
      return await apiRequest('POST', '/api/redeem-reward', { rewardType, cost });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "Reward Redeemed!",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRedeem = (rewardType: string, cost: number) => {
    redeemRewardMutation.mutate({ rewardType, cost });
  };

  const copyWalletAddress = () => {
    if (walletData?.walletAddress) {
      navigator.clipboard.writeText(walletData.walletAddress);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  if (!walletData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-medical-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wallet Balance */}
      <div className="bg-gradient-to-br from-crypto-gold-400 to-crypto-gold-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">HealthToken Wallet</h2>
            <p className="text-crypto-gold-100 mt-2">Your rewards for contributing to medical research</p>
          </div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <i className="fas fa-wallet text-3xl"></i>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-2">{walletData.balance}</div>
            <div className="text-sm text-crypto-gold-100">Total HTK Balance</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-2">
              {walletData.transactions?.filter((t: any) => 
                t.transactionType === 'earned' && 
                new Date(t.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).reduce((sum: number, t: any) => sum + t.amount, 0) || 0}
            </div>
            <div className="text-sm text-crypto-gold-100">HTK Earned Today</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-2">${(walletData.balance * 0.05).toFixed(2)}</div>
            <div className="text-sm text-crypto-gold-100">USD Equivalent</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          {walletData.transactions?.length > 0 ? (
            <div className="space-y-4">
              {walletData.transactions.slice(0, 10).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.transactionType === 'earned' 
                        ? 'bg-health-green-100' 
                        : 'bg-red-100'
                    }`}>
                      <i className={`${
                        transaction.transactionType === 'earned'
                          ? 'fas fa-plus text-health-green-600'
                          : 'fas fa-minus text-red-600'
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transactionType === 'earned'
                        ? 'text-health-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.transactionType === 'earned' ? '+' : ''}{transaction.amount} HTK
                    </p>
                    {transaction.blockchainTxId && (
                      <p className="text-xs text-slate-500 font-mono">
                        {transaction.blockchainTxId.substring(0, 10)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-history text-slate-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Transactions Yet</h3>
              <p className="text-slate-600">Start uploading health data or sharing with researchers to earn HTK</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redemption Options */}
      <Card>
        <CardHeader>
          <CardTitle>Redeem Your HTK</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-medical-blue-100 rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-brain text-medical-blue-600 text-xl"></i>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Premium AI Analysis</h4>
              <p className="text-sm text-slate-600 mb-4">Get advanced health predictions and personalized recommendations</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-crypto-gold-600">100 HTK</span>
                <Button 
                  onClick={() => handleRedeem('premium-ai', 100)}
                  disabled={walletData.balance < 100 || redeemRewardMutation.isPending}
                  size="sm"
                  className="bg-medical-blue-500 hover:bg-medical-blue-600"
                >
                  Redeem
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-health-green-100 rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-health-green-600 text-xl"></i>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Enhanced Privacy</h4>
              <p className="text-sm text-slate-600 mb-4">Extra encryption layer and advanced anonymization features</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-crypto-gold-600">200 HTK</span>
                <Button 
                  onClick={() => handleRedeem('privacy', 200)}
                  disabled={walletData.balance < 200 || redeemRewardMutation.isPending}
                  size="sm"
                  className="bg-medical-blue-500 hover:bg-medical-blue-600"
                >
                  Redeem
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-download text-purple-600 text-xl"></i>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Data Export</h4>
              <p className="text-sm text-slate-600 mb-4">Download your complete health data history in various formats</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-crypto-gold-600">50 HTK</span>
                <Button 
                  onClick={() => handleRedeem('export', 50)}
                  disabled={walletData.balance < 50 || redeemRewardMutation.isPending}
                  size="sm"
                  className="bg-medical-blue-500 hover:bg-medical-blue-600"
                >
                  Redeem
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Address & Blockchain Info */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-slate-100 px-4 py-2 rounded-lg font-mono text-sm">
                  {walletData.walletAddress}
                </code>
                <Button 
                  onClick={copyWalletAddress}
                  variant="outline"
                  size="sm"
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Network</label>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-health-green-500 rounded-full"></div>
                <span className="text-sm">Hyperledger Fabric (MedChain Network)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
