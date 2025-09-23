import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function AuditTab() {
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("30days");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'upload_health_data':
      case 'upload_file':
        return 'fas fa-upload text-purple-600';
      case 'ai_analysis':
        return 'fas fa-brain text-medical-blue-600';
      case 'share_data':
        return 'fas fa-share-alt text-health-green-600';
      case 'redeem_reward':
        return 'fas fa-gift text-red-600';
      default:
        return 'fas fa-circle text-slate-600';
    }
  };

  const getActivityLabel = (action: string) => {
    switch (action) {
      case 'upload_health_data':
        return 'Data Upload';
      case 'upload_file':
        return 'File Upload';
      case 'ai_analysis':
        return 'AI Analysis';
      case 'share_data':
        return 'Data Shared';
      case 'redeem_reward':
        return 'Redemption';
      default:
        return 'Activity';
    }
  };

  const getActivityDescription = (log: any) => {
    switch (log.action) {
      case 'upload_health_data':
        return `Health data uploaded - ${log.details?.recordType || 'vitals'}`;
      case 'upload_file':
        return `File uploaded - ${log.details?.fileName || 'document'}`;
      case 'ai_analysis':
        return `AI analysis completed - ${log.details?.analysisType || 'health assessment'}`;
      case 'share_data':
        return `Data shared with ${log.details?.requesterName || 'researcher'}`;
      case 'redeem_reward':
        return `Reward redeemed - ${log.details?.rewardType || 'feature'}`;
      default:
        return log.action.replace('_', ' ');
    }
  };

  const filteredLogs = auditLogs.filter((log: any) => {
    if (filterType !== "all" && log.action !== filterType) return false;
    if (searchTerm && !getActivityDescription(log).toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    const logDate = new Date(log.createdAt);
    const now = new Date();
    switch (dateRange) {
      case "7days":
        return logDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30days":
        return logDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "3months":
        return logDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-medical-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Audit Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Blockchain Audit Logs</CardTitle>
            <p className="text-slate-600 mt-2">Complete immutable history of your data transactions</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <i className="fas fa-download mr-2"></i>
              Export
            </Button>
            <Button size="sm" className="bg-medical-blue-500 hover:bg-medical-blue-600">
              <i className="fas fa-sync mr-2"></i>
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Options */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="upload_health_data">Data Upload</SelectItem>
                  <SelectItem value="upload_file">File Upload</SelectItem>
                  <SelectItem value="ai_analysis">AI Analysis</SelectItem>
                  <SelectItem value="share_data">Data Shared</SelectItem>
                  <SelectItem value="redeem_reward">Redemption</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Search</Label>
              <Input
                placeholder="Transaction ID or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Activity Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Block Hash</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                            <i className={`${getActivityIcon(log.action)} text-xs`}></i>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {getActivityLabel(log.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {getActivityDescription(log)}
                        </div>
                        {log.details?.ipAddress && (
                          <div className="text-sm text-slate-500">
                            IP: {log.details.ipAddress}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.blockchainTxId ? (
                          <code className="text-xs font-mono text-slate-600">
                            {log.blockchainTxId.substring(0, 12)}...
                          </code>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={log.blockchainTxId ? "default" : "secondary"} className="bg-health-green-100 text-health-green-800">
                          {log.blockchainTxId ? "Confirmed" : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-history text-slate-400 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Audit Logs Found</h3>
                      <p className="text-slate-600">
                        {searchTerm || filterType !== "all" ? "Try adjusting your filters" : "Start using the platform to see activity logs"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing 1 to {Math.min(10, filteredLogs.length)} of {filteredLogs.length} results
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button size="sm" className="bg-medical-blue-500 text-white">1</Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
