import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, wishlist } = useStore();
  const { convertPrice } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <>
      <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-[#722F37] text-white text-xs px-3 py-1 rounded-full font-medium">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-medium">
                Best Seller
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => toggleWishlist(product.id)}
              className="bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-[#722F37] text-[#722F37]' : 'text-gray-600'}`}
              />
            </button>
          </div>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-white text-black py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-medium text-gray-900 group-hover:text-[#722F37] transition-colors cursor-pointer" onClick={() => setIsModalOpen(true)}>
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">
              {convertPrice(product.price)}
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">
                {product.rating}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewsCount})
            </span>
          </div>
        </div>
      </div>
      
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={product} 
      />
    </>
  );
};

export default ProductCard;
