import { useState } from "react";
import HeaderNavigation from "@/components/shared/header-navigation";
import MenuDisplay from "@/components/customer/menu-display";
import OrderManagement from "@/components/customer/order-management";
import AddressManagement from "@/components/customer/address-management";
import OrderHistory from "@/components/customer/order-history";
import ShoppingCart from "@/components/customer/shopping-cart";
import CheckoutModal from "@/components/shared/checkout-modal";

type CustomerTab = "menu" | "orders" | "address" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = useState<CustomerTab>("menu");

  const tabs = [
    { id: "menu" as const, label: "菜品展示" },
    { id: "orders" as const, label: "我的订单" },
    { id: "address" as const, label: "地址管理" },
    { id: "history" as const, label: "历史订单" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNavigation currentInterface="customer" />
      
      {/* Customer Navigation Tabs */}
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
        {activeTab === "menu" && <MenuDisplay />}
        {activeTab === "orders" && <OrderManagement />}
        {activeTab === "address" && <AddressManagement />}
        {activeTab === "history" && <OrderHistory />}
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart />
      
      {/* Checkout Modal */}
      <CheckoutModal />
    </div>
  );
}
