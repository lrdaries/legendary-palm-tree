
import React from 'react';
import { ArrowRight, Star, Quote } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../constants';

const Home: React.FC = () => {
  const featured = PRODUCTS.slice(0, 4);

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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-wrap justify-between items-center gap-12 text-center md:text-left">
            <div className="max-w-sm">
              <h2 className="text-3xl font-serif font-bold mb-4">No Compromises.</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We believe your wardrobe should inspire confidence. We skip the luxury markups to bring you high-end design without the nonsense.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 md:gap-16">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-serif font-bold text-[#722F37]">01</span>
                <span className="text-[10px] uppercase tracking-widest font-bold mt-2">Premium Fabrics</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-serif font-bold text-[#722F37]">02</span>
                <span className="text-[10px] uppercase tracking-widest font-bold mt-2">Clean Cuts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-serif font-bold text-[#722F37]">03</span>
                <span className="text-[10px] uppercase tracking-widest font-bold mt-2">Timeless Style</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[#722F37] text-xs font-bold uppercase tracking-[0.2em] mb-2 block">Curated For You</span>
              <h2 className="text-4xl font-serif font-bold">Featured Pieces</h2>
            </div>
            <a href="#/shop" className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-[#722F37] hover:border-[#722F37] transition">
              View All
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="w-12 h-12 text-[#FAF9F6] fill-gray-100 mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-serif italic mb-12 leading-relaxed">
              "Finally, a brand that understands modern elegance without trying too hard. The quality of my blazer set is beyond what I expected."
            </h2>
            <div className="flex flex-col items-center">
              <div className="flex gap-1 text-[#722F37] mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="font-bold uppercase tracking-widest text-sm">— Sarah J., New York</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-20 bg-[#722F37] text-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl font-serif mb-6">Elevate Your Everyday.</h2>
          <p className="mb-10 text-white/80 max-w-lg mx-auto font-light">
            Join 50,000+ women who choose DivasKloset for their essential wardrobe pieces.
          </p>
          <a 
            href="#/shop" 
            className="inline-block bg-white text-black px-12 py-4 font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition"
          >
            Start Shopping
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
