import React, { useState } from 'react';
import { MapPin, LogOut } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  savedAmount: number;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  addresses: Address[];
  preferences: UserPreferences;
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface UserPreferences {
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    promotions: boolean;
    orders: boolean;
  };
  theme: 'light' | 'dark';
}

const Dashboard: React.FC = () => {
  const { convertPrice } = useCurrency();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    addresses: [
      {
        id: '1',
        type: 'shipping',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        isDefault: true
      }
    ],
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: {
        email: true,
        sms: false,
        promotions: true,
        orders: true,
      },
      theme: 'light'
    }
  });

  const [stats] = useState<DashboardStats>({
    totalOrders: 24,
    pendingOrders: 3,
    completedOrders: 21,
    totalSpent: 2847.50,
    savedAmount: 127.30
  });

  const [orders] = useState([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      date: '2024-01-15',
      total: 89.99,
      items: [
        { id: '1', name: 'Silk Essence Maxi Dress', quantity: 1, price: 129.00 }
      ],
      trackingNumber: '1Z999999999999',
      estimatedDelivery: '2024-01-20',
      actualDelivery: '2024-01-18'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      date: '2024-01-10',
      total: 189.00,
      items: [
        { id: '2', name: 'Structured Blazer Set', quantity: 1, price: 189.00 },
        { id: '3', name: 'Cashmere Blend Sweater', quantity: 2, price: 298.00 }
      ],
      trackingNumber: '1Z888888888888',
      estimatedDelivery: '2024-01-15',
      actualDelivery: null
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'processing',
      date: '2024-01-12',
      total: 237.00,
      items: [
        { id: '4', name: 'Wide Leg Trousers', quantity: 1, price: 119.00 },
        { id: '5', name: 'Leather Moto Jacket', quantity: 1, price: 299.00 }
      ],
      trackingNumber: null,
      estimatedDelivery: '2024-01-25',
      actualDelivery: null
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'shipped': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <button className="text-gray-600 hover:text-gray-900">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Stats Overview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalOrders}</div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.completedOrders}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{convertPrice(stats.totalSpent)}</div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{convertPrice(stats.savedAmount)}</div>
                  <p className="text-sm text-gray-600">Saved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Orders
                </button>
              </div>
              
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">Order Total</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{convertPrice(order.total)}</p>
                        <p className="text-sm text-gray-500">{order.items.length} items</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      {order.trackingNumber && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-600 mb-1">Tracking: {order.trackingNumber}</p>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              Est. Delivery: {order.estimatedDelivery}
                              {order.actualDelivery && (
                                <span className="text-green-600"> (Delivered: {order.actualDelivery})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={userProfile.firstName}
                    onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={userProfile.lastName}
                    onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={userProfile.phone || ''}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={userProfile.dateOfBirth || ''}
                    onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="pt-4">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
