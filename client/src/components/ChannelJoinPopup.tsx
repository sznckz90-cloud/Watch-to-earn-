import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface MembershipStatus {
  channelMember: boolean;
  groupMember: boolean;
  moneyCatsMember: boolean;
  channelUrl: string;
  groupUrl: string;
  moneyCatsUrl: string;
  channelName: string;
  groupName: string;
  moneyCatsName: string;
}

interface ChannelJoinPopupProps {
  telegramId: string;
  onVerified: () => void;
}

export default function ChannelJoinPopup({ telegramId, onVerified }: ChannelJoinPopupProps) {
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const checkMembership = async (isInitialCheck = false) => {
    if (isChecking) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      const headers: Record<string, string> = {};
      const tg = window.Telegram?.WebApp;
      if (tg?.initData) {
        headers['x-telegram-data'] = tg.initData;
      }
      
      // Use the specific membership check endpoint that verifies with Telegram
      const response = await fetch(`/api/membership/check?t=${Date.now()}`, { headers });
      const data = await response.json();
      
      if (data.success && data.isVerified) {
        onVerified();
        // Force refresh user data to ensure frontend state is in sync
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        return;
      }
      
      if (data.success) {
        setMembershipStatus({
          channelMember: data.channelMember || false,
          groupMember: data.groupMember || false,
          moneyCatsMember: data.moneyCatsMember || false,
          channelUrl: data.channelUrl || "https://t.me/MoneyAdz",
          groupUrl: data.groupUrl || "https://t.me/+fahpWJGmJEowZGQ1",
          moneyCatsUrl: data.moneyCatsUrl || "https://t.me/MoneyCatsPromoCode",
          channelName: data.channelName || "Money adz",
          groupName: data.groupName || "Money adz community",
          moneyCatsName: data.moneyCatsName || "Money Cats Promo Code"
        });
        
        if (!data.channelMember || !data.groupMember || !data.moneyCatsMember) {
          if (!isInitialCheck) {
            setError("Please join all channels and the group first!");
          }
        }
      } else if (!isInitialCheck) {
        setError(data.message || "Failed to verify membership.");
      }
    } catch (err) {
      console.error("Membership check error:", err);
      if (!isInitialCheck) {
        setError("Failed to check membership. Please try again.");
      }
    } finally {
      setIsChecking(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    if (!hasInitialized) {
      checkMembership(true);
    }
  }, [telegramId, hasInitialized]);

  const openChannel = () => {
    const url = membershipStatus?.channelUrl || "https://t.me/MoneyAdz";
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const openGroup = () => {
    const url = membershipStatus?.groupUrl || "https://t.me/+fahpWJGmJEowZGQ1";
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const openMoneyCats = () => {
    const url = membershipStatus?.moneyCatsUrl || "https://t.me/MoneyCatsPromoCode";
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleContinue = () => {
    checkMembership(false);
  };

  const allJoined = membershipStatus?.channelMember && membershipStatus?.groupMember && membershipStatus?.moneyCatsMember;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#050505] border border-[#B9FF66]/20 rounded-2xl p-6 relative">
        
        <div className="text-center">
          {error && (
            <div className="mb-4 py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-[10px]">{error}</p>
            </div>
          )}

          {/* Channel Join Button */}
          <button
            onClick={openChannel}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all mb-2.5 ${
              membershipStatus?.channelMember
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-white/5 border-white/10 hover:border-blue-500/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-xs tracking-tight">Join Channel</p>
              </div>
            </div>
            {membershipStatus?.channelMember ? (
              <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">JOIN</span>
            )}
          </button>

          {/* Money Cats Channel Button */}
          <button
            onClick={openMoneyCats}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all mb-2.5 ${
              membershipStatus?.moneyCatsMember
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-white/5 border-white/10 hover:border-blue-500/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-xs tracking-tight">Join Money Cats</p>
              </div>
            </div>
            {membershipStatus?.moneyCatsMember ? (
              <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">JOIN</span>
            )}
          </button>

          {/* Group Join Button */}
          <button
            onClick={openGroup}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all mb-4 ${
              membershipStatus?.groupMember
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-white/5 border-white/10 hover:border-blue-500/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-xs tracking-tight">Join Group</p>
              </div>
            </div>
            {membershipStatus?.groupMember ? (
              <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">JOIN</span>
            )}
          </button>

          <button
            onClick={handleContinue}
            disabled={isChecking}
            className="w-full py-3 px-4 bg-blue-500 text-white font-black rounded-xl transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] uppercase tracking-widest shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
          >
            {isChecking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </span>
            ) : (
              "I've Joined All"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
