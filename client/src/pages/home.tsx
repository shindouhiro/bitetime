import { useState } from "react";
import HeaderNavigation from "@/components/shared/header-navigation";
import MenuDisplay from "@/components/customer/menu-display";
import OrderManagement from "@/components/customer/order-management";
import AddressManagement from "@/components/customer/address-management";
import OrderHistory from "@/components/customer/order-history";
import ShoppingCart from "@/components/customer/shopping-cart";
import { Home, ShoppingBag, MapPin, Clock } from "lucide-react";

type CustomerTab = "menu" | "orders" | "address" | "history";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<CustomerTab>("menu");

  const tabs = [
    { id: "menu" as const, label: "菜品", icon: Home },
    { id: "orders" as const, label: "订单", icon: ShoppingBag },
    { id: "address" as const, label: "地址", icon: MapPin },
    { id: "history" as const, label: "历史", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderNavigation currentInterface="customer" />

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === "menu" && <MenuDisplay />}
        {activeTab === "orders" && <OrderManagement />}
        {activeTab === "address" && <AddressManagement />}
        {activeTab === "history" && <OrderHistory />}
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

      {/* Shopping Cart Sidebar */}
      <ShoppingCart />
    </div>
  );
}
