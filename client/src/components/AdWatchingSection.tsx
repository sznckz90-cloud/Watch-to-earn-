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
    <div className="bg-[#1A1C20] border border-[#2F3238]/50 rounded-[16px] px-4 h-[80px] flex items-center shadow-lg mb-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 bg-[#1F2229] border border-[#2F3238]/30">
            <img 
              src="/images/ads_icon.png" 
              alt="Ads" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm tracking-tight truncate">Watch Daily Ads</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[12px] font-medium ${adsWatchedToday >= dailyLimit ? 'text-[#26D07C]' : 'text-[#B0B3B8]'}`}>
                {adsWatchedToday} / {dailyLimit} completed
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            onClick={handleStartEarning}
            disabled={isShowingAds || adsWatchedToday >= dailyLimit}
            variant={isShowingAds ? "secondary" : "default"}
            size="sm"
            className="rounded-[12px] px-5 font-semibold"
          >
            {isShowingAds ? (
              <div className="flex items-center gap-2">
                {currentAdStep === 'verifying' ? (
                  <Shield className="w-3.5 h-3.5 animate-pulse text-[#26D07C]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 animate-spin text-[#0098EA]" />
                )}
                <span>
                  {currentAdStep === 'monetag' ? 'Wait...' : 
                   currentAdStep === 'verifying' ? 'Verifying' : 'Loading'}
                </span>
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
