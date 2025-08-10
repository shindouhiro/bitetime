import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, CURRENT_USER_ID } from "@/lib/constants";
import type { Order } from "@shared/schema";

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { userId: CURRENT_USER_ID }],
  });

  const filteredOrders = orders.filter(order => 
    selectedStatus === "all" || order.status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-accent-orange";
      case "delivering":
        return "bg-accent-blue";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "待付款";
      case "preparing":
        return "备餐中";
      case "delivering":
        return "配送中";
      case "delivered":
        return "已送达";
      case "cancelled":
        return "已取消";
      default:
        return status;
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h2>
      
      {/* Order Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedStatus === status.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">订单 #{order.id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    下单时间：{new Date(order.createdAt!).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              <div className="border-t pt-4">
                {(order.items as any[]).map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-2">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name} x{item.quantity}</p>
                      <p className="text-sm text-gray-600">¥{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  <p className="font-semibold text-lg">总计：¥{order.totalAmount}</p>
                  <p className="text-sm text-gray-600">支付方式：{order.paymentMethod === "wechat" ? "微信支付" : "支付宝"}</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    查看详情
                  </Button>
                  {order.status === "pending" && (
                    <Button variant="destructive" size="sm">
                      取消订单
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                      再次购买
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无订单</p>
        </div>
      )}
    </div>
  );
}
