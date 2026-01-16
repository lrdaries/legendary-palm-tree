import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currentCurrency, currencies, setCurrency, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = (currency: any) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#722F37] focus:border-[#722F37]"
        disabled={isLoading}
      >
        <span className="font-medium">{currentCurrency.code}</span>
        <span className="text-gray-500">{currentCurrency.symbol}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currency.code === currentCurrency.code
                    ? 'bg-[#722F37] text-white'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-gray-500">{currency.name}</div>
                  </div>
                  <div className="text-gray-500">{currency.symbol}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
