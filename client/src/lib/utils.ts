import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { hrumTo } from "@shared/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values - displays Hrum amount in pure numeric format
 * Hrum is always an integer value
 * Examples: 1000 -> "1,000 Hrum", 500000 -> "500,000 Hrum"
 */
export function formatCurrency(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  const hrumValue = Math.round(numValue);
  const symbol = includeSymbol ? ' Hrum' : '';
  return `${hrumValue.toLocaleString()}${symbol}`;
}

/**
 * Format large Hrum numbers with compact notation (K, M, B, T)
 */
export function formatLargeHrum(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  const absValue = Math.abs(numValue);
  const symbol = includeSymbol ? ' Hrum' : '';
  const sign = numValue < 0 ? '-' : '';
  
  if (absValue >= 1000000000000) return `${sign}${(absValue / 1000000000000).toFixed(1)}T${symbol}`;
  if (absValue >= 1000000000) return `${sign}${(absValue / 1000000000).toFixed(1)}B${symbol}`;
  if (absValue >= 1000000) return `${sign}${(absValue / 1000000).toFixed(1)}M${symbol}`;
  if (absValue >= 1000) return `${sign}${(absValue / 1000).toFixed(1)}K${symbol}`;
  
  return `${sign}${Math.round(absValue).toLocaleString()}${symbol}`;
}

/**
 * Convert Hrum to TON
 * 10,000 Hrum = 1 TON
 */
export function formatHrumto$(hrumAmount: number | string): string {
  const ton = hrumTo$(hrumAmount);
  return ton.toFixed(2);
}

/**
 * Format $values
 */
export function format$(value: string | number | undefined | null, includeSymbol: boolean = true): string {
  if (value === undefined || value === null) return includeSymbol ? '0 TON' : '0';
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue) || !isFinite(numValue)) return includeSymbol ? '0 TON' : '0';
  
  const symbol = includeSymbol ? ' TON' : '';
  
  let result;
  const parts = numValue.toString().split('.');
  if (!parts[1]) {
    result = numValue.toString(); // "1"
  } else {
    // If it has decimals, we show up to 4 decimals for crypto precision
    result = numValue.toFixed(4).replace(/\.?0+$/, "");
    if (result === "") result = "0";
  }

  return `${result}${symbol}`;
}

/**
 * Shorten wallet address for display
 * Examples: 
 * - UQCW9LwFkPRsL...PvJ ( addresses)
 * - 0x1234...5678 (T addresses)
 */
export function shortenAddress(address: string, startChars: number = 13, endChars: number = 3): string {
  if (!address || typeof address !== 'string') {
    return '';
  }
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Canonicalize Telegram username - strips all leading @ symbols and whitespace
 * Returns clean username for storage and API submission
 * Examples: "@@username" -> "username", "@user" -> "user", "user" -> "user"
 */
export function canonicalizeTelegramUsername(value: string): string {
  return value?.trim().replace(/^@+/, '').replace(/\s+/g, '') ?? '';
}

/**
 * Format Telegram username for display - adds single @ prefix
 * Examples: "username" -> "@username", "" -> ""
 */
export function formatTelegramUsername(value: string): string {
  return value ? `@${value}` : '';
}
