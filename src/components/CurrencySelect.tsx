import { CURRENCIES, CurrencyCode } from '@shared/constants/currencies';
import { ChevronDown } from 'lucide-react';

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
}

export function CurrencySelect({ value, onChange, className }: CurrencySelectProps) {
  const selectedCurrency = CURRENCIES[value];

  return (
    <div className="relative inline-block w-28">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className={`appearance-none block w-full rounded-lg border border-zinc-200 
          bg-white py-2 pl-10 pr-10 text-sm text-zinc-900 
          hover:border-zinc-300 focus:border-zinc-300 focus:ring-1 
          focus:ring-zinc-300 transition-colors cursor-pointer
          ${className}`}
      >
        {Object.entries(CURRENCIES).map(([code]) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-zinc-500 font-medium">{selectedCurrency.symbol}</span>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </div>
    </div>
  );
} 