import React, { useState } from 'react';
import { X, User, ShoppingBag, Heart, Package, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserAccountModal: React.FC<UserAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed right-4 top-16 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#722F37] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {user && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === 'profile'
                  ? 'text-[#722F37] border-b-2 border-[#722F37]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === 'orders'
                  ? 'text-[#722F37] border-b-2 border-[#722F37]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'text-[#722F37] border-b-2 border-[#722F37]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!user ? (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">Sign In Required</h4>
              <p className="text-gray-600 mb-6">Please sign in to access your account</p>
              <div className="space-y-3">
                <a
                  href="#/login"
                  onClick={onClose}
                  className="block w-full bg-[#722F37] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5a2330] transition text-center"
                >
                  Sign In
                </a>
                <a
                  href="#/signup"
                  onClick={onClose}
                  className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition text-center"
                >
                  Create Account
                </a>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Shopping Cart</p>
                      <p className="text-sm text-gray-500">View your cart items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Wishlist</p>
                      <p className="text-sm text-gray-500">View your saved items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Order History</p>
                      <p className="text-sm text-gray-500">View your past orders</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">No Orders Yet</h4>
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                    <a
                      href="#/shop"
                      onClick={onClose}
                      className="inline-block bg-[#722F37] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#5a2330] transition"
                    >
                      Start Shopping
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Account Settings</p>
                      <p className="text-sm text-gray-500">Manage your account preferences</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <p className="font-medium text-red-600">Sign Out</p>
                      <p className="text-sm text-red-500">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserAccountModal;
