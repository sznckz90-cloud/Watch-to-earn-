
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  user: any;
  stats: any;
}

export default function BalanceCard({ user, stats }: BalanceCardProps) {
  return (
    <div className="bg-[#1A1C20] border border-[#2F3238]/50 p-6 rounded-[20px] mt-4 text-center shadow-xl">
      <div className="text-[#B0B3B8] text-xs font-medium mb-2 uppercase tracking-wider">Available Balance</div>
      <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2" data-testid="text-user-balance">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img src="/images/hrum-logo.jpg" alt="Hrum" className="w-full h-full object-cover rounded-sm" />
        </div>
        {Math.floor(parseFloat(user?.balance || "0")).toLocaleString()} <span className="text-[#F5C542]">Hrum</span>
      </div>
      <div className="text-sm text-[#B0B3B8] flex items-center justify-center gap-1">
        ≈ 
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover rounded-full" />
        </div>
        <span className="text-[#0098EA] font-semibold">{parseFloat(user?.tonBalance || "0").toFixed(4)} TON</span>
      </div>
    </div>
  );
}
