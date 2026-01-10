import { useQuery } from "@tanstack/react-query";
import { DiamondIcon } from "@/components/DiamondIcon";
import { Bug, Settings } from "lucide-react";
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

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1A1A1A] pt-[env(safe-area-inset-top,8px)]">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 h-8 rounded-lg min-w-[80px] max-w-[110px]">
            <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/hrum-logo.jpg" 
                alt="Hrum" 
                className="w-full h-full object-cover scale-150"
                style={{ objectPosition: 'center' }}
              />
            </div>
            <span className="text-sm text-white font-semibold truncate">
              {formatBalance(hrumBalance)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 h-8 rounded-lg min-w-[80px]">
            <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/ton.png" 
                alt="TON" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-white font-semibold">
              {tonBalance.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
