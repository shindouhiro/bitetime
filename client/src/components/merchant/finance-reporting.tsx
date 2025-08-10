import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import type { Order } from "@shared/schema";

export default function FinanceReporting() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { all: "true" }],
  });

  // Filter orders by date range and payment status
  const filteredOrders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt!);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return orderDate >= start && orderDate <= end && order.paymentStatus === "paid";
  });

  // Calculate financial metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group orders by payment method
  const paymentMethodStats = filteredOrders.reduce((acc, order) => {
    const method = order.paymentMethod || "unknown";
    acc[method] = (acc[method] || 0) + parseFloat(order.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  // Daily revenue data for the current month
  const dailyRevenue = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt!).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + parseFloat(order.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  const handleExportReport = () => {
    const csvContent = [
      ["交易时间", "订单号", "用户ID", "支付方式", "金额", "状态"],
      ...filteredOrders.map(order => [
        new Date(order.createdAt!).toLocaleString('zh-CN'),
        order.id,
        order.userId,
        order.paymentMethod === "wechat" ? "微信支付" : "支付宝",
        order.totalAmount,
        "已到账"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `财务报表_${startDate}_${endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">财务对账</h2>
      
      {/* Date Range Selector */}
      <Card className="bg-white rounded-xl shadow-md mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1 block">
                开始日期
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1 block">
                结束日期
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button className="bg-primary-500 hover:bg-primary-600 mt-6">
              查询
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportReport}
              className="mt-6"
            >
              <Download className="h-4 w-4 mr-2" />
              导出报表
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">总收入</h3>
                <p className="text-3xl font-bold text-green-600">¥{totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">统计期间累计</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">订单数量</h3>
                <p className="text-3xl font-bold text-primary-500">{totalOrders}</p>
                <p className="text-sm text-gray-600">统计期间累计</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <DollarSign className="h-6 w-6 text-secondary-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">平均客单价</h3>
                <p className="text-3xl font-bold text-secondary-500">¥{averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">统计期间平均</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">支付方式统计</h3>
            <div className="space-y-4">
              {Object.entries(paymentMethodStats).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {method === "wechat" ? "微信支付" : method === "alipay" ? "支付宝" : method}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold">¥{amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {((amount / totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">收入趋势</h3>
            <div className="h-48 flex items-end justify-between space-x-1">
              {Object.entries(dailyRevenue).slice(-7).map(([date, revenue]) => {
                const maxRevenue = Math.max(...Object.values(dailyRevenue));
                const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={date} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-primary-500 rounded-t w-full"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${date}: ¥${revenue.toFixed(2)}`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">
                      {new Date(date).getDate()}日
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details */}
      <Card className="bg-white rounded-xl shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">支付明细</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">交易时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">订单号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">用户</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">支付方式</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm">
                      {new Date(order.createdAt!).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">#{order.id.slice(-8)}</td>
                    <td className="py-3 px-4">用户{order.userId.slice(-4)}</td>
                    <td className="py-3 px-4">
                      {order.paymentMethod === "wechat" ? "微信支付" : "支付宝"}
                    </td>
                    <td className="py-3 px-4 font-medium">¥{order.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        已到账
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">该时间段内暂无交易记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
