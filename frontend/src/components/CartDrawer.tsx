import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCurrency } from '../context/CurrencyContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, addToCart, cartTotal } = useStore();
  const { convertPrice } = useCurrency();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Prevent body scroll when cart is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleWhatsAppOrder = () => {
    const orderDetails = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price * item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    })).join('\n');

    const message = `New Order Request! 🛍\n\nOrder Details:\n${orderDetails}\n\nTotal Amount: ${convertPrice(cartTotal)}\n\nPlease process this order and confirm delivery details.\n\nThank you for shopping with Diva's Kloset!`;

    // WhatsApp number (replace with your actual WhatsApp number)
    const whatsappNumber = '234708123456'; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateQuantity(itemId, item.selectedSize, newQuantity - item.quantity);
    }
  };

  const handleRemoveItem = (itemId: string, selectedSize: string) => {
    removeFromCart(itemId, selectedSize);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity">
          <div className="flex items-start justify-center min-h-screen pt-8 px-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Shopping Cart ({getTotalItems()} items)</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                    <button
                      onClick={onClose}
                      className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500">Size: {item.selectedSize}</span>
                              <span className="text-gray-500">Color: {item.selectedColor}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">{convertPrice(item.price)}</p>
                            <p className="text-sm text-gray-500">{convertPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-gray-700 mx-2">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={item.selectedSize}
                              onChange={(e) => {
                                const newQuantity = item.quantity;
                                removeFromCart(item.id, item.selectedSize);
                                for (let i = 0; i < newQuantity; i++) {
                                  addToCart(item, e.target.value, item.selectedColor);
                                }
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              {item.sizes.map((size) => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                            
                            <select
                              value={item.selectedColor}
                              onChange={(e) => {
                                const newQuantity = item.quantity;
                                removeFromCart(item.id, item.selectedSize);
                                for (let i = 0; i < newQuantity; i++) {
                                  addToCart(item, item.selectedSize, e.target.value);
                                }
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                              {item.colors.map((color) => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id, item.selectedSize)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal: {convertPrice(cartTotal)}</p>
                    <p className="text-xs text-gray-500">({getTotalItems()} items)</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="flex-1 bg-green-600 text-white py-3 px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition items-center"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      <span>Order via WhatsApp</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Order via WhatsApp</h3>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  🎉 Order Ready for WhatsApp!
                </p>
                <p className="text-xs text-green-700">
                  Your order details have been prepared and will be sent to our WhatsApp team for processing.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-600 text-white py-3 px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Send Order to WhatsApp
              </button>
            </div>

            <div className="mb-4">
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
