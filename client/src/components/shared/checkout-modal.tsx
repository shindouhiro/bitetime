import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CURRENT_USER_ID, PAYMENT_METHODS } from "@/lib/constants";
import type { Address } from "@shared/schema";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("wechat");
  const { state, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ["/api/addresses", { userId: CURRENT_USER_ID }],
  });

  const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      processPaymentMutation.mutate({ 
        orderId: order.id, 
        paymentMethod 
      });
    },
    onError: () => {
      toast({
        title: "订单创建失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payment/process", paymentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "支付成功！",
        description: "订单已提交，请等待商家确认",
      });
      clearCart();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "支付失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const handleConfirmPayment = () => {
    if (!defaultAddress) {
      toast({
        title: "请先添加收货地址",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: CURRENT_USER_ID,
      addressId: defaultAddress.id,
      totalAmount: totalPrice.toString(),
      paymentMethod,
      items: state.items,
    };

    createOrderMutation.mutate(orderData);
  };

  // Show modal when there are items and user wants to checkout
  const showModal = state.items.length > 0 && isOpen;

  // This would be triggered from the shopping cart
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">确认订单</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">订单详情</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">总计</span>
                <span className="text-lg font-bold text-primary-500">¥{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">配送地址</h4>
            {defaultAddress ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{defaultAddress.name} {defaultAddress.phone}</p>
                <p className="text-sm text-gray-600">{defaultAddress.address}</p>
                {defaultAddress.note && (
                  <p className="text-sm text-gray-500">{defaultAddress.note}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">请先添加收货地址</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">支付方式</h4>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label key={method.value} className="flex items-center">
                  <input 
                    type="radio" 
                    name="payment" 
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-500"
                  />
                  <span className="ml-2 font-medium text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={createOrderMutation.isPending || processPaymentMutation.isPending || !defaultAddress}
              className="flex-1 bg-primary-500 hover:bg-primary-600"
            >
              {createOrderMutation.isPending || processPaymentMutation.isPending ? "处理中..." : "确认支付"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
