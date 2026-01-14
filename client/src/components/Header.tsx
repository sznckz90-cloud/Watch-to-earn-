import { useQuery } from "@tanstack/react-query";
import { DiamondIcon } from "@/components/DiamondIcon";
import { Bug, Settings, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";
import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { SettingsPopup } from "./SettingsPopup";

export default function Header() {
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  const [, setLocation] = useLocation();
  const { isAdmin } = useAdmin();
  const [showSettings, setShowSettings] = useState(false);

  const tonBalance = parseFloat(user?.tonBalance || "0");
  const hrumBalance = parseFloat(user?.balance || "0");
  const bugBalance = parseFloat(user?.bugBalance || "0");

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
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#0E0F12] border-b border-[#2F3238]/50 pt-[max(env(safe-area-inset-top),20px)]">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Profile Photo */}
          <div 
            className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-[#2F3238]/50 bg-[#1F2229] ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => isAdmin && setLocation("/admin")}
          >
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-[#7A7D85]" />
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#1F2229] px-3 h-8 rounded-lg border border-[#2F3238]/30 min-w-[75px] shadow-sm">
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

          <div className="flex items-center gap-2 bg-[#1F2229] px-3 h-8 rounded-lg border border-[#2F3238]/30 min-w-[75px] shadow-sm">
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
      </div>
    </div>
  );
}
