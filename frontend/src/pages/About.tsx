import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
            alt="About Us Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            Crafting timeless elegance for the modern woman since 2020
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-serif mb-8">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              At Divas Kloset, we believe that fashion should be both beautiful and meaningful. 
              Our mission is to create sophisticated, timeless pieces that empower women to express 
              their unique style with confidence and grace.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are committed to sustainable practices, ethical production, and creating clothing 
              that not only looks good but also feels good to wear. Each piece in our collection 
              is thoughtfully designed to transcend seasons and trends.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-4xl font-serif text-center mb-16">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#722F37] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">Q</span>
              </div>
              <h3 className="text-2xl font-serif mb-4">Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                We never compromise on quality. From fabric selection to final stitching, 
                every detail is meticulously considered to ensure exceptional craftsmanship.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#722F37] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">S</span>
              </div>
              <h3 className="text-2xl font-serif mb-4">Sustainability</h3>
              <p className="text-gray-600 leading-relaxed">
                We are committed to sustainable fashion practices, using eco-friendly materials 
                and ethical production methods that minimize our environmental impact.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#722F37] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">E</span>
              </div>
              <h3 className="text-2xl font-serif mb-4">Empowerment</h3>
              <p className="text-gray-600 leading-relaxed">
                We design for the modern woman who values both style and substance. 
                Our pieces are created to make you feel confident, elegant, and empowered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-serif mb-6">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Divas Kloset was born from a simple idea: to create beautiful, 
              timeless clothing that makes women feel extraordinary. After years in the 
              fashion industry, we saw a need for pieces that combined elegance with 
              practicality, luxury with accessibility.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Every collection tells a story – of craftsmanship, of attention to detail, 
              and of the modern woman who deserves to feel beautiful every single day. 
              We don't just sell clothes; we create confidence.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Thank you for being part of our journey. Welcome to the Divas Kloset family.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <p className="text-gray-400">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
              <p className="text-gray-400">Unique Designs</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15</div>
              <p className="text-gray-400">Countries</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">4.9★</div>
              <p className="text-gray-400">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl font-serif mb-6">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Be the first to know about new collections, exclusive offers, and style inspiration. 
            Subscribe to our newsletter and become part of the Divas Kloset family.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#722F37] transition"
            />
            <button
              type="submit"
              className="bg-[#722F37] text-white px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
          
          <div className="flex justify-center gap-6">
            <a href="#" className="text-gray-600 hover:text-[#722F37] transition">
              Instagram
            </a>
            <a href="#" className="text-gray-600 hover:text-[#722F37] transition">
              Facebook
            </a>
            <a href="#" className="text-gray-600 hover:text-[#722F37] transition">
              Pinterest
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
