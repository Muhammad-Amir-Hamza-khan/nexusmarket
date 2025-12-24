
export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only stored in mock DB, not usually sent to client
  profileImage?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  sellerId: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  items: CartItem[];
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';
  address: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
