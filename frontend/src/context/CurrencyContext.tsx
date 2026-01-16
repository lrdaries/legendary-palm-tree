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

// Fallback rates (same as old client)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  NGN: 1550.0,
  AUD: 1.35,
  CAD: 1.25,
  CNY: 6.45,
  INR: 74.5
};

const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1550.0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5 }
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
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(DEFAULT_CURRENCIES[0]); // Default to USD
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
    if (isLoading) return `$${price.toFixed(2)}`;
    
    const convertedPrice = price * currentCurrency.rate;
    const formattedPrice = convertedPrice.toFixed(2);
    
    // Handle different decimal places for different currencies
    let decimals = 2;
    if (currentCurrency.code === 'JPY' || currentCurrency.code === 'CNY') {
      decimals = 0; // No decimals for Yen/Yuan
    }
    
    return `${currentCurrency.symbol}${formattedPrice}`;
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
