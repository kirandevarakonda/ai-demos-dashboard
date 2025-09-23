import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { data: healthRecords = [] } = useQuery({
    queryKey: ["/api/health-records"],
  });

  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: consents = [] } = useQuery({
    queryKey: ["/api/data-consents"],
  });

  const navigationItems = [
    { id: "overview", label: "Overview", icon: "fas fa-home" },
    { id: "upload", label: "Upload Data", icon: "fas fa-upload" },
    { id: "analyze", label: "AI Analysis", icon: "fas fa-brain" },
    { id: "sharing", label: "Data Sharing", icon: "fas fa-share-alt" },
    { id: "wallet", label: "Wallet", icon: "fas fa-wallet" },
    { id: "audit", label: "Audit Logs", icon: "fas fa-history" },
  ];

  return (
    <>
      <nav className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-colors ${
                activeTab === item.id
                  ? "bg-medical-blue-50 text-medical-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Quick Stats */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Data Records</span>
            <span className="text-sm font-semibold text-slate-900">
              {healthRecords.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Shares Active</span>
            <span className="text-sm font-semibold text-slate-900">
              {consents.filter((c: any) => c.isActive).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">HTK Earned</span>
            <span className="text-sm font-semibold text-crypto-gold-600">
              {walletData?.balance || 0}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
