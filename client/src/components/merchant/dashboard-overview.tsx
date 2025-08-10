import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign, Package, Users } from "lucide-react";
import type { Order } from "@shared/schema";

export default function DashboardOverview() {
  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders", { all: "true" }],
  });

  // Calculate today's stats
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const todayOrders = allOrders.filter(order => 
    new Date(order.createdAt!) >= todayStart
  );
  
  const todayRevenue = todayOrders.reduce((sum, order) => 
    sum + parseFloat(order.totalAmount), 0
  );

  const activeUsers = new Set(allOrders.map(order => order.userId)).size;

  const recentOrders = allOrders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-accent-orange";
      case "delivered":
        return "bg-green-500";
      case "delivering":
        return "bg-accent-blue";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "preparing":
        return "备餐中";
      case "delivered":
        return "已送达";
      case "delivering":
        return "配送中";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">数据概览</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100">
                <BarChart3 className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日订单</p>
                <p className="text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-100">
                <DollarSign className="h-6 w-6 text-secondary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日收入</p>
                <p className="text-2xl font-semibold text-gray-900">¥{todayRevenue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-accent-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">在售商品</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-accent-green" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃用户</p>
                <p className="text-2xl font-semibold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white rounded-xl shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最新订单</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">订单号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">用户</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">#{order.id.slice(-8)}</td>
                    <td className="py-3 px-4">用户{order.userId.slice(-4)}</td>
                    <td className="py-3 px-4">¥{order.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`${getStatusColor(order.status)} text-white px-2 py-1 rounded-full text-xs`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt!).toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {recentOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无订单</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
