import React, { useState, useEffect } from 'react';
import { Package, Clock, RefreshCw, ExternalLink, Search, Filter, ChevronLeft, ChevronRight, Truck, X, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingAddress: Address;
  paymentMethod: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const OrderHistory: React.FC = () => {
  const { convertPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Mock order data (in real app, this would come from API)
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      date: '2024-01-15',
      total: 289.99,
      trackingNumber: '1Z999999999999',
      estimatedDelivery: '2024-01-20',
      actualDelivery: '2024-01-18',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      items: [
        {
          id: '1',
          name: 'Silk Essence Maxi Dress',
          price: 129.00,
          quantity: 1,
          selectedSize: 'M',
          selectedColor: 'Black',
          image: 'https://picsum.photos/id/1011/800/1000'
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      date: '2024-01-10',
      total: 189.00,
      trackingNumber: '1Z888888888888',
      estimatedDelivery: '2024-01-15',
      actualDelivery: null,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90036',
        country: 'USA'
      },
      paymentMethod: 'PayPal',
      items: [
        {
          id: '2',
          name: 'Structured Blazer Set',
          price: 189.00,
          quantity: 1,
          selectedSize: 'L',
          selectedColor: 'Navy',
          image: 'https://picsum.photos/id/1018/800/1000'
        }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'processing',
      date: '2024-01-12',
      total: 237.00,
      trackingNumber: null,
      estimatedDelivery: '2024-01-25',
      actualDelivery: null,
      shippingAddress: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60614',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      items: [
        {
          id: '4',
          name: 'Wide Leg Trousers',
          price: 119.00,
          quantity: 1,
          selectedSize: 'M',
          selectedColor: 'Black',
          image: 'https://picsum.photos/id/1030/800/1000'
        },
        {
          id: '5',
          name: 'Leather Moto Jacket',
          price: 299.00,
          quantity: 1,
          selectedSize: 'L',
          selectedColor: 'Black',
          image: 'https://picsum.photos/id/1045/800/1000'
        }
      ]
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      status: 'cancelled',
      date: '2024-01-05',
      total: 89.99,
      trackingNumber: null,
      estimatedDelivery: null,
      actualDelivery: null,
      shippingAddress: {
        street: '321 Elm St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02108',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      items: [
        {
          id: '6',
          name: 'Cashmere Blend Sweater',
          price: 149.00,
          quantity: 2,
          selectedSize: 'L',
          selectedColor: 'Camel',
          image: 'https://picsum.photos/id/1024/800/1000'
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'shipped': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'pending': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Package className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'processing': return <Clock className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'cancelled': return <X className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'total':
        return b.total - a.total;
      default:
        return 0;
    }
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleReorder = (order: Order) => {
    // Create WhatsApp message for reordering
    const orderDetails = order.items.map(item => 
      `${item.name} (${item.selectedSize}, ${item.selectedColor}) - ${convertPrice(item.price)} x${item.quantity}`
    ).join('\n');

    const message = `Hi! I'd like to reorder the following items:\n\n${orderDetails}\n\nTotal: ${convertPrice(order.total)}\n\nOrder Number: ${order.orderNumber}\n\nThank you!`;
    
    const whatsappUrl = `https://wa.me/234708123456?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTrackOrder = (trackingNumber: string) => {
    if (trackingNumber) {
      const trackingUrl = `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
      window.open(trackingUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <button className="text-gray-600 hover:text-gray-900">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-black transition"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'total')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="total">Sort by Total</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#722F37] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order history...</p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            {paginatedOrders.length > 0 ? (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600 mb-1">
                                {item.selectedSize} • {item.selectedColor}
                              </p>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-gray-900">
                                  {convertPrice(item.price)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {convertPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                              <button
                                onClick={() => handleReorder(order)}
                                className="bg-[#722F37] text-white px-3 py-2 rounded-md hover:bg-[#5a335] transition text-sm"
                              >
                                Reorder
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Order Total</p>
                          <p className="text-2xl font-bold text-gray-900">{convertPrice(order.total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{order.items.length} items</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Payment Method</p>
                          <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{order.trackingNumber}</span>
                              <button
                                onClick={() => handleTrackOrder(order.trackingNumber)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Track Package
                              </button>
                            </div>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Estimated Delivery</p>
                            <p className="text-sm text-gray-600">{order.estimatedDelivery}</p>
                          </div>
                        )}
                        {order.actualDelivery && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Actual Delivery</p>
                            <p className="text-sm text-green-600">{order.actualDelivery}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No orders found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchQuery && `No orders found matching "${searchQuery}"`}
                  {!searchQuery && 'No orders found'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
