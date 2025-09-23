import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { UploadTab } from "@/components/dashboard/upload-tab";
import { AnalysisTab } from "@/components/dashboard/analysis-tab";
import { SharingTab } from "@/components/dashboard/sharing-tab";
import { WalletTab } from "@/components/dashboard/wallet-tab";
import { AuditTab } from "@/components/dashboard/audit-tab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  // Fetch wallet data for token balance display
  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "upload":
        return <UploadTab />;
      case "analyze":
        return <AnalysisTab />;
      case "sharing":
        return <SharingTab />;
      case "wallet":
        return <WalletTab />;
      case "audit":
        return <AuditTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-medical-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-medical-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-white text-sm"></i>
                </div>
                <span className="text-lg font-bold text-slate-800">MedChain</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-health-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Connected</span>
              </div>
            </div>
            
            {/* Token Balance & User Menu */}
            <div className="flex items-center space-x-4">
              <div className="bg-crypto-gold-50 px-4 py-2 rounded-xl flex items-center space-x-2">
                <i className="fas fa-coins text-crypto-gold-600"></i>
                <span className="font-semibold text-crypto-gold-700">
                  {walletData?.balance || 0} HTK
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-medical-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-medical-blue-600">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user.firstName || user.email}
                </span>
                <button 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
