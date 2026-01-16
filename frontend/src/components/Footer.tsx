import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 tracking-tighter">
              DIVAS<span className="text-[#722F37]">KLOSET</span>
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Premium fashion designed for the modern woman. Sophisticated, minimalist, and uncompromising in quality.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              <li><a href="#/shop?cat=Dresses" className="text-gray-400 hover:text-white transition">Dresses</a></li>
              <li><a href="#/shop?cat=Tops" className="text-gray-400 hover:text-white transition">Tops</a></li>
              <li><a href="#/shop?cat=Sets" className="text-gray-400 hover:text-white transition">Sets</a></li>
              <li><a href="#/shop?cat=Outerwear" className="text-gray-400 hover:text-white transition">Outerwear</a></li>
              <li><a href="#/shop?cat=Accessories" className="text-gray-400 hover:text-white transition">Accessories</a></li>
              <li><a href="#/shop?cat=Bags" className="text-gray-400 hover:text-white transition">Bags</a></li>
              <li><a href="#/shop?cat=Suits" className="text-gray-400 hover:text-white transition">Suits</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-lg font-semibold mb-6 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-3">
              <li><a href="#/contact" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
              <li><a href="#/shipping" className="text-gray-400 hover:text-white transition">Shipping & Returns</a></li>
              <li><a href="#/size-guide" className="text-gray-400 hover:text-white transition">Size Guide</a></li>
              <li><a href="#/care" className="text-gray-400 hover:text-white transition">Care Instructions</a></li>
              <li><a href="#/faq" className="text-gray-400 hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 uppercase tracking-wider">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#722F37]" />
                <span className="text-gray-400">hello@divaskloset.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#722F37]" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#722F37]" />
                <span className="text-gray-400">123 Fashion Ave, NY 10001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-4">Stay in Style</h4>
            <p className="text-gray-400 mb-6">Subscribe to receive exclusive offers, new arrivals, and style inspiration.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#722F37] transition"
              />
              <button
                type="submit"
                className="bg-[#722F37] text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Divas Kloset. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
              <a href="#/terms" className="text-gray-400 hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
