
import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm">
        <a href={`#/product/${product.id}`}>
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </a>
        
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            New
          </span>
        )}

        {product.isBestSeller && (
          <span className="absolute top-4 left-4 bg-[#722F37] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            Best Seller
          </span>
        )}

        <button 
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#722F37] text-[#722F37]' : ''}`} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <a 
            href={`#/product/${product.id}`}
            className="w-full bg-black text-white py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            View Details
          </a>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            <a href={`#/product/${product.id}`} className="hover:underline">{product.name}</a>
          </h3>
          <p className="text-xs text-gray-500">{product.category}</p>
        </div>
        <p className="font-semibold text-gray-900">${product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
