import { Product } from './types';
import ProductsService from './services/products';

export const COLORS = {
  primary: '#722F37', // Deep Wine
  bg: '#FAF9F6', // Off White/Beige
  accent: '#1A1A1A', // Black
};

export const CATEGORIES = ['All', 'Dresses', 'Accessories', 'Bags', 'Suits', 'Tops', 'Sets', 'Outerwear'];

// Fallback products for development/error cases
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silk Essence Maxi Dress',
    price: 129,
    category: 'Dresses',
    description: 'A flowy, premium silk-blend maxi dress designed for confident woman. Minimalist lines with a sophisticated drape.',
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
    description: 'Professional elegance redefined. This structured blazer and trouser set features clean lines and premium tailoring.',
    images: ['https://picsum.photos/id/1018/800/1000', 'https://picsum.photos/id/1020/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Black', 'Charcoal'],
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 89
  },
  {
    id: '3',
    name: 'Cashmere Blend Sweater',
    price: 149,
    category: 'Tops',
    description: 'Luxurious cashmere blend sweater with a relaxed silhouette. Perfect for layering or wearing alone.',
    images: ['https://picsum.photos/id/1024/800/1000', 'https://picsum.photos/id/1025/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Camel', 'Cream', 'Heather Gray'],
    rating: 4.7,
    reviewsCount: 156
  },
  {
    id: '4',
    name: 'Midi Skirt Collection',
    price: 89,
    category: 'Dresses',
    description: 'Versatile midi skirt in our signature stretch fabric. Flattering silhouette that transitions from day to night.',
    images: ['https://picsum.photos/id/1030/800/1000', 'https://picsum.photos/id/1031/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Burgundy'],
    rating: 4.6,
    reviewsCount: 203
  },
  {
    id: '5',
    name: 'Power Shoulder Top',
    price: 79,
    category: 'Tops',
    description: 'Modern take on the power dressing trend. Structured shoulders with a soft, flowing body for balance.',
    images: ['https://picsum.photos/id/1035/800/1000', 'https://picsum.photos/id/1036/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Blush'],
    isNew: true,
    rating: 4.5,
    reviewsCount: 67
  },
  {
    id: '6',
    name: 'Wide Leg Trousers',
    price: 119,
    category: 'Sets',
    description: 'Effortlessly chic wide-leg trousers with a high waist and clean lines. Professional yet comfortable.',
    images: ['https://picsum.photos/id/1040/800/1000', 'https://picsum.photos/id/1041/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Khaki', 'Black', 'Navy'],
    isBestSeller: true,
    rating: 4.8,
    reviewsCount: 178
  },
  {
    id: '7',
    name: 'Leather Moto Jacket',
    price: 299,
    category: 'Outerwear',
    description: 'Classic moto jacket in premium leather with modern tailoring. An investment piece that never goes out of style.',
    images: ['https://picsum.photos/id/1045/800/1000', 'https://picsum.photos/id/1046/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Cognac'],
    rating: 4.9,
    reviewsCount: 92
  },
  {
    id: '8',
    name: 'Silk Camisole Set',
    price: 139,
    category: 'Sets',
    description: 'Delicate silk camisole and matching shorts. Perfect for lounging or as layering pieces.',
    images: ['https://picsum.photos/id/1050/800/1000', 'https://picsum.photos/id/1051/800/1000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Champagne', 'Rose', 'Pearl'],
    rating: 4.7,
    reviewsCount: 145
  }
];

// Function to get products from API
export async function getProducts(
  limit: number = 50, 
  offset: number = 0, 
  category?: string, 
  sort: string = 'featured'
): Promise<Product[]> {
  try {
    const response = await ProductsService.getAllProducts(limit, offset, category, sort);
    if (response.success && response.data) {
      return response.data.map(product => ProductsService.transformProduct(product));
    }
    console.warn('Failed to fetch products, using fallback');
    return FALLBACK_PRODUCTS;
  } catch (error) {
    console.error('Error fetching products:', error);
    return FALLBACK_PRODUCTS;
  }
}

// Function to get single product
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await ProductsService.getProductById(id);
    if (response.success && response.data) {
      return ProductsService.transformProduct(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Function to search products
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await ProductsService.searchProducts(query);
    if (response.success && response.data) {
      return response.data.map(product => ProductsService.transformProduct(product));
    }
    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Legacy export for backward compatibility
export const PRODUCTS = FALLBACK_PRODUCTS;

export const REVIEWS = [
  {
    id: '1',
    user: 'Sarah M.',
    rating: 5,
    comment: 'Absolutely love this piece! The quality is exceptional and it fits perfectly.',
    date: '2024-01-15'
  },
  {
    id: '2',
    user: 'Emma L.',
    rating: 4,
    comment: 'Beautiful design and great quality. Slightly smaller than expected but still love it.',
    date: '2024-01-10'
  },
  {
    id: '3',
    user: 'Olivia K.',
    rating: 5,
    comment: 'Worth every penny! This has become my go-to piece for special occasions.',
    date: '2024-01-05'
  }
];
