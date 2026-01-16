
import React from 'react';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="text-xl font-serif font-bold mb-6">DIVASKLOSET</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering modern women with clean, sophisticated style. We believe in quality over noise.
            </p>
            <div className="flex gap-4">
              <Instagram className="w-5 h-5 cursor-pointer hover:text-[#722F37]" />
              <Facebook className="w-5 h-5 cursor-pointer hover:text-[#722F37]" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-[#722F37]" />
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#/shop" className="hover:text-white transition">New Arrivals</a></li>
              <li><a href="#/shop" className="hover:text-white transition">Best Sellers</a></li>
              <li><a href="#/shop" className="hover:text-white transition">Sale</a></li>
              <li><a href="#/shop" className="hover:text-white transition">Gift Cards</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#/contact" className="hover:text-white transition">Shipping Info</a></li>
              <li><a href="#/contact" className="hover:text-white transition">Returns & Exchanges</a></li>
              <li><a href="#/contact" className="hover:text-white transition">Size Guide</a></li>
              <li><a href="#/contact" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Join the Club</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for 10% off your first order.</p>
            <div className="flex border-b border-gray-700 pb-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-transparent border-none outline-none text-sm w-full py-1"
              />
              <button className="text-[#722F37] uppercase text-xs font-bold tracking-widest">Join</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>&copy; 2024 DivasKloset. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Secure Payments</span>
            <span>Worldwide Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
