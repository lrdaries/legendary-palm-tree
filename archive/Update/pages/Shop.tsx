
import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../constants';

const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shop Collection</h1>
          <nav className="flex gap-2 text-xs uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-black">Home</a>
            <span>/</span>
            <span className="text-black font-bold">Shop</span>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-10">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Categories</h3>
                <ul className="space-y-4">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => setActiveCategory(cat)}
                        className={`text-sm tracking-wide transition ${activeCategory === cat ? 'text-[#722F37] font-bold' : 'text-gray-500 hover:text-black'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Filter By Price</h3>
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                     <input type="checkbox" className="accent-[#722F37]" />
                     <span>$0 — $100</span>
                   </label>
                   <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                     <input type="checkbox" className="accent-[#722F37]" />
                     <span>$100 — $200</span>
                   </label>
                   <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                     <input type="checkbox" className="accent-[#722F37]" />
                     <span>$200+</span>
                   </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500">Showing {filteredProducts.length} items</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-widest">Sort By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm border-none outline-none focus:ring-0 cursor-pointer font-medium"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-500 mb-4">No products found in this category.</p>
                <button 
                  onClick={() => setActiveCategory('All')}
                  className="underline font-bold uppercase text-xs tracking-widest"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
