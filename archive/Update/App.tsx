
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import { StoreProvider } from './context/StoreContext';
import { MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple Router logic
  const renderPage = () => {
    const path = currentPath.split('?')[0];
    
    if (path === '#' || path === '') return <Home />;
    if (path === '#/shop') return <Shop />;
    if (path === '#/about') return <About />;
    if (path.startsWith('#/product/')) {
      const id = path.split('/').pop();
      return <ProductDetail productId={id || ''} />;
    }
    
    return <Home />;
  };

  // Scroll to top on path change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  return (
    <StoreProvider>
      <div className="flex flex-col min-h-screen">
        <Header onCartClick={() => setIsCartOpen(true)} />
        
        <main className="flex-1">
          {renderPage()}
        </main>

        <Footer />
        
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/1234567890" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2 group"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold uppercase tracking-widest px-0 group-hover:px-2">Chat with us</span>
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </StoreProvider>
  );
};

export default App;
