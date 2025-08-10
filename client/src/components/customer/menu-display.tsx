import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { FOOD_CATEGORIES } from "@/lib/constants";
import type { FoodItem } from "@shared/schema";

export default function MenuDisplay() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: foodItems = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const filteredItems = foodItems.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const handleAddToCart = (item: FoodItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
      specification: item.specification,
    });
    
    toast({
      title: "已添加到购物车",
      description: `${item.name} 已添加到购物车`,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">今日菜品</h2>
        <div className="flex flex-wrap gap-4">
          {FOOD_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-white rounded-xl shadow-md card-hover">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">规格：{item.specification}</span>
                <span className="text-lg font-bold text-primary-500">¥{item.price}</span>
              </div>
              <Button 
                onClick={() => handleAddToCart(item)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium"
                disabled={!item.isAvailable || item.stock === 0}
              >
                {!item.isAvailable || item.stock === 0 ? "暂时缺货" : "加入购物车"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">该分类暂无菜品</p>
        </div>
      )}
    </div>
  );
}
