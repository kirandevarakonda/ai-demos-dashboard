import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export function SharingTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dataRequests = [] } = useQuery({
    queryKey: ["/api/data-requests"],
  });

  const { data: consents = [] } = useQuery({
    queryKey: ["/api/data-consents"],
  });

  // Initialize demo data if needed
  useEffect(() => {
    if (dataRequests.length === 0) {
      fetch('/api/init-demo-data', {
        method: 'POST',
        credentials: 'include',
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/data-requests"] });
      });
    }
  }, [dataRequests.length, queryClient]);

  const approveDataMutation = useMutation({
    mutationFn: async ({ requestId, consentedDataTypes }: { requestId: number, consentedDataTypes: string[] }) => {
      return await apiRequest('POST', '/api/data-consent', {
        requestId,
        consentedDataTypes,
        permissions: {
          viewOnly: true,
          anonymized: true,
          duration: "30days",
        },
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/data-consents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "Data Shared!",
        description: `Your data has been shared successfully. You earned ${data.rewardEarned} HTK!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sharing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [selectedDataTypes, setSelectedDataTypes] = useState<Record<number, string[]>>({});

  const handleDataTypeChange = (requestId: number, dataType: string, checked: boolean) => {
    setSelectedDataTypes(prev => ({
      ...prev,
      [requestId]: checked 
        ? [...(prev[requestId] || []), dataType]
        : (prev[requestId] || []).filter(type => type !== dataType)
    }));
  };

  const handleApprove = (requestId: number) => {
    const consentedTypes = selectedDataTypes[requestId] || [];
    if (consentedTypes.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one data type to share.",
        variant: "destructive",
      });
      return;
    }
    approveDataMutation.mutate({ requestId, consentedDataTypes: consentedTypes });
  };

  return (
    <div className="space-y-8">
      {/* Sharing Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Data Sharing & Consent</CardTitle>
            <p className="text-slate-600 mt-2">Control who can access your data and earn HealthTokens</p>
          </div>
          <div className="flex items-center space-x-2 bg-health-green-50 px-4 py-2 rounded-xl">
            <i className="fas fa-shield-check text-health-green-600"></i>
            <span className="text-sm font-medium text-health-green-700">Blockchain Secured</span>
          </div>
        </CardHeader>
      </Card>

      {/* Active Data Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Data Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {dataRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-share-alt text-slate-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Requests</h3>
              <p className="text-slate-600">Check back later for new data sharing opportunities</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dataRequests.map((request: any) => {
                const isAlreadyConsented = consents.some((c: any) => c.requestId === request.id && c.isActive);
                
                return (
                  <div key={request.id} className="border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-medical-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-university text-medical-blue-600"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{request.requesterName}</h4>
                          <p className="text-sm text-slate-600">{request.studyTitle}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                            <span>
                              <i className="fas fa-calendar mr-1"></i>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              <i className="fas fa-users mr-1"></i>
                              {request.participantCount} participants
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-crypto-gold-600">{request.rewardAmount} HTK</div>
                        <div className="text-sm text-slate-500">Reward</div>
                      </div>
                    </div>
                    
                    {request.description && (
                      <p className="text-sm text-slate-600 mb-4">{request.description}</p>
                    )}
                    
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-slate-900 mb-2">Data Requested:</h5>
                      <div className="space-y-2">
                        {request.dataTypes.map((dataType: string) => (
                          <label key={dataType} className="flex items-center space-x-2">
                            <Checkbox
                              checked={(selectedDataTypes[request.id] || []).includes(dataType)}
                              onCheckedChange={(checked) => handleDataTypeChange(request.id, dataType, checked as boolean)}
                              disabled={isAlreadyConsented}
                              className="text-medical-blue-500 border-slate-300 rounded focus:ring-medical-blue-500"
                            />
                            <span className="text-sm capitalize">
                              {dataType.replace('_', ' ')} {isAlreadyConsented ? '(already shared)' : '(anonymized)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <i className="fas fa-eye-slash text-health-green-600"></i>
                        <span>Data will be anonymized and encrypted</span>
                      </div>
                      <div className="flex space-x-3">
                        {isAlreadyConsented ? (
                          <div className="px-6 py-2 bg-health-green-100 text-health-green-700 rounded-lg">
                            <i className="fas fa-check mr-2"></i>
                            Already Shared
                          </div>
                        ) : (
                          <>
                            <Button variant="outline">
                              Decline
                            </Button>
                            <Button 
                              onClick={() => handleApprove(request.id)}
                              disabled={approveDataMutation.isPending}
                              className="bg-medical-blue-500 hover:bg-medical-blue-600"
                            >
                              {approveDataMutation.isPending ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                'Approve & Earn HTK'
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Shared Data */}
      {consents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Data Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consents.filter((c: any) => c.isActive).map((consent: any) => {
                const request = dataRequests.find((r: any) => r.id === consent.requestId);
                if (!request) return null;
                
                return (
                  <div key={consent.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-health-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-share-alt text-health-green-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{request.requesterName}</p>
                        <p className="text-sm text-slate-600">
                          Shared: {consent.consentedDataTypes.join(', ')} • 
                          Expires: {new Date(consent.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-crypto-gold-600">+{consent.rewardEarned} HTK</span>
                      <button className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-cog"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
