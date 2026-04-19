'use client';

import { useLocaleStore, Currency } from '@/stores/localeStore';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useLocaleStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = [
    { code: 'USD' as Currency, label: 'USD ($)', flag: '🌍', description: 'US Dollar' },
    { code: 'INR' as Currency, label: 'INR (₹)', flag: '🇮🇳', description: 'Indian Rupee' },
  ];

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const handleSelect = (code: Currency) => {
    setCurrency(code, true); // Mark as manual override
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-dark-card border border-brand-purple/30 hover:border-brand-purple/50 transition-colors text-sm"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{selectedCurrency.flag}</span>
        <span className="text-brand-gray-text font-medium">{selectedCurrency.label}</span>
        <ChevronDown className={`w-4 h-4 text-brand-gray-text transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-brand-dark-card border border-brand-purple/30 rounded-lg shadow-xl z-50 overflow-hidden">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleSelect(curr.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                currency === curr.code
                  ? 'bg-brand-purple/20 border-l-2 border-brand-purple'
                  : 'hover:bg-brand-purple/10'
              }`}
            >
              <span className="text-xl">{curr.flag}</span>
              <div className="flex-1">
                <div className={`font-medium ${currency === curr.code ? 'text-brand-purple' : 'text-white'}`}>
                  {curr.label}
                </div>
                <div className="text-xs text-brand-gray-text">{curr.description}</div>
              </div>
              {currency === curr.code && (
                <span className="text-brand-purple text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
