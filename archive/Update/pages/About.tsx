
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-24 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">Sophistication <br /><span className="italic">Redefined.</span></h1>
          <p className="text-lg text-gray-500 font-light leading-relaxed">
            DivasKloset was born from a simple observation: luxury shouldn't be about logos, but about how a garment makes you feel.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm">
              <img 
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop" 
                alt="Our Vision" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-bold">The Modern Wardrobe</h2>
              <p className="text-gray-600 leading-relaxed">
                We design for the woman who is building her legacy. Whether it's the boardroom or a gallery opening, our pieces provide the canvas for your confidence. No fast-fashion noise—just curated, premium essentials.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-2">The Quality</h4>
                  <p className="text-xs text-gray-500">Sourced from the finest mills worldwide.</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-2">The Mission</h4>
                  <p className="text-xs text-gray-500">Accessible elegance for every woman.</p>
                </div>
              </div>
              <a href="#/shop" className="inline-block border-b-2 border-black pb-1 font-bold uppercase tracking-widest text-sm hover:text-[#722F37] hover:border-[#722F37] transition">
                Shop The Collection
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
