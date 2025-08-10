import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MERCHANT_ORDER_STATUSES } from "@/lib/constants";
import { Clock, Check, Truck, Phone } from "lucide-react";
import type { Order, Address } from "@shared/schema";

export default function OrderProcessing() {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { all: "true" }],
  });

  const filteredOrders = allOrders.filter(order => {
    if (selectedStatus === "pending") return order.status === "pending" || order.paymentStatus === "paid";
    return order.status === selectedStatus;
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/orders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "订单状态更新成功",
      });
    },
    onError: () => {
      toast({
        title: "订单状态更新失败",
        variant: "destructive",
      });
    },
  });

  const handleConfirmOrder = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "preparing" }
    });
  };

  const handleCompletePreparation = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "delivering" }
    });
  };

  const handleCompleteDelivery = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "delivered" }
    });
  };

  const handleCancelOrder = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "cancelled" }
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "border-accent-orange", bgColor: "bg-accent-orange", label: "新订单" };
      case "preparing":
        return { color: "border-accent-blue", bgColor: "bg-accent-blue", label: "备餐中" };
      case "delivering":
        return { color: "border-accent-green", bgColor: "bg-accent-green", label: "配送中" };
      case "delivered":
        return { color: "border-green-500", bgColor: "bg-green-500", label: "已完成" };
      default:
        return { color: "border-gray-500", bgColor: "bg-gray-500", label: status };
    }
  };

  const getOrderActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => handleConfirmOrder(order.id)}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium"
              size="sm"
            >
              <Check className="h-4 w-4 mr-1" />
              确认订单
            </Button>
            <Button 
              variant="outline"
              className="w-full text-sm"
              size="sm"
            >
              <Phone className="h-4 w-4 mr-1" />
              联系用户
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleCancelOrder(order.id)}
              className="w-full text-sm"
              size="sm"
            >
              取消订单
            </Button>
          </div>
        );
      case "preparing":
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => handleCompletePreparation(order.id)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium"
              size="sm"
            >
              <Truck className="h-4 w-4 mr-1" />
              餐品准备完成
            </Button>
            <div className="text-sm text-gray-600">
              <p>预计完成时间：{new Date(new Date(order.createdAt!).getTime() + 30 * 60000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>已用时：{Math.floor((Date.now() - new Date(order.createdAt!).getTime()) / 60000)}分钟</p>
            </div>
          </div>
        );
      case "delivering":
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => handleCompleteDelivery(order.id)}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium"
              size="sm"
            >
              确认送达
            </Button>
            <div className="text-sm text-gray-600">
              <p>配送开始时间：{new Date(order.updatedAt!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-600">
            <p>订单已完成</p>
            <p>完成时间：{new Date(order.updatedAt!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">订单处理</h2>
      
      {/* Order Status Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {MERCHANT_ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.label} ({allOrders.filter(order => {
                if (status.value === "pending") return order.status === "pending" || order.paymentStatus === "paid";
                return order.status === status.value;
              }).length})
            </button>
          ))}
        </div>
      </div>

      {/* Order Processing Cards */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          return (
            <Card key={order.id} className={`bg-white rounded-xl shadow-md border-l-4 ${statusInfo.color}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">#{order.id.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">
                      下单时间：{new Date(order.createdAt!).toLocaleString('zh-CN')} | 用户：用户{order.userId.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-600">
                      配送地址：{order.addressId ? `地址${order.addressId.slice(-4)}` : "无地址信息"}
                    </p>
                  </div>
                  <span className={`${statusInfo.bgColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">订单详情</h4>
                    <div className="space-y-2">
                      {(order.items as any[]).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex items-center justify-between font-medium">
                        <span>总计</span>
                        <span>¥{order.totalAmount}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        支付方式：{order.paymentMethod === "wechat" ? "微信支付" : "支付宝"}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">处理操作</h4>
                    {getOrderActions(order)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">该状态下暂无订单</p>
        </div>
      )}
    </div>
  );
}
