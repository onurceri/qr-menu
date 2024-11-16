import React from 'react';
import { CURRENCIES, CurrencyCode } from '../constants/currencies';
import { ChevronDown } from 'lucide-react';

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  const selectedCurrency = CURRENCIES[value];

  return (
    <div className="relative inline-block w-44">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2
         pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
      >
        {Object.values(CURRENCIES).map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-gray-500">{selectedCurrency.symbol}</span>
      </div>
    </div>
  );
} 