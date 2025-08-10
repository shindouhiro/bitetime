import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CURRENT_USER_ID } from "@/lib/constants";
import type { Address } from "@shared/schema";

export default function AddressManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses", { userId: CURRENT_USER_ID }],
  });

  const createAddressMutation = useMutation({
    mutationFn: async (addressData: any) => {
      const response = await apiRequest("POST", "/api/addresses", addressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setShowAddForm(false);
      toast({
        title: "地址添加成功",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/addresses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setEditingAddress(null);
      toast({
        title: "地址更新成功",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "地址删除成功",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addressData = {
      userId: CURRENT_USER_ID,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      note: formData.get("note") as string,
      isDefault: formData.get("isDefault") === "on",
    };

    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: addressData });
    } else {
      createAddressMutation.mutate(addressData);
    }
  };

  const setAsDefault = (id: string) => {
    updateAddressMutation.mutate({ 
      id, 
      data: { isDefault: true } 
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">地址管理</h2>
        <Button 
          onClick={() => {
            setShowAddForm(true);
            setEditingAddress(null);
          }}
          className="bg-primary-500 hover:bg-primary-600"
        >
          + 新增地址
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingAddress) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? "编辑地址" : "新增地址"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">联系人</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingAddress?.name || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingAddress?.phone || ""}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">详细地址</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingAddress?.address || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="note">备注信息</Label>
                <Textarea
                  id="note"
                  name="note"
                  defaultValue={editingAddress?.note || ""}
                  placeholder="如无人接收请联系门卫等"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  defaultChecked={editingAddress?.isDefault || false}
                />
                <Label htmlFor="isDefault">设为默认地址</Label>
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  保存
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <Card 
            key={address.id} 
            className={`bg-white rounded-xl shadow-md ${
              address.isDefault ? "border-2 border-primary-200" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {address.isDefault && (
                      <span className="bg-primary-500 text-white px-2 py-1 rounded text-xs">默认</span>
                    )}
                    <h3 className="font-semibold text-lg">{address.name}</h3>
                    <span className="text-gray-600">{address.phone}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{address.address}</p>
                  {address.note && (
                    <p className="text-sm text-gray-500">{address.note}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAsDefault(address.id)}
                    >
                      设为默认
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingAddress(address)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteAddressMutation.mutate(address.id)}
                    disabled={deleteAddressMutation.isPending}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无收货地址</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-primary-500 hover:bg-primary-600"
          >
            添加第一个地址
          </Button>
        </div>
      )}
    </div>
  );
}
