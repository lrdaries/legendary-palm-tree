import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface CurrencyContextType {
  currentCurrency: Currency;
  currencies: Currency[];
  convertPrice: (price: number) => string;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
}

const CURRENCY_KEY = 'dk_currency';
const FX_CACHE_KEY = 'dk_fx_rates_usd_v1';
const FX_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Fallback rates (updated with realistic exchange rates)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157.5,
  NGN: 1650.0,
  AUD: 1.52,
  CAD: 1.36,
  CNY: 7.24,
  INR: 83.1
};

const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 157.5 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1650.0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.1 }
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(DEFAULT_CURRENCIES[4]); // Default to NGN (Naira)
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [isLoading, setIsLoading] = useState(false);

  // Load selected currency from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY);
      if (saved) {
        const currency = DEFAULT_CURRENCIES.find(c => c.code === saved);
        if (currency) {
          setCurrentCurrency(currency);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save currency to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currentCurrency.code);
    } catch {
      // ignore
    }
  }, [currentCurrency]);

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data.rates) {
          const updatedCurrencies = DEFAULT_CURRENCIES.map(currency => ({
            ...currency,
            rate: data.rates[currency.code] || FALLBACK_RATES[currency.code] || 1
          }));
          
          setCurrencies(updatedCurrencies);
          
          // Update current currency rate
          const updatedCurrent = updatedCurrencies.find(c => c.code === currentCurrency.code);
          if (updatedCurrent) {
            setCurrentCurrency(updatedCurrent);
          }
          
          // Cache rates
          localStorage.setItem(FX_CACHE_KEY, JSON.stringify({
            ts: Date.now(),
            rates: data.rates
          }));
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Use fallback rates
        const fallbackCurrencies = DEFAULT_CURRENCIES.map(currency => ({
          ...currency,
          rate: FALLBACK_RATES[currency.code] || 1
        }));
        setCurrencies(fallbackCurrencies);
      } finally {
        setIsLoading(false);
      }
    };

    // Try to load from cache first
    try {
      const cached = localStorage.getItem(FX_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.ts && Date.now() - parsed.ts < FX_TTL_MS) {
          const cachedCurrencies = DEFAULT_CURRENCIES.map(currency => ({
            ...currency,
            rate: parsed.rates[currency.code] || FALLBACK_RATES[currency.code] || 1
          }));
          setCurrencies(cachedCurrencies);
          
          // Update current currency rate
          const updatedCurrent = cachedCurrencies.find(c => c.code === currentCurrency.code);
          if (updatedCurrent) {
            setCurrentCurrency(updatedCurrent);
          }
          return;
        }
      }
    } catch {
      // ignore
    }

    // Fetch fresh rates if no cache or expired
    fetchRates();
  }, [currentCurrency.code]);

  const convertPrice = (price: number): string => {
    // Ensure price is a valid number
    const numericPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    
    if (isLoading) return `₦${numericPrice.toFixed(2)}`;
    
    // Base currency is NGN, convert to target currency
    let convertedPrice = numericPrice;
    if (currentCurrency.code !== 'NGN') {
      // Convert from NGN to target currency
      // NGN rate is 1650, USD rate is 1, so NGN → USD = price / 1650
      // NGN → EUR = (price / 1650) * 0.92
      const ngnRate = currencies.find(c => c.code === 'NGN')?.rate || 1650;
      convertedPrice = (numericPrice / ngnRate) * currentCurrency.rate;
    }
    
    // Handle different decimal places for different currencies
    const decimals = currentCurrency.code === 'JPY' || currentCurrency.code === 'CNY' ? 0 : 2;
    const finalPrice = convertedPrice.toFixed(decimals);
    
    return `${currentCurrency.symbol}${finalPrice}`;
  };

  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
  };

  const value: CurrencyContextType = {
    currentCurrency,
    currencies,
    convertPrice,
    setCurrency,
    isLoading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
