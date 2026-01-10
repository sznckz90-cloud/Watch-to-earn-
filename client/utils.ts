import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values - converts  to Hrum (multiply by 100000)
 * Examples: 0.00033 → "33 Hrum", 0.0002 → "20 Hrum"
 */
export function formatCurrency(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  // Convert  to Hrum (multiply by 100000)
  const padValue = Math.round(numValue * 100000);
  
  const symbol = includeSymbol ? ' Hrum' : '';
  return `${padValue.toLocaleString()}${symbol}`;
}
