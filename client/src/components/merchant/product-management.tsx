import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import type { FoodItem } from "@shared/schema";

export default function ProductManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FoodItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/food-items", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      setShowAddForm(false);
      toast({
        title: "商品添加成功",
      });
    },
    onError: () => {
      toast({
        title: "商品添加失败",
        description: "请检查输入信息后重试",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/food-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      setEditingProduct(null);
      toast({
        title: "商品更新成功",
      });
    },
    onError: () => {
      toast({
        title: "商品更新失败",
        description: "请检查输入信息后重试",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/food-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({
        title: "商品删除成功",
      });
    },
    onError: () => {
      toast({
        title: "商品删除失败",
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const response = await apiRequest("PUT", `/api/food-items/${id}`, { isAvailable });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({
        title: "商品状态更新成功",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      category: formData.get("category") as string,
      specification: formData.get("specification") as string,
      image: formData.get("image") as string,
      stock: parseInt(formData.get("stock") as string),
      isAvailable: formData.get("isAvailable") === "on",
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const getCategoryLabel = (category: string) => {
    return FOOD_CATEGORIES.find(cat => cat.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">商品管理</h2>
        <Button 
          onClick={() => {
            setShowAddForm(true);
            setEditingProduct(null);
          }}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加商品
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingProduct) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? "编辑商品" : "新增商品"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">商品名称</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingProduct?.name || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">商品分类</Label>
                  <Select name="category" defaultValue={editingProduct?.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_CATEGORIES.filter(cat => cat.value !== "all").map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">商品描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  placeholder="描述商品特色和营养价值"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">价格 (元)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.price || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specification">规格</Label>
                  <Input
                    id="specification"
                    name="specification"
                    defaultValue={editingProduct?.specification || ""}
                    placeholder="例如：300g, 1碗"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">库存数量</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock || ""}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">商品图片链接</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  defaultValue={editingProduct?.image || ""}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  defaultChecked={editingProduct?.isAvailable ?? true}
                />
                <Label htmlFor="isAvailable">商品可售</Label>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      <Card className="bg-white rounded-xl shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">商品</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">分类</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">价格</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">库存</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.specification}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getCategoryLabel(product.category)}</td>
                    <td className="py-4 px-4">¥{product.price}</td>
                    <td className="py-4 px-4">
                      <span className={product.stock < 10 ? "text-red-600" : "text-gray-900"}>
                        {product.stock}份
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.isAvailable && product.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.isAvailable && product.stock > 0 ? "在售" : "下架"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAvailabilityMutation.mutate({ 
                            id: product.id, 
                            isAvailable: !product.isAvailable 
                          })}
                        >
                          {product.isAvailable ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无商品</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
