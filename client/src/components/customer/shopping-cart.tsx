import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import CheckoutModal from "@/components/shared/checkout-modal";
import { useState } from "react";

export default function ShoppingCart() {
  const { state, removeItem, updateQuantity, closeCart, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        state.isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Cart Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">购物车</h3>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-2">购物车是空的</p>
              <p className="text-sm text-gray-400">快去选择一些美味的菜品吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-sm text-gray-600">¥{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm hover:bg-gray-300"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-primary-600"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {state.items.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-900">总计</span>
              <span className="text-xl font-bold text-primary-500">¥{totalPrice.toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 font-medium"
            >
              去结算
            </Button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
      />
    </div>
  );
}
