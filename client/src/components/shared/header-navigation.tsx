import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";

interface HeaderNavigationProps {
  currentInterface: "customer" | "merchant";
}

export default function HeaderNavigation({ currentInterface }: HeaderNavigationProps) {
  const [, setLocation] = useLocation();
  const { totalItems, toggleCart } = useCart();

  return (
    <header className="bg-white shadow-sm border-b-2 border-primary-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary-500">🍽️ 小食堂</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentInterface === "customer"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-primary-500"
                }`}
              >
                用户端
              </Link>
              <Link
                href="/merchant"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentInterface === "merchant"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-primary-500"
                }`}
              >
                商家端
              </Link>
            </nav>
          </div>
          
          {/* Customer Header Actions */}
          {currentInterface === "customer" && (
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">张妈妈</span>
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://pixabay.com/get/g91317bd447e6a968782e917657941ecc87f97413f341bf0e804247bbdd7b3ec02b86519159ec5d7ba42ca295ae75197a67688d244e79901192849cb52910451b_1280.jpg" 
                  alt="用户头像"
                />
              </div>
            </div>
          )}

          {/* Merchant Header Actions */}
          {currentInterface === "merchant" && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">阳光幼儿园食堂</span>
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
                  alt="商家头像"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
