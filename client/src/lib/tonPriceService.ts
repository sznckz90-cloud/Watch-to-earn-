//  price fetching service - gets live market data
let cachedPrice: { price: number; lastUpdated: number } | null = null;
const CACHE_DURATION = 60000; // Cache for 60 seconds

export async function getTONPrice(): Promise<number> {
  const now = Date.now();
  
  // Return cached price if still valid
  if (cachedPrice && now - cachedPrice.lastUpdated < CACHE_DURATION) {
    return cachedPrice.price;
  }

  try {
    // Fetch from CoinGecko free API (no key required)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd',
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch  price');
    
    const data = await response.json();
    const price = data['the-open-network']?.usd;
    
    if (!price || typeof price !== 'number') {
      throw new Error('Invalid price data');
    }

    // Cache the price
    cachedPrice = { price, lastUpdated: now };
    return price;
  } catch (error) {
    console.error('Error fetching  price:', error);
    
    // Fallback to cached price if available, even if expired
    if (cachedPrice) {
      return cachedPrice.price;
    }
    
    // Fallback to a reasonable default (will update when API works)
    return 5.5; // Conservative default
  }
}

export function calculateConversions(tonPriceTON: number) {
  const Hrum_PER_ = 10000;
  
  return {
    tonPriceTON: Number(tonPrice.toFixed(4)),
    padPerDollar: Hrum_PER_TON,
    dollarPerTon: Number((tonPrice).toFixed(4)),
    tonPerDollar: Number((1 / tonPrice).toFixed(8)),
    padPerTon: Number((tonPrice * Hrum_PER_).toFixed(0)),
    tonPerPad: Number((1 / (tonPrice * Hrum_PER_)).toFixed(12)),
  };
}
