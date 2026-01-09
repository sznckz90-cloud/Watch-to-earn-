import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { hrumToTON } from "@shared/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values - displays Hrum amount in pure numeric format
 * No TON-style formatting - Hrum is always an integer value
 * Examples: 1000 → "1,000 Hrum", 500000 → "500,000 Hrum"
 */
export function formatCurrency(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  // Hrum is always an integer - no TON conversion
  const hrumValue = Math.round(numValue);
  
  const symbol = includeSymbol ? ' Hrum' : '';
  return `${hrumValue.toLocaleString()}${symbol}`;
}

/**
 * Format large Hrum numbers with compact notation (K, M, B, T)
 * Handles overflow and prevents NaN/Infinity display
 * Examples: 1000 → "1K", 1000000 → "1M", 1000000000 → "1B"
 */
export function formatLargeHrum(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  const absValue = Math.abs(numValue);
  const symbol = includeSymbol ? ' Hrum' : '';
  const sign = numValue < 0 ? '-' : '';
  
  if (absValue >= 1000000000000) {
    return `${sign}${(absValue / 1000000000000).toFixed(1)}T${symbol}`;
  }
  if (absValue >= 1000000000) {
    return `${sign}${(absValue / 1000000000).toFixed(1)}B${symbol}`;
  }
  if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toFixed(1)}M${symbol}`;
  }
  if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(1)}K${symbol}`;
  }
  
  return `${sign}${Math.round(absValue).toLocaleString()}${symbol}`;
}

/**
 * Format task rewards - displays Hrum amount in pure numeric format
 * No TON-style formatting - Hrum is always an integer value
 * Examples: 1000 → "1,000 Hrum", 500 → "500 Hrum"
 */
export function formatTaskReward(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return includeSymbol ? '0 Hrum' : '0';
  }
  
  // Hrum is always an integer - no TON conversion
  const hrumValue = Math.round(numValue);
  
  const symbol = includeSymbol ? ' Hrum' : '';
  return `${hrumValue.toLocaleString()}${symbol}`;
}

/**
 * Convert Hrum to TON
 * 10,000 Hrum = 1 TON
 */
export function formatHrumtoTON(hrumAmount: number | string): string {
  const ton = hrumToTON(hrumAmount);
  return ton.toFixed(2);
}

/**
 * Format TON values without converting to PAD
 * For admin panel and withdrawal displays
 * Examples: 0.0003 → "0.0003 TON", 1.5 → "1.5 TON"
 */
export function formatTON(value: string | number, includeSymbol: boolean = true): string {
  const numValue = parseFloat(typeof value === 'string' ? value : value.toString());
  
  if (isNaN(numValue)) {
    return includeSymbol ? '0 TON' : '0';
  }
  
  const symbol = includeSymbol ? ' TON' : '';
  return `${numValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })}${symbol}`;
}

/**
 * Shorten wallet address for display
 * Examples: 
 * - UQCW9LwFkPRsL...PvJ (TON addresses)
 * - 0x1234...5678 (USDT addresses)
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
