
import React, { useState } from 'react';
import { ShoppingBag, Heart, Menu, X, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { cartCount, wishlist } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
          <a href="#" className="hover:text-[#722F37] transition">Home</a>
          <a href="#/shop" className="hover:text-[#722F37] transition">Shop</a>
          <a href="#/about" className="hover:text-[#722F37] transition">Our Story</a>
        </nav>

        <a href="#" className="text-2xl font-bold tracking-tighter text-[#1A1A1A]">
          DIVAS<span className="text-[#722F37]">KLOSET</span>
        </a>

        <div className="flex items-center gap-4 md:gap-6">
          <button className="hidden md:block hover:text-[#722F37] transition">
            <Search className="w-5 h-5" />
          </button>
          <a href="#/shop" className="relative hover:text-[#722F37] transition">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#722F37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </a>
          <button onClick={onCartClick} className="relative hover:text-[#722F37] transition">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#722F37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden flex flex-col p-8">
          <button onClick={() => setIsMenuOpen(false)} className="self-end mb-8">
            <X className="w-8 h-8" />
          </button>
          <nav className="flex flex-col gap-6 text-2xl font-serif">
            <a href="#" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#/shop" onClick={() => setIsMenuOpen(false)}>Shop All</a>
            <a href="#/shop?cat=Dresses" onClick={() => setIsMenuOpen(false)}>Dresses</a>
            <a href="#/shop?cat=Sets" onClick={() => setIsMenuOpen(false)}>Sets</a>
            <a href="#/about" onClick={() => setIsMenuOpen(false)}>Our Story</a>
            <a href="#/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
