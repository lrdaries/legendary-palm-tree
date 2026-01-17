import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { login, verifyOtp, isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if already logged in
    if (isAuthenticated) {
      window.location.hash = '#/';
    }
  }, [isAuthenticated]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Make direct API call for OTP request since AuthContext login is for password flow
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEmailSent(true);
        setShowOtpInput(true);
      } else {
        if (data.message && data.message.includes('No account found')) {
          setError('No account found with this email. <a href="#/signup" class="text-[#722F37] hover:underline">Sign up here</a>');
        } else {
          setError(data.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Use AuthContext verifyOtp method
      const success = await verifyOtp(email, otp);
      
      if (success) {
        // AuthContext will handle the redirect automatically
        // No need to manually redirect here
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    
    try {
      // Make direct API call for OTP resend
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setError('OTP resent successfully!');
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleBackToEmail = () => {
    setShowOtpInput(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a one-time password for secure access
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p 
                className="text-sm text-red-600" 
                dangerouslySetInnerHTML={{ __html: error }}
              />
            </div>
          )}

          {!showOtpInput ? (
            // Step 1: Enter Email Only
            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#722F37] focus:border-[#722F37]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={authLoading || !email}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#722F37] hover:bg-[#5a2429] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37] focus:border-[#722F37] disabled:opacity-50"
                >
                  {authLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to Divas Kloset?</span>
                    <a
                      href="#/signup"
                      className="font-medium text-[#722F37] hover:text-[#5a2429]"
                    >
                      Create an account
                    </a>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            // Step 2: Enter OTP
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="email-display" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-display"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    disabled={true}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 text-gray-900 placeholder-gray-500 bg-gray-100"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password (OTP)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#722F37] focus:border-[#722F37]"
                    placeholder="Enter 6-digit code"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={authLoading || otp.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#722F37] hover:bg-[#5a2429] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722F37] focus:border-[#722F37] disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Sign In'}
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={authLoading}
                  className="text-sm text-[#722F37] hover:text-[#5a2429] font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="#/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
