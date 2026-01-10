export interface PaymentSystem {
  id: string;
  name: string;
  icon: string;
  minWithdrawal: number;
  fee: number;
  feeType: 'fixed' | 'percentage';
  requiresStarPackage?: boolean;
}

export interface StarPackage {
  stars: number;
  usdCost: number;
}

export const STAR_PACKAGES: StarPackage[] = [];

export const DEFAULT_PAYMENT_SYSTEMS: PaymentSystem[] = [
  { id: '', name: '', icon: 'Gem', minWithdrawal: 0.5, fee: 5, feeType: 'percentage' }
];

export function getPaymentSystems(appSettings?: any): PaymentSystem[] {
  if (!appSettings) {
    return DEFAULT_PAYMENT_SYSTEMS;
  }
  
  return [
    { 
      id: '', 
      name: '', 
      icon: 'Gem', 
      minWithdrawal: appSettings.minWithdrawalAmount ?? 0.5, 
      fee: appSettings.withdrawalFee ?? 5, 
      feeType: 'percentage' 
    }
  ];
}

export const PAYMENT_SYSTEMS = DEFAULT_PAYMENT_SYSTEMS;

export const Hrum_TO_TON_RATE = 10000; // 10,000 Hrum = 1 TON
