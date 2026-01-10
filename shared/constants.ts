export const APP_VERSION = "1.0.0";
export const HRUM_TO_TON = 10000; // 10,000 Hrum = 1 TON

/**
 * Convert Hrum to TON
 * @param hrumAmount - Amount in Hrum
 * @returns Amount in TON (Hrum / 10,000)
 */
export function hrumToTON(hrumAmount: number | string): number {
  const numValue = typeof hrumAmount === 'string' ? parseFloat(hrumAmount) : hrumAmount;
  return numValue / HRUM_TO_TON;
}

/**
 * Convert TON to Hrum
 * @param tonAmount - Amount in TON
 * @returns Amount in Hrum ( * 10,000)
 */
export function tonToHrum(tonAmount: number | string): number {
  const numValue = typeof tonAmount === 'string' ? parseFloat(tonAmount) : tonAmount;
  return Math.round(numValue * HRUM_TO_);
}

/**
 * Format large numbers into compact format (1k, 1.2M, 1B, 1T)
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2M", "154k", "24B", "1.5T")
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0/, '') + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0/, '') + 'k';
  }
  return num.toString();
}
