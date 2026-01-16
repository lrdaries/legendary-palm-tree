import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts, CATEGORIES } from '../constants';
import { Product } from '../types';

const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getProducts(50, 0, selectedCategory, sortBy);
        setFilteredProducts(products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, sortBy]);

  // Get category from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const category = urlParams.get('cat');
    if (category && CATEGORIES.includes(category)) {
      setSelectedCategory(category);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Shop All</h1>
          <p className="text-gray-600">
            Discover our complete collection of premium fashion pieces.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 pb-8 border-b border-gray-200">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-gray-300 hover:border-black'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="lg:ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:border-black"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or browse all categories.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-[#722F37] font-medium hover:underline"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
