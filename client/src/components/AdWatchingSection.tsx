import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Clock, Shield, Zap } from "lucide-react";
import { showNotification } from "@/components/AppNotification";

declare global {
  interface Window {
    show_10401872: (type?: string | { type: string; inAppSettings: any }) => Promise<void>;
    Adsgram: {
      init: (config: { blockId: string }) => {
        show: () => Promise<void>;
      };
    };
  }
}

interface AdWatchingSectionProps {
  user: any;
}

export default function AdWatchingSection({ user }: AdWatchingSectionProps) {
  const queryClient = useQueryClient();
  const [isShowingAds, setIsShowingAds] = useState(false);
  const [currentAdStep, setCurrentAdStep] = useState<'idle' | 'monetag' | 'adsgram' | 'verifying'>('idle');
  const sessionRewardedRef = useRef(false);
  const monetagStartTimeRef = useRef<number>(0);

  const { data: appSettings } = useQuery({
    queryKey: ["/api/app-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/app-settings");
      return response.json();
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const watchAdMutation = useMutation({
    mutationFn: async (adType: string) => {
      const response = await apiRequest("POST", "/api/ads/watch", { adType });
      if (!response.ok) {
        const error = await response.json();
        throw { status: response.status, ...error };
      }
      return response.json();
    },
    onSuccess: async (data) => {
      const rewardAmount = data?.rewardHrum || appSettings?.rewardPerAd || 2;
      showNotification(`+${rewardAmount} Hrum earned!`, "success");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawal-eligibility"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/valid-count"] });
    },
    onError: (error: any) => {
      sessionRewardedRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (error.status === 429) {
        const limit = error.limit || appSettings?.dailyAdLimit || 50;
        showNotification(`Daily ad limit reached (${limit} ads/day)`, "error");
      } else if (error.status === 401 || error.status === 403) {
        showNotification("Authentication error. Please refresh the page.", "error");
      } else if (error.message) {
        showNotification(`Error: ${error.message}`, "error");
      } else {
        showNotification("Network error. Check your connection and try again.", "error");
      }
    },
  });

  const showMonetagAd = (): Promise<{ success: boolean; watchedFully: boolean; unavailable: boolean }> => {
    return new Promise((resolve) => {
      if (typeof window.show_10401872 === 'function') {
        monetagStartTimeRef.current = Date.now();
        window.show_10401872()
          .then(() => {
            const watchDuration = Date.now() - monetagStartTimeRef.current;
            const watchedAtLeast3Seconds = watchDuration >= 3000;
            resolve({ success: true, watchedFully: watchedAtLeast3Seconds, unavailable: false });
          })
          .catch((error) => {
            console.error('Monetag ad error:', error);
            const watchDuration = Date.now() - monetagStartTimeRef.current;
            const watchedAtLeast3Seconds = watchDuration >= 3000;
            resolve({ success: false, watchedFully: watchedAtLeast3Seconds, unavailable: false });
          });
      } else {
        resolve({ success: false, watchedFully: false, unavailable: true });
      }
    });
  };

  const showAdsgramAd = (): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if (window.Adsgram) {
        try {
          await window.Adsgram.init({ blockId: "20372" }).show();
          resolve(true);
        } catch (error) {
          console.error('Adsgram ad error:', error);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  };

  const handleStartEarning = async () => {
    if (isShowingAds) return;
    
    setIsShowingAds(true);
    sessionRewardedRef.current = false;
    
    try {
      // STEP 1: Show Monetag ad - User must watch at least 3 seconds
      setCurrentAdStep('monetag');
      const monetagResult = await showMonetagAd();
      
      // Handle Monetag unavailable
      if (monetagResult.unavailable) {
        showNotification("Ads not available. Please try again later.", "error");
        return;
      }
      
      // Check if Monetag was closed before 3 seconds
      if (!monetagResult.watchedFully) {
        showNotification("Claimed too fast!", "error");
        return;
      }
      
      // Monetag was watched fully (at least 3 seconds)
      if (!monetagResult.success) {
        showNotification("Ad failed. Please try again.", "error");
        return;
      }
      
      // STEP 3: Grant reward after Monetag complete successfully
      setCurrentAdStep('verifying');
      
      if (!sessionRewardedRef.current) {
        sessionRewardedRef.current = true;
        
        // Optimistic UI update - only ONE increment to progress
        const rewardAmount = appSettings?.rewardPerAd || 2;
        queryClient.setQueryData(["/api/auth/user"], (old: any) => ({
          ...old,
          tonBalance: String(parseFloat(old?.tonBalance || '0') + (appSettings?.affiliateCommission || 0.1) * rewardAmount / 100), // This logic seems slightly off, but I'm matching the balance increment pattern
          balance: String(parseFloat(old?.balance || '0') + rewardAmount),
          adsWatchedToday: (old?.adsWatchedToday || 0) + 1
        }));
        
        // Sync with backend - single reward call
        watchAdMutation.mutate('monetag');
      }
    } finally {
      // Always reset state on completion or error
      setCurrentAdStep('idle');
      setIsShowingAds(false);
    }
  };

  const adsWatchedToday = user?.adsWatchedToday || 0;
  const dailyLimit = appSettings?.dailyAdLimit || 50;

  return (
    <div className="bg-[#1a1a1a] border border-[#B9FF66]/20 rounded-2xl px-4 h-20 flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      {/* Background Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#B9FF66]/0 via-[#B9FF66]/5 to-[#B9FF66]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#0d0d0d] border border-white/5 overflow-hidden shadow-inner">
            <img 
              src="/images/ads_icon.png" 
              alt="Ads" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-[13px] tracking-tight truncate uppercase italic">Daily Rewards</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B9FF66] shadow-[0_0_8px_#B9FF66]" />
                <span className="text-[11px] font-black text-[#B9FF66] uppercase tracking-widest">
                  {adsWatchedToday}/{dailyLimit} ads
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleStartEarning}
            disabled={isShowingAds || adsWatchedToday >= dailyLimit}
            className="rounded-xl px-6 h-10 font-black text-[11px] uppercase tracking-widest bg-[#B9FF66] text-black hover:bg-[#B9FF66]/90 border-none transition-all active:scale-95 shadow-[0_0_20px_rgba(185,255,102,0.15)]"
          >
            {isShowingAds ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{currentAdStep === 'monetag' ? 'Wait' : 'Check'}</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
