import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Languages } from "lucide-react";
import { useLocation } from "wouter";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  const [, setLocation] = useLocation();
  const { isAdmin } = useAdmin();
  const { setLanguage, t } = useLanguage();

  const tonBalance = parseFloat(user?.tonBalance || "0");
  const hrumBalance = parseFloat(user?.balance || "0");

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(1) + 'M';
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(1) + 'k';
    }
    return Math.round(balance).toLocaleString();
  };

  const telegramPhotoUrl = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
  const photoUrl = telegramPhotoUrl || user?.profileImageUrl || user?.profileUrl || null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black/95 border-b border-white/5 pt-[max(env(safe-area-inset-top),20px)]">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Profile Photo */}
          <div 
            className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-white/10 bg-[#1a1a1a] ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => setLocation("/profile")}
          >
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-[#D1D5DB]" />
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 h-8 rounded-lg border border-white/5 min-w-[75px] shadow-sm">
            <span className="text-sm text-white font-bold tracking-tight">
              {formatBalance(hrumBalance)}
            </span>
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/hrum-logo.jpg" 
                alt="Hrum" 
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 h-8 rounded-lg border border-white/5 min-w-[75px] shadow-sm">
            <span className="text-sm text-white font-bold tracking-tight">
              {tonBalance.toFixed(2)}
            </span>
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/ton.png" 
                alt="TON" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#1a1a1a] px-3 h-8 rounded-lg border border-white/5 flex items-center justify-center shadow-sm">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mr-1.5">PLAN:</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${user?.planStatus === 'Premium' ? 'text-yellow-400' : 'text-blue-400'}`}>
              {user?.planStatus || 'Trial'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
