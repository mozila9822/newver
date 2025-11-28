export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  AED: "AED",
  JPY: "¥",
};

export const CURRENCY_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.94,
  AED: 3.97,
  JPY: 162.5,
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export function convertCurrency(amountInEur: number, toCurrency: string): number {
  const rate = CURRENCY_RATES[toCurrency] || 1;
  return amountInEur * rate;
}

export function formatPrice(price: string, targetCurrency: string = "EUR"): string {
  const numericMatch = price.match(/[\d.,]+/);
  if (!numericMatch) return price;
  
  const numericValue = parseFloat(numericMatch[0].replace(/,/g, ""));
  if (isNaN(numericValue)) return price;
  
  const convertedValue = convertCurrency(numericValue, targetCurrency);
  const symbol = getCurrencySymbol(targetCurrency);
  
  if (targetCurrency === "JPY") {
    return `${symbol}${Math.round(convertedValue).toLocaleString()}`;
  }
  
  return `${symbol}${convertedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function formatPriceWithUnit(price: string, targetCurrency: string = "EUR", unit?: string): string {
  const formatted = formatPrice(price, targetCurrency);
  if (unit) {
    return `${formatted}/${unit}`;
  }
  return formatted;
}
