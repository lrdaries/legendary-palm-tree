import { Product } from './types';
import ProductsService from './services/products';

export const COLORS = {
  primary: '#722F37', // Deep Wine
  bg: '#FAF9F6', // Off White/Beige
  accent: '#1A1A1A', // Black
};

// Store Information
export const STORE_INFO = {
  name: "Diva's Kloset",
  description: "Your destination for international luxury fashion.",
  tagline: "Elegance Redefined",
  website: 'https://divaskloset.com',
  email: 'support@divaskloset.com',
  phone: '+2347073994915',
  whatsapp: '+2347073994915',
  address: {
    street: 'No. 38, Atekon Drive Marian Road',
    city: 'Calabar',
    state: 'Cross River State',
    country: 'Nigeria'
  },
  hours: {
    weekdays: '9:00 AM - 6:00 PM GMT',
    saturday: '10:00 AM - 4:00 PM GMT',
    sunday: 'Closed'
  },
  shipping: {
    freeShippingThreshold: 200,
    international: true
  },
  social: {
    instagram: '#',
    facebook: '#',
    twitter: '#',
    pinterest: '#'
  },
  founded: 2026,
  currencies: ['USD', 'EUR', 'GBP', 'NGN', 'JPY', 'AUD', 'CAD', 'CNY', 'INR']
};

export const CATEGORIES = ['All', 'Dresses', 'Accessories', 'Bags', 'Suits', 'Tops', 'Sets', 'Outerwear'];

// Fallback products for development/error cases (no hardcoded images)
export const FALLBACK_PRODUCTS: Product[] = [];

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
      // Backend provides data with different field names, map to frontend Product type
      return response.data.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        price: product.price || 0,
        category: product.category || 'Uncategorized',
        description: product.description || '',
        images: product.images || [],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], // Default sizes
        colors: ['Black', 'White', 'Navy'], // Default colors
        isNew: false,
        isBestSeller: false,
        rating: 4.5,
        reviewsCount: 0,
        inStock: (product as any).in_stock !== false,
        sku: product.sku,
        createdAt: (product as any).created_at,
        updatedAt: (product as any).updated_at,
      }));
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
      const product = response.data;
      // Map backend data to frontend Product type
      return {
        id: product.id.toString(),
        name: product.name,
        price: product.price || 0,
        category: product.category || 'Uncategorized',
        description: product.description || '',
        images: product.images || [],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Navy'],
        isNew: false,
        isBestSeller: false,
        rating: 4.5,
        reviewsCount: 0,
        inStock: (product as any).in_stock !== false,
        sku: product.sku,
        createdAt: (product as any).created_at,
        updatedAt: (product as any).updated_at,
      };
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
      // Map backend data to frontend Product type
      return response.data.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        price: product.price || 0,
        category: product.category || 'Uncategorized',
        description: product.description || '',
        images: product.images || [],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Navy'],
        isNew: false,
        isBestSeller: false,
        rating: 4.5,
        reviewsCount: 0,
        inStock: (product as any).in_stock !== false,
        sku: product.sku,
        createdAt: (product as any).created_at,
        updatedAt: (product as any).updated_at,
      }));
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
