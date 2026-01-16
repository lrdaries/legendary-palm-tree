
import React, { useState, useEffect } from 'react';
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { useStore } from '../context/StoreContext';

interface ProductDetailProps {
  productId: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const product = PRODUCTS.find(p => p.id === productId);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (product) {
      setMainImage(product.images[0]);
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (!product) return <div className="p-20 text-center font-serif text-2xl">Product Not Found</div>;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setMessage('Added to your bag!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <nav className="flex gap-2 text-xs uppercase tracking-widest text-gray-500 mb-12">
          <a href="#" className="hover:text-black">Home</a>
          <span>/</span>
          <a href="#/shop" className="hover:text-black">Shop</a>
          <span>/</span>
          <span className="text-black font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`aspect-square overflow-hidden bg-gray-100 rounded-sm border-2 ${mainImage === img ? 'border-[#722F37]' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[#722F37] text-xs font-bold uppercase tracking-widest mb-2 block">{product.category}</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">{product.name}</h1>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1 text-[#722F37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewsCount} Verified Reviews)</span>
            </div>

            <p className="text-3xl font-bold mb-10 text-[#1A1A1A]">${product.price}</p>

            <div className="space-y-8 mb-10">
              {/* Color Selection */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Color: <span className="font-normal text-gray-500">{selectedColor}</span></h4>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 p-1 ${selectedColor === color ? 'border-[#722F37]' : 'border-transparent'}`}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color.toLowerCase() === 'cream' ? '#F5F5DC' : color.toLowerCase() === 'onyx' ? '#111' : '#722F37' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Select Size</h4>
                  <button className="text-xs font-bold uppercase border-b border-black hover:text-[#722F37] hover:border-[#722F37]">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[56px] h-12 flex items-center justify-center border text-sm font-medium transition ${selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-gray-200 h-14 w-full sm:w-auto">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="w-12 h-full flex items-center justify-center hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white h-14 font-bold uppercase tracking-widest text-sm hover:bg-[#722F37] transition flex items-center justify-center"
                >
                  Add to Bag
                </button>
                <button 
                   onClick={() => toggleWishlist(product.id)}
                   className={`h-14 w-14 border flex items-center justify-center transition ${wishlist.includes(product.id) ? 'border-[#722F37] bg-[#722F37]/5' : 'border-gray-200 hover:border-black'}`}
                >
                  <Heart className={`w-6 h-6 ${wishlist.includes(product.id) ? 'fill-[#722F37] text-[#722F37]' : ''}`} />
                </button>
              </div>

              {message && <p className="text-green-600 font-bold text-center animate-bounce">{message}</p>}
            </div>

            {/* Product Meta */}
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <div className="flex gap-4">
                <Truck className="w-5 h-5 text-gray-400" />
                <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-1">Fast Delivery</h5>
                  <p className="text-xs text-gray-500">Free express shipping on all orders over $200.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-1">Easy Returns</h5>
                  <p className="text-xs text-gray-500">Not the perfect fit? Return within 30 days for an exchange.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-1">Quality Assurance</h5>
                  <p className="text-xs text-gray-500">Premium craftsmanship guaranteed for all items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="mt-24 max-w-3xl">
          <h2 className="text-3xl font-serif font-bold mb-8">Elevated Craftsmanship</h2>
          <div className="prose prose-sm text-gray-600 max-w-none space-y-4">
            <p>{product.description}</p>
            <p>Crafted for the modern minimalist, this piece seamlessly transitions from professional settings to elegant evenings. We've utilized high-grade textile blends to ensure maximum comfort without sacrificing structure.</p>
          </div>
        </section>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 lg:hidden">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-black text-white h-12 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          Add to Bag — ${product.price}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
