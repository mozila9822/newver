import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const currencySymbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  NZD: 'NZ$',
  JPY: '¥',
  CNY: '¥',
  CHF: 'CHF ',
  SEK: 'kr ',
  NOK: 'kr ',
  DKK: 'kr ',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  THB: '฿',
  MYR: 'RM ',
  PHP: '₱',
  IDR: 'Rp ',
  VND: '₫',
  AED: 'AED ',
  SAR: 'SAR ',
  ZAR: 'R ',
  RUB: '₽',
  TRY: '₺',
  PLN: 'zł ',
  CZK: 'Kč ',
  HUF: 'Ft ',
  RON: 'lei ',
  BGN: 'лв ',
};

const exchangeRates: Record<string, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  CAD: 1.48,
  AUD: 1.65,
  NZD: 1.78,
  JPY: 163.5,
  CNY: 7.85,
  CHF: 0.94,
  SEK: 11.45,
  NOK: 11.65,
  DKK: 7.46,
  INR: 91.2,
  BRL: 5.35,
  MXN: 18.75,
  KRW: 1425,
  SGD: 1.46,
  HKD: 8.52,
  THB: 38.5,
  MYR: 5.05,
  PHP: 60.5,
  IDR: 16850,
  VND: 26500,
  AED: 4.01,
  SAR: 4.09,
  ZAR: 19.85,
  RUB: 97.5,
  TRY: 31.5,
  PLN: 4.32,
  CZK: 25.2,
  HUF: 385,
  RON: 4.97,
  BGN: 1.96,
};

export function extractNumericPrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.,]/g, '').replace(',', '');
  return parseFloat(cleaned) || 0;
}

function detectSourceCurrency(priceString: string): string {
  const str = priceString.trim();
  if (str.startsWith('$') || str.startsWith('US$')) return 'USD';
  if (str.startsWith('£')) return 'GBP';
  if (str.startsWith('€')) return 'EUR';
  if (str.startsWith('¥')) return 'JPY';
  if (str.startsWith('C$')) return 'CAD';
  if (str.startsWith('A$')) return 'AUD';
  if (str.startsWith('₹')) return 'INR';
  if (str.startsWith('CHF')) return 'CHF';
  return 'EUR';
}

export function formatPrice(priceString: string, targetCurrency: string = 'EUR'): string {
  const numericPrice = extractNumericPrice(priceString);
  if (numericPrice === 0) return priceString;
  
  const sourceCurrency = detectSourceCurrency(priceString);
  
  if (sourceCurrency === targetCurrency) {
    const symbol = currencySymbols[targetCurrency] || targetCurrency + ' ';
    if (['JPY', 'KRW', 'VND', 'IDR', 'HUF'].includes(targetCurrency)) {
      return `${symbol}${Math.round(numericPrice).toLocaleString()}`;
    }
    return `${symbol}${numericPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  
  const sourceRate = exchangeRates[sourceCurrency] || 1;
  const targetRate = exchangeRates[targetCurrency] || 1;
  const priceInEur = numericPrice / sourceRate;
  const convertedPrice = priceInEur * targetRate;
  
  const symbol = currencySymbols[targetCurrency] || targetCurrency + ' ';
  
  if (['JPY', 'KRW', 'VND', 'IDR', 'HUF'].includes(targetCurrency)) {
    return `${symbol}${Math.round(convertedPrice).toLocaleString()}`;
  }
  
  return `${symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
