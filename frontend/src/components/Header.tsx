import React, { useState } from 'react';
import { ShoppingBag, Heart, Menu, X, Search, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import CurrencySelector from './CurrencySelector';
import SearchModal from './SearchModal';
import UserAccountModal from './UserAccountModal';

interface HeaderProps {
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { cartCount, wishlist } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState(false);
  
  // Ensure menu is closed on desktop resize and initial load
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMenuOpen(false);
      }
    };
    
    // Check on initial load
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Logo */}
          <a href="#" className="text-xl md:text-2xl font-bold tracking-tighter text-[#1A1A1A] order-2 lg:order-1">
            DIVAS<span className="text-[#722F37]">KLOSET</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase tracking-widest order-1 lg:order-2">
            <a href="#" className="hover:text-[#722F37] transition">Home</a>
            <a href="#/shop" className="hover:text-[#722F37] transition">Shop</a>
            <a href="#/about" className="hover:text-[#722F37] transition">Our Story</a>
            <a href="#/contact" className="hover:text-[#722F37] transition">Contact Us</a>
            <div className="ml-auto flex items-center gap-4">
              <CurrencySelector />
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4 order-3">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="relative hover:text-[#722F37] transition p-2 hover:bg-gray-100 rounded-full"
              aria-label="Search"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setIsUserAccountOpen(true)}
              className="relative hover:text-[#722F37] transition p-2 hover:bg-gray-100 rounded-full"
              aria-label="Account"
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <a 
              href="#/shop" 
              className="relative hover:text-[#722F37] transition p-2 hover:bg-gray-100 rounded-full"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#722F37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </a>
            <button 
              onClick={onCartClick} 
              className="relative hover:text-[#722F37] transition p-2 hover:bg-gray-100 rounded-full"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#722F37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9999] bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu Content */}
          <div className="fixed inset-0 z-[10000] bg-white lg:hidden flex flex-col p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 text-lg font-medium">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Home
              </a>
              <a 
                href="#/shop" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/shop';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Shop All
              </a>
              <a 
                href="#/shop?cat=Dresses" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/shop?cat=Dresses';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Dresses
              </a>
              <a 
                href="#/shop?cat=Sets" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/shop?cat=Sets';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Sets
              </a>
              <a 
                href="#/about" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/about';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Our Story
              </a>
              <a 
                href="#/contact" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/contact';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Contact Us
              </a>
              <a 
                href="#/shipping" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/shipping';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Shipping
              </a>
              <a 
                href="#/returns" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/returns';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Returns
              </a>
              <a 
                href="#/order-tracking" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/order-tracking';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Order Tracking
              </a>
              <a 
                href="#/login" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.location.href = '#/login';
                }}
                className="hover:text-[#722F37] transition py-2"
              >
                Sign In
              </a>
            </nav>
            
            {/* Currency Selector for Mobile */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <CurrencySelector />
            </div>
          </div>
        </>
      )}
      
      <UserAccountModal 
        isOpen={isUserAccountOpen} 
        onClose={() => setIsUserAccountOpen(false)} 
      />
    </header>
  );
};

export default Header;
