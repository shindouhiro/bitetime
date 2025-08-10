import { type User, type InsertUser, type FoodItem, type InsertFoodItem, type Address, type InsertAddress, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Food Items
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: string): Promise<boolean>;
  
  // Addresses
  getAddressesByUserId(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;
  
  // Orders
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private foodItems: Map<string, FoodItem> = new Map();
  private addresses: Map<string, Address> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample users
    const customerUser: User = {
      id: "customer-1",
      username: "zhangmama",
      password: "password123",
      role: "customer",
      name: "张妈妈",
      phone: "18812341234",
      avatar: "https://pixabay.com/get/g91317bd447e6a968782e917657941ecc87f97413f341bf0e804247bbdd7b3ec02b86519159ec5d7ba42ca295ae75197a67688d244e79901192849cb52910451b_1280.jpg"
    };

    const merchantUser: User = {
      id: "merchant-1",
      username: "kindergarten",
      password: "password123",
      role: "merchant",
      name: "阳光幼儿园食堂",
      phone: "02012345678",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"
    };

    this.users.set(customerUser.id, customerUser);
    this.users.set(merchantUser.id, merchantUser);

    // Initialize sample food items
    const sampleFoodItems: FoodItem[] = [
      {
        id: "1",
        name: "红烧排骨",
        description: "精选优质排骨，慢炖2小时",
        price: "18.00",
        category: "main",
        specification: "300g",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 50,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "2",
        name: "嫩滑蒸蛋羹",
        description: "新鲜鸡蛋，嫩滑营养",
        price: "8.00",
        category: "main",
        specification: "1碗",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 30,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "3",
        name: "紫菜蛋花汤",
        description: "清香紫菜，营养丰富",
        price: "6.00",
        category: "soup",
        specification: "1碗",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 40,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "4",
        name: "胡萝卜炒肉丝",
        description: "新鲜胡萝卜，营养均衡",
        price: "12.00",
        category: "vegetable",
        specification: "1份",
        image: "https://pixabay.com/get/g344e29acc931036c45fb45be65bd6e8c3a35efea5245c75cac074c19cf8704a2f6ce4d2bf7b563e5e6cd543be873664dba8f2ba90fed3077bc736b8dcaac8437_1280.jpg",
        stock: 25,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "5",
        name: "清炒西兰花",
        description: "新鲜西兰花，维生素丰富",
        price: "10.00",
        category: "vegetable",
        specification: "1份",
        image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 35,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "6",
        name: "新鲜苹果片",
        description: "脆甜苹果，补充维C",
        price: "5.00",
        category: "fruit",
        specification: "1份",
        image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 20,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "7",
        name: "香甜香蕉",
        description: "进口香蕉，香甜可口",
        price: "3.00",
        category: "fruit",
        specification: "1根",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 15,
        isAvailable: true,
        createdAt: new Date()
      },
      {
        id: "8",
        name: "香喷喷白米饭",
        description: "优质大米，蒸制软糯",
        price: "4.00",
        category: "main",
        specification: "1碗",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        stock: 100,
        isAvailable: true,
        createdAt: new Date()
      }
    ];

    sampleFoodItems.forEach(item => {
      this.foodItems.set(item.id, item);
    });

    // Initialize sample address
    const sampleAddress: Address = {
      id: "addr-1",
      userId: "customer-1",
      name: "张妈妈",
      phone: "18812341234",
      address: "阳光幼儿园教学楼2楼小班教室",
      note: "请在教室门口等候，谢谢",
      isDefault: true
    };

    this.addresses.set(sampleAddress.id, sampleAddress);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Food Items
  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(insertItem: InsertFoodItem): Promise<FoodItem> {
    const id = randomUUID();
    const item: FoodItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date() 
    };
    this.foodItems.set(id, item);
    return item;
  }

  async updateFoodItem(id: string, updateData: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const existing = this.foodItems.get(id);
    if (!existing) return undefined;

    const updated: FoodItem = { ...existing, ...updateData };
    this.foodItems.set(id, updated);
    return updated;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  // Addresses
  async getAddressesByUserId(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(addr => addr.userId === userId);
  }

  async getAddress(id: string): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = randomUUID();
    const address: Address = { ...insertAddress, id };
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(id: string, updateData: Partial<InsertAddress>): Promise<Address | undefined> {
    const existing = this.addresses.get(id);
    if (!existing) return undefined;

    const updated: Address = { ...existing, ...updateData };
    this.addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string): Promise<boolean> {
    return this.addresses.delete(id);
  }

  // Orders
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;

    const updated: Order = { ...existing, ...updateData, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
