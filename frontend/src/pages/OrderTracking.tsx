import React, { useState } from 'react';
import { Search, Package, Truck, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
}

const OrderTracking: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/track/${searchQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found. Please check your order number and try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'shipped':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  // Mock order data for demonstration
  const mockOrder: Order = {
    id: '1',
    orderNumber: 'DIVAS-2024-001234',
    status: 'shipped',
    orderDate: '2024-01-10',
    estimatedDelivery: '2024-01-17',
    trackingNumber: 'TRK123456789',
    items: [
      {
        name: 'Elegant Evening Gown',
        quantity: 1,
        price: 45000,
        image: '/api/placeholder-product/1'
      },
      {
        name: 'Classic Business Suit',
        quantity: 1,
        price: 35000,
        image: '/api/placeholder-product/2'
      }
    ],
    shippingAddress: {
      name: 'Jane Doe',
      address: '123 Fashion Avenue',
      city: 'Lagos',
      state: 'Lagos State',
      postalCode: '100001',
      country: 'Nigeria'
    },
    totalAmount: 80000
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Order Tracking</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your order status and get real-time updates on your delivery.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number or Tracking ID
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    id="orderNumber"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your order number (e.g., DIVAS-2024-001234)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-[#722F37] focus:border-[#722F37]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#722F37] hover:bg-[#5a2429] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-t-2 border-[#722F37]"></div>
                        <span className="ml-2">Tracking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Search className="h-4 w-4 mr-2" />
                        Track Order
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Order Results */}
          {(order || mockOrder) && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Order Status */}
              <div className="mb-8">
                <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getStatusColor((order || mockOrder).status)}`}>
                  {getStatusIcon((order || mockOrder).status)}
                  <span className="ml-2 font-medium">{getStatusText((order || mockOrder).status)}</span>
                </div>
                <h2 className="text-2xl font-serif text-gray-900 mt-4">
                  Order #{(order || mockOrder).orderNumber}
                </h2>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">{new Date((order || mockOrder).orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">{new Date((order || mockOrder).estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                    {(order || mockOrder).trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-medium">{(order || mockOrder).trackingNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-[#722F37]">₦{(order || mockOrder).totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-[#722F37] flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">{(order || mockOrder).shippingAddress.name}</p>
                        <p className="text-gray-600">{(order || mockOrder).shippingAddress.address}</p>
                        <p className="text-gray-600">
                          {(order || mockOrder).shippingAddress.city}, {(order || mockOrder).shippingAddress.state}, {(order || mockOrder).shippingAddress.postalCode}
                        </p>
                        <p className="text-gray-600">{(order || mockOrder).shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {(order || mockOrder).items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'64\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' fill=\'%23f3f4f6\'/%3E%3C/svg%3E';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-medium text-[#722F37]">₦{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">{new Date((order || mockOrder).orderDate).toLocaleDateString()} - {new Date((order || mockOrder).orderDate).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {(order || mockOrder).status === 'shipped' && (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Shipped</p>
                        <p className="text-sm text-gray-600">Your order is on its way to you</p>
                      </div>
                    </div>
                  )}

                  {(order || mockOrder).status === 'delivered' && (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Delivered</p>
                        <p className="text-sm text-gray-600">Your order has been successfully delivered</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!isAuthenticated && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Login for Full Tracking</h3>
                <p className="text-blue-800 mb-4">
                  Please log in to your account to access detailed order history and tracking information.
                </p>
                <button
                  onClick={() => window.location.hash = '#/login'}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#722F37] hover:bg-[#5a2429] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37]"
                >
                  Sign In to Track Orders
                </button>
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Can't find your order or have questions about your delivery? Our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@divaskloset.com"
                  className="flex items-center justify-center px-6 py-3 border border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37]"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Email Support
                </a>
                <a 
                  href="tel:+2347073994915"
                  className="flex items-center justify-center px-6 py-3 border border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37]"
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Call Support
                </a>
              </div>
              <div className="mt-4 text-gray-600">
                <p>Customer Service Hours: Monday - Friday, 9:00 AM - 6:00 PM WAT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
