import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import OrderTracking from './pages/OrderTracking';
import Dashboard from './pages/Dashboard';
import OrderHistory from './pages/OrderHistory';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import { useSSRData } from './hooks/useSSRData';
import { MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data: ssrData } = useSSRData();

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple Router logic
  const renderPage = () => {
    const path = currentPath.split('?')[0];
    
    // Pass SSR data to components
    const homeProps = ssrData?.page === 'home' ? { featuredProducts: ssrData.featuredProducts || [] } : {};
    const shopProps = ssrData?.page === 'products' ? { products: ssrData.products || [] } : {};
    
    if (path === '#' || path === '') return <Home {...(homeProps as any)} />;
    if (path === '#/shop') return <Shop {...(shopProps as any)} />;
    if (path === '#/about') return <About />;
    if (path === '#/contact') return <Contact />;
    if (path === '#/shipping') return <Shipping />;
    if (path === '#/returns') return <Returns />;
    if (path === '#/order-tracking') return <OrderTracking />;
    if (path === '#/dashboard') return <Dashboard />;
    if (path === '#/order-history') return <OrderHistory />;
    if (path === '#/login') return <Login />;
    if (path === '#/signup') return <Signup />;
    if (path.startsWith('#/product/')) {
      const id = path.split('/').pop();
      const productProps = ssrData?.page === 'product' ? { initialProduct: ssrData.product } : {};
      return <ProductDetail productId={id || ''} {...(productProps as any)} />;
    }
    
    return <Home {...(homeProps as any)} />;
  };

  // Scroll to top on path change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  return (
    <ToastProvider>
      <AuthProvider>
        <CurrencyProvider>
          <StoreProvider>
            <div className="min-h-screen bg-white">
              <Header 
                onCartClick={() => setIsCartOpen(true)} 
              />
              
                <main className="flex-1">
                  {renderPage()}
                </main>
                
                <Footer />
                
                <CartDrawer 
                  isOpen={isCartOpen} 
                  onClose={() => setIsCartOpen(false)} 
                />
                
                {/* WhatsApp Floating Button */}
                <a
                  href="https://wa.me/2347073994915"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition-colors"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle size={24} />
                </a>
              </div>
            </StoreProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
