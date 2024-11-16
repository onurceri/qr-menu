export const CURRENCIES = {
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    locale: 'tr-TR'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB'
  }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatPrice(price: number, currencyCode: CurrencyCode): string {
  const currency = CURRENCIES[currencyCode];
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code
  }).format(price);
} 