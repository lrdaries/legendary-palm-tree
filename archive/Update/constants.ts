
import { Product } from './types';

export const COLORS = {
  primary: '#722F37', // Deep Wine
  bg: '#FAF9F6', // Off White/Beige
  accent: '#1A1A1A', // Black
};

export const CATEGORIES = ['All', 'Dresses', 'Tops', 'Sets', 'Outerwear', 'Accessories'];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silk Essence Maxi Dress',
    price: 129,
    category: 'Dresses',
    description: 'A flowy, premium silk-blend maxi dress designed for the confident woman. Minimalist lines with a sophisticated drape.',
    images: ['https://picsum.photos/id/1011/800/1000', 'https://picsum.photos/id/1015/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Champagne', 'Onyx'],
    isNew: true,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: '2',
    name: 'Structured Blazer Set',
    price: 189,
    category: 'Sets',
    description: 'Power dressing made simple. Tailored blazer and matching trousers in high-quality wool-blend.',
    images: ['https://picsum.photos/id/1025/800/1000', 'https://picsum.photos/id/1024/800/1000'],
    sizes: ['S', 'M', 'L'],
    colors: ['Wine', 'Black', 'Forest'],
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 89
  },
  {
    id: '3',
    name: 'Cashmere Knit Top',
    price: 85,
    category: 'Tops',
    description: 'Ultra-soft cashmere blend knit top. A versatile staple for your premium wardrobe.',
    images: ['https://picsum.photos/id/338/800/1000', 'https://picsum.photos/id/342/800/1000'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'White', 'Charcoal'],
    isNew: true,
    rating: 4.7,
    reviewsCount: 45
  },
  {
    id: '4',
    name: 'City Chic Trench Coat',
    price: 245,
    category: 'Outerwear',
    description: 'The ultimate timeless outerwear. Weather-resistant fabric with elegant finishing.',
    images: ['https://picsum.photos/id/445/800/1000', 'https://picsum.photos/id/447/800/1000'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Sand', 'Stone'],
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 56
  },
  {
    id: '5',
    name: 'Satin Slip Skirt',
    price: 65,
    category: 'Bottoms',
    description: 'Lustrous satin finish skirt with a comfortable elasticated waistband.',
    images: ['https://picsum.photos/id/526/800/1000'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Midnight', 'Emerald', 'Copper'],
    rating: 4.5,
    reviewsCount: 32
  },
  {
    id: '6',
    name: 'Empowerment Jumpsuit',
    price: 155,
    category: 'Sets',
    description: 'One-and-done confidence. Sleek tailoring meets all-day comfort.',
    images: ['https://picsum.photos/id/611/800/1000'],
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Deep Teal'],
    isNew: true,
    rating: 4.9,
    reviewsCount: 28
  }
];
