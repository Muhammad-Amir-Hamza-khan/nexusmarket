
import React from 'react';

export const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];
export const BRANDS = ['Nexus', 'Aura', 'Titan', 'Zenith', 'Lumina'];

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    title: 'Nexus Ultra Phone',
    description: 'The latest flagship with AI processing and 108MP camera.',
    price: 999,
    category: 'Electronics',
    brand: 'Nexus',
    stock: 15,
    sellerId: 'seller_1',
    imageUrl: 'https://picsum.photos/seed/phone/600/400'
  },
  {
    id: '2',
    title: 'Aura Wireless Headphones',
    description: 'Noise cancelling studio-quality sound with 40h battery.',
    price: 249,
    category: 'Electronics',
    brand: 'Aura',
    stock: 25,
    sellerId: 'seller_1',
    imageUrl: 'https://picsum.photos/seed/audio/600/400'
  },
  {
    id: '3',
    title: 'Titan Mechanical Keyboard',
    description: 'Tactile feedback for pro gamers and typists.',
    price: 129,
    category: 'Electronics',
    brand: 'Titan',
    stock: 8,
    sellerId: 'seller_2',
    imageUrl: 'https://picsum.photos/seed/keyboard/600/400'
  },
  {
    id: '4',
    title: 'Zenith Canvas Jacket',
    description: 'Water-resistant stylish jacket for all seasons.',
    price: 89,
    category: 'Fashion',
    brand: 'Zenith',
    stock: 40,
    sellerId: 'seller_2',
    imageUrl: 'https://picsum.photos/seed/fashion/600/400'
  }
];
