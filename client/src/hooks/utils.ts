import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Hrum_TO_TON, padTo } from "@shared/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values - displays Hrum directly
 * Examples: 3300 → "3,300 Hrum", 2000 → "2,000 Hrum"
 */
export function formatCurrency(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  const symbol = includeSymbol ? ' Hrum' : '';
  return `${Math.round(numValue).toLocaleString()}${symbol}`;
}

/**
 * Format task rewards - displays Hrum directly
 * Examples: 3300 → "3,300 Hrum", 2000 → "2,000 Hrum"
 */
export function formatTaskReward(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  const symbol = includeSymbol ? ' Hrum' : '';
  return `${Math.round(numValue).toLocaleString()}${symbol}`;
}

/**
 * Convert Hrum to TON
 * 100,000 Hrum = $1.00
 */
export function formatHrumtoTON(padAmount: number | string): string {
  const usd = padToTON(padAmount);
  return usd.toFixed(2);
}

/**
 * Format  values for display
 * Examples: 0.35 → "TON0.35", 1.5 → "$1.50"
 */
export function formatTON(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue)) {
    return includeSymbol ? 'TON0.00' : '0.00';
  }
  
  const formatted = numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return includeSymbol ? `TON${formatted}` : formatted;
}
