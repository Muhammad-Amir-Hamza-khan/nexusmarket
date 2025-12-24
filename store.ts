import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, Order, CartItem, UserRole } from './types';
import { INITIAL_PRODUCTS } from './constants';

const DB_KEY = 'nexus_db_mock';

interface DB {
  users: User[];
  products: Product[];
  orders: Order[];
}

interface NexusContextType {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (name: string, email: string, password: string, role: UserRole) => { success: boolean; message: string };
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  placeOrder: (address: string) => Order | undefined;
  products: Product[];
  orders: Order[];
  users: User[];
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

const getDB = (): DB => {
  const data = localStorage.getItem(DB_KEY);
  if (data) return JSON.parse(data);
  return {
    users: [],
    products: INITIAL_PRODUCTS,
    orders: []
  };
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const NexusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DB>(getDB());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  const login = (email: string, password: string) => {
    const user = db.users.find(u => u.email === email);
    if (!user) return { success: false, message: "User not found." };
    if (user.password !== password) return { success: false, message: "Invalid password." };
    setCurrentUser(user);
    return { success: true, message: "Logged in." };
  };

  const signup = (name: string, email: string, password: string, role: UserRole) => {
    const existing = db.users.find(u => u.email === email);
    if (existing) return { success: false, message: "Email already registered." };
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString()
    };
    
    const updatedDb = { ...db, users: [...db.users, newUser] };
    setDb(updatedDb);
    saveDB(updatedDb);
    setCurrentUser(newUser);
    return { success: true, message: "Signup successful." };
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const placeOrder = (address: string) => {
    if (!currentUser || cart.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      buyerId: currentUser.id,
      items: [...cart],
      total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
      status: 'PAID',
      address,
      createdAt: new Date().toISOString()
    };
    const updatedDb = { ...db, orders: [newOrder, ...db.orders] };
    setDb(updatedDb);
    saveDB(updatedDb);
    setCart([]);
    return newOrder;
  };

  const updateProduct = (product: Product) => {
    const updatedProducts = db.products.map(p => p.id === product.id ? product : p);
    const updatedDb = { ...db, products: updatedProducts };
    setDb(updatedDb);
    saveDB(updatedDb);
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = db.products.filter(p => p.id !== id);
    const updatedDb = { ...db, products: updatedProducts };
    setDb(updatedDb);
    saveDB(updatedDb);
  };

  // Convert JSX to React.createElement as store.ts is not a .tsx file to avoid parsing errors.
  return React.createElement(NexusContext.Provider, {
    value: {
      currentUser, login, signup, logout, cart, addToCart, removeFromCart,
      placeOrder, products: db.products, orders: db.orders, users: db.users,
      updateProduct, deleteProduct
    }
  }, children);
};

export const useNexusStore = () => {
  const context = useContext(NexusContext);
  if (!context) throw new Error("useNexusStore must be used within a NexusProvider");
  return context;
};