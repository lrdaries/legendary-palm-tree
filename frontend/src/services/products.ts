import { Product } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:3000';

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface SearchResponse {
  success: boolean;
  data: Product[];
  query: string;
}

class ProductsService {
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  static async getAllProducts(
    limit: number = 50, 
    offset: number = 0, 
    category?: string, 
    sort: string = 'featured'
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort,
      ...(category && category !== 'All' && { category })
    });

    const response = await fetch(`${API_BASE_URL}/api/products?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  }

  static async getProductById(id: string): Promise<ProductResponse> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
  }

  static async searchProducts(query: string): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });

    const response = await fetch(`${API_BASE_URL}/api/products/search?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`);
    }

    return response.json();
  }

  // Transform backend product data to frontend format
  static transformProduct(product: any): Product {
    // Map database categories to frontend categories
    const categoryMap: { [key: string]: string } = {
      'dresses': 'Dresses',
      'accessories': 'Accessories',
      'bags': 'Bags',
      'bag': 'Bags',
      'suits': 'Suits',
      'tops': 'Tops',
      'sets': 'Sets',
      'outerwear': 'Outerwear'
    };

    const mappedCategory = categoryMap[product.category?.toLowerCase()] || 
                          product.category || 
                          'Uncategorized';

    return {
      id: product.id.toString(),
      name: product.name,
      price: product.price || 0,
      category: mappedCategory,
      description: product.description || '',
      images: product.image_urls && product.image_urls.length > 0 
        ? (typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls)
        : product.image_url 
          ? [product.image_url] 
          : ['https://picsum.photos/seed/default/800/1000'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'], // Default sizes
      colors: ['Black', 'White', 'Navy'], // Default colors
      isNew: false, // Could be determined from created_at
      isBestSeller: false, // Could be determined from sales data
      rating: 4.5, // Default rating
      reviewsCount: 0, // Default reviews
      inStock: product.in_stock !== false,
      sku: product.sku,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  }
}

export default ProductsService;
