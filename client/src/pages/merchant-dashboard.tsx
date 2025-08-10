import { useState } from "react";
import HeaderNavigation from "@/components/shared/header-navigation";
import DashboardOverview from "@/components/merchant/dashboard-overview";
import ProductManagement from "@/components/merchant/product-management";
import OrderProcessing from "@/components/merchant/order-processing";
import FinanceReporting from "@/components/merchant/finance-reporting";
import DataAnalytics from "@/components/merchant/data-analytics";

type MerchantTab = "dashboard" | "products" | "orders" | "finance" | "analytics";

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState<MerchantTab>("dashboard");

  const tabs = [
    { id: "dashboard" as const, label: "数据概览" },
    { id: "products" as const, label: "商品管理" },
    { id: "orders" as const, label: "订单处理" },
    { id: "finance" as const, label: "财务对账" },
    { id: "analytics" as const, label: "数据统计" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNavigation currentInterface="merchant" />
      
      {/* Merchant Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "orders" && <OrderProcessing />}
        {activeTab === "finance" && <FinanceReporting />}
        {activeTab === "analytics" && <DataAnalytics />}
      </div>
    </div>
  );
}
