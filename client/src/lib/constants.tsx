export const CURRENT_USER_ID = "customer-1"; // Mock current user ID
export const MERCHANT_USER_ID = "merchant-1"; // Mock merchant user ID

export const FOOD_CATEGORIES = [
  { value: "all", label: "全部" },
  { value: "main", label: "主食" },
  { value: "soup", label: "汤品" },
  { value: "vegetable", label: "蔬菜" },
  { value: "fruit", label: "水果" },
] as const;

export const ORDER_STATUSES = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待付款" },
  { value: "preparing", label: "备餐中" },
  { value: "delivering", label: "配送中" },
  { value: "delivered", label: "已送达" },
] as const;

export const MERCHANT_ORDER_STATUSES = [
  { value: "pending", label: "新订单", count: 3 },
  { value: "preparing", label: "备餐中", count: 2 },
  { value: "delivering", label: "待配送", count: 1 },
  { value: "delivered", label: "已完成", count: 12 },
] as const;

export const PAYMENT_METHODS = [
  { value: "wechat", label: "微信支付" },
  { value: "alipay", label: "支付宝" },
] as const;
