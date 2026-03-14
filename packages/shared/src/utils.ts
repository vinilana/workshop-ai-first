import { v4 as uuidv4 } from 'uuid';

export function generateId(prefix: string): string {
  const uuid = uuidv4().replace(/-/g, '');
  return `${prefix}_${uuid}`;
}

export function formatCurrency(amount: number, currency: string): string {
  const locale = currency === 'brl' ? 'pt-BR' : 'en-US';
  const currencyCode = currency.toUpperCase();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
}

export function centsToDecimal(cents: number): number {
  return cents / 100;
}

export function decimalToCents(decimal: number): number {
  return Math.round(decimal * 100);
}
