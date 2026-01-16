const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Products
  async getProducts() {
    return this.request('/api/products');
  }

  async getProductById(id: string) {
    return this.request(`/api/products/${id}`);
  }

  async getProductsByCategory(category: string) {
    return this.request(`/api/products?category=${encodeURIComponent(category)}`);
  }

  // Cart (for future integration with backend)
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number, size: string, color: string) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        size,
        color,
      }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Wishlist
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Reviews
  async getProductReviews(productId: string) {
    return this.request(`/reviews?productId=${productId}`);
  }

  async createReview(reviewData: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
