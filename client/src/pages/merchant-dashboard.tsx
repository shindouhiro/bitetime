import { useState } from "react";
import HeaderNavigation from "@/components/shared/header-navigation";
import DashboardOverview from "@/components/merchant/dashboard-overview";
import ProductManagement from "@/components/merchant/product-management";
import OrderProcessing from "@/components/merchant/order-processing";
import FinanceReporting from "@/components/merchant/finance-reporting";
import DataAnalytics from "@/components/merchant/data-analytics";
import { BarChart3, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

type MerchantTab = "dashboard" | "products" | "orders" | "finance" | "analytics";

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState<MerchantTab>("dashboard");

  const tabs = [
    { id: "dashboard" as const, label: "概览", icon: BarChart3 },
    { id: "products" as const, label: "商品", icon: Package },
    { id: "orders" as const, label: "订单", icon: ShoppingCart },
    { id: "finance" as const, label: "财务", icon: DollarSign },
    { id: "analytics" as const, label: "统计", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderNavigation currentInterface="merchant" />

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "orders" && <OrderProcessing />}
        {activeTab === "finance" && <FinanceReporting />}
        {activeTab === "analytics" && <DataAnalytics />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-primary-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
