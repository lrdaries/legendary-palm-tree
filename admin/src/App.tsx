import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Users from './components/Users';
import Settings from './components/Settings';
import './App.css';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session by verifying with the server
    const checkSession = async () => {
      try {
        // Use direct API URL for production, proxy for development
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? '/api/admin/auth/verify' 
          : '/api/admin/auth/verify';
          
        const response = await fetch(apiUrl, {
          credentials: 'include', // Important for cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#722F37]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user ? (
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard user={user} />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
