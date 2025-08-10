import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENT_USER_ID } from "@/lib/constants";
import type { Order } from "@shared/schema";

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("week");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { userId: CURRENT_USER_ID }],
  });

  // Filter orders based on date and search term
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt!);
    const now = new Date();
    let dateLimit: Date;

    switch (dateFilter) {
      case "week":
        dateLimit = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        dateLimit = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "quarter":
        dateLimit = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        dateLimit = new Date(0);
    }

    const matchesDate = orderDate >= dateLimit;
    const matchesSearch = searchTerm === "" || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.items as any[]).some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesDate && matchesSearch && order.status === "delivered";
  });

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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">历史订单</h2>
      
      {/* Date Filter and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">最近一周</SelectItem>
            <SelectItem value="month">最近一月</SelectItem>
            <SelectItem value="quarter">最近三月</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="搜索订单..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md"
        />
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="bg-white rounded-xl shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">订单 #{order.id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    下单时间：{new Date(order.createdAt!).toLocaleString('zh-CN')} | 
                    完成时间：{new Date(order.updatedAt!).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  已完成
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    {(order.items as any[]).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-lg text-right">总计：¥{order.totalAmount}</p>
                    <p className="text-sm text-gray-600 text-right">
                      {order.paymentMethod === "wechat" ? "微信支付" : "支付宝"}
                    </p>
                  </div>
                  <Button 
                    className="mt-2 bg-primary-500 hover:bg-primary-600 text-sm"
                    size="sm"
                  >
                    再次购买
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无历史订单</p>
        </div>
      )}
    </div>
  );
}
