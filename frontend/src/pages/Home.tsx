import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Quote } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts, REVIEWS } from '../constants';
import { Product } from '../types';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const products = await getProducts(4, 0, undefined, 'featured');
        setFeatured(products);
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#722F37] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading featured products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Fashion Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 text-white">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-8xl font-serif mb-6 leading-tight">
              Elegance Is An <br />
              <span className="italic">Attitude.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-lg leading-relaxed font-light">
              Premium fashion designed for the modern woman. Sophisticated, minimalist, and uncompromising in quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#/shop" 
                className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-[#722F37] hover:text-white transition"
              >
                Shop New Arrivals <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#/about" 
                className="bg-transparent border border-white text-white px-10 py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center hover:bg-white hover:text-black transition"
              >
                The Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ethos */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-3xl font-serif mb-4">Timeless Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Each piece is crafted to transcend seasons and trends, offering enduring style for the modern wardrobe.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-serif mb-4">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                We source the finest materials and work with skilled artisans to ensure exceptional quality in every stitch.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-serif mb-4">Sustainable Luxury</h3>
              <p className="text-gray-600 leading-relaxed">
                Committed to responsible production practices that respect both people and the planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">Featured Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of standout pieces that define the essence of modern elegance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <a 
              href="#/shop" 
              className="inline-flex items-center gap-2 border border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from women who have made our collections part of their story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review) => (
              <div key={review.id} className="bg-white p-8 rounded-lg shadow-sm">
                <Quote className="w-8 h-8 text-[#722F37] mb-4" />
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{review.comment}"</p>
                <p className="font-medium">{review.user}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Ready to Elevate Your Style?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of women who have discovered the perfect balance of sophistication and comfort.
          </p>
          <a 
            href="#/shop" 
            className="inline-flex items-center gap-2 bg-[#722F37] text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
