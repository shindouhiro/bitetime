import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Repeat, Star } from "lucide-react";
import type { Order, FoodItem } from "@shared/schema";

export default function DataAnalytics() {
  const { data: allOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { all: "true" }],
  });

  const { data: foodItems = [], isLoading: itemsLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  if (ordersLoading || itemsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate popular items
  const itemSales = allOrders.reduce((acc, order) => {
    (order.items as any[]).forEach(item => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        acc.push({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    });
    return acc;
  }, [] as Array<{ id: string; name: string; image: string; quantity: number; revenue: number }>);

  const topItems = itemSales.sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Calculate user activity metrics
  const uniqueUsers = new Set(allOrders.map(order => order.userId));
  const userOrderCounts = allOrders.reduce((acc, order) => {
    acc[order.userId] = (acc[order.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repeatCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;
  const repeatRate = uniqueUsers.size > 0 ? (repeatCustomers / uniqueUsers.size) * 100 : 0;

  // Calculate daily active users for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyActiveUsers = last7Days.map(date => {
    const dayOrders = allOrders.filter(order => 
      order.createdAt && order.createdAt.split('T')[0] === date
    );
    return {
      date,
      users: new Set(dayOrders.map(order => order.userId)).size,
    };
  });

  // Calculate weekly and monthly metrics
  const last7DaysOrders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt!);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  });

  const last30DaysOrders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt!);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return orderDate >= monthAgo;
  });

  const weeklyActiveUsers = new Set(last7DaysOrders.map(order => order.userId)).size;
  const monthlyActiveUsers = new Set(last30DaysOrders.map(order => order.userId)).size;

  // Calculate sales trends for the current week
  const weeklyRevenue = last7Days.map(date => {
    const dayOrders = allOrders.filter(order => 
      order.createdAt && order.createdAt.split('T')[0] === date
    );
    const revenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    return { date, revenue };
  });

  const maxWeeklyRevenue = Math.max(...weeklyRevenue.map(d => d.revenue));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">数据统计</h2>
      
      {/* Popular Items and User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              热销商品 Top 5
            </h3>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-primary-500 w-6">#{index + 1}</span>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity}份</p>
                    <p className="text-sm text-gray-600">¥{item.revenue.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {topItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无销售数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              用户活跃度
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">日活跃用户</span>
                <span className="font-semibold text-lg">
                  {dailyActiveUsers[dailyActiveUsers.length - 1]?.users || 0}人
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">周活跃用户</span>
                <span className="font-semibold text-lg">{weeklyActiveUsers}人</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">月活跃用户</span>
                <span className="font-semibold text-lg">{monthlyActiveUsers}人</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Repeat className="h-4 w-4 mr-1" />
                  复购率
                </span>
                <span className="font-semibold text-lg">{repeatRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends */}
      <Card className="bg-white rounded-xl shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            销售趋势（最近7天）
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {weeklyRevenue.map((day) => {
              const height = maxWeeklyRevenue > 0 ? (day.revenue / maxWeeklyRevenue) * 100 : 0;
              return (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-primary-500 rounded-t w-full min-h-[8px] relative group cursor-pointer"
                    style={{ height: `${Math.max(height, 3)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        ¥{day.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">
                    {new Date(day.date).toLocaleDateString('zh-CN', { 
                      month: 'numeric', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              );
            })}
          </div>
          
          {weeklyRevenue.every(day => day.revenue === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无销售数据</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
