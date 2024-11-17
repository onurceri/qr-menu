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
    <div className="relative inline-block w-32">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="appearance-none w-full bg-white border border-zinc-200 hover:border-zinc-300 
        px-2 py-1.5 pr-8 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 
        focus:border-zinc-500 cursor-pointer"
      >
        {Object.values(CURRENCIES).map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-1.5 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
        <span className="text-zinc-600 text-sm">{selectedCurrency.symbol}</span>
      </div>
    </div>
  );
} 