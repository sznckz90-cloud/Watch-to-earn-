import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import AdWatchingSection from "@/components/AdWatchingSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdFlow } from "@/hooks/useAdFlow";
import { useLocation } from "wouter";
import { SettingsPopup } from "@/components/SettingsPopup";
import { Award, Wallet, RefreshCw, Flame, Ticket, Info, User as UserIcon, Clock, Loader2, Gift, Rocket, X, Bug, DollarSign, Coins, Send, Users, Check, ExternalLink, Plus, CalendarCheck, Bell, Star, Play, Sparkles, Zap, Settings, Film, Tv, Target, LayoutDashboard, ClipboardList, UserPlus, Share2, Copy, HeartHandshake } from "lucide-react";
import { DiamondIcon } from "@/components/DiamondIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { showNotification } from "@/components/AppNotification";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Unified Task Interface
interface UnifiedTask {
  id: string;
  type: 'advertiser';
  taskType: string;
  title: string;
  link: string | null;
  rewardPAD: number;
  rewardBUG?: number;
  rewardType: string;
  isAdminTask: boolean;
  isAdvertiserTask?: boolean;
  priority: number;
}

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

interface User {
  id?: string;
  telegramId?: string;
  balance?: string;
  usdBalance?: string;
  bugBalance?: string;
  lastStreakDate?: string;
  username?: string;
  firstName?: string;
  telegramUsername?: string;
  referralCode?: string;
  [key: string]: any;
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isConverting, setIsConverting] = useState(false);
  const [isClaimingStreak, setIsClaimingStreak] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>("");
  
  const [promoPopupOpen, setPromoPopupOpen] = useState(false);
  const [convertPopupOpen, setConvertPopupOpen] = useState(false);
  const [boosterPopupOpen, setBoosterPopupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedConvertType, setSelectedConvertType] = useState<'USD' | 'TON' | 'BUG'>('USD');
  const [convertAmount, setConvertAmount] = useState<string>("");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  
  const [shareWithFriendsStep, setShareWithFriendsStep] = useState<'idle' | 'sharing' | 'countdown' | 'ready' | 'claiming'>('idle');
  const [dailyCheckinStep, setDailyCheckinStep] = useState<'idle' | 'ads' | 'countdown' | 'ready' | 'claiming'>('idle');
  const [checkForUpdatesStep, setCheckForUpdatesStep] = useState<'idle' | 'opened' | 'countdown' | 'ready' | 'claiming'>('idle');
  const [checkForUpdatesCountdown, setCheckForUpdatesCountdown] = useState(3);

  const { runAdFlow } = useAdFlow();

  const { data: leaderboardData } = useQuery<{
    userEarnerRank?: { rank: number; totalEarnings: string } | null;
  }>({
    queryKey: ['/api/leaderboard/monthly'],
    retry: false,
  });

  const { data: appSettings } = useQuery<any>({
    queryKey: ['/api/app-settings'],
    retry: false,
  });

  const { data: unifiedTasksData, isLoading: isLoadingTasks } = useQuery<{
    success: boolean;
    tasks: UnifiedTask[];
    completedTaskIds: string[];
    referralCode?: string;
  }>({
    queryKey: ['/api/tasks/home/unified'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/home/unified', { credentials: 'include' });
      if (!res.ok) return { success: true, tasks: [], completedTaskIds: [] };
      return res.json();
    },
    retry: false,
  });

  const { data: missionStatus } = useQuery<any>({
    queryKey: ['/api/missions/status'],
    retry: false,
  });

  const { data: userData } = useQuery<{ referralCode?: string }>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 30000,
  });

  useEffect(() => {
    if (unifiedTasksData?.completedTaskIds) {
      setCompletedTasks(new Set(unifiedTasksData.completedTaskIds));
    } else {
      setCompletedTasks(new Set());
    }
  }, [unifiedTasksData]);

  const currentTask = unifiedTasksData?.tasks?.[0] || null;

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const typedUser = user as User;
      
      if (typedUser?.id) {
        const claimedTimestamp = localStorage.getItem(`streak_claimed_${typedUser.id}`);
        if (claimedTimestamp) {
          const claimedDate = new Date(claimedTimestamp);
          const nextClaimTime = new Date(claimedDate.getTime() + 5 * 60 * 1000);
          
          if (now.getTime() < nextClaimTime.getTime()) {
            setHasClaimed(true);
            const diff = nextClaimTime.getTime() - now.getTime();
            const minutes = Math.floor(diff / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeUntilNextClaim(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            return;
          } else {
            setHasClaimed(false);
            localStorage.removeItem(`streak_claimed_${typedUser.id}`);
          }
        }
      }
      
      if ((user as User)?.lastStreakDate) {
        const lastClaim = new Date((user as User).lastStreakDate!);
        const minutesSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60);
        
        if (minutesSinceLastClaim < 5) {
          setHasClaimed(true);
          const nextClaimTime = new Date(lastClaim.getTime() + 5 * 60 * 1000);
          const diff = nextClaimTime.getTime() - now.getTime();
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeUntilNextClaim(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          return;
        }
      }
      
      setHasClaimed(false);
      setTimeUntilNextClaim("Available now");
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [(user as User)?.lastStreakDate, (user as User)?.id]);

  const convertMutation = useMutation({
    mutationFn: async ({ amount, convertTo }: { amount: number; convertTo: string }) => {
      const res = await fetch("/api/convert-to-ton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hrumAmount: amount, convertTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to convert");
      }
      return data;
    },
    onSuccess: async () => {
      showNotification("Convert successful.", "success");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      setConvertPopupOpen(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const claimStreakMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/streak/claim");
      if (!response.ok) {
        const error = await response.json();
        const errorObj = new Error(error.message || 'Failed to claim streak');
        (errorObj as any).isAlreadyClaimed = error.message === "Please wait 5 minutes before claiming again!";
        throw errorObj;
      }
      return response.json();
    },
    onSuccess: (data) => {
      setHasClaimed(true);
      const typedUser = user as User;
      if (typedUser?.id) {
        localStorage.setItem(`streak_claimed_${typedUser.id}`, new Date().toISOString());
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      const rewardAmount = parseFloat(data.rewardEarned || '0');
      if (rewardAmount > 0) {
        const earnedHrum = Math.round(rewardAmount);
        showNotification(`You've claimed +${earnedHrum} Hrum!`, "success");
      } else {
        showNotification("You've claimed your streak bonus!", "success");
      }
    },
    onError: (error: any) => {
      const notificationType = error.isAlreadyClaimed ? "info" : "error";
      showNotification(error.message || "Failed to claim streak", notificationType);
      if (error.isAlreadyClaimed) {
        setHasClaimed(true);
        const typedUser = user as User;
        if (typedUser?.id) {
          localStorage.setItem(`streak_claimed_${typedUser.id}`, new Date().toISOString());
        }
      }
    },
    onSettled: () => {
      setIsClaimingStreak(false);
    },
  });

  const redeemPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/promo-codes/redeem", { code });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid promo code");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      setPromoCode("");
      setPromoPopupOpen(false);
      setIsApplyingPromo(false);
      showNotification(data.message || "Promo applied successfully!", "success");
    },
    onError: (error: any) => {
      const message = error.message || "Invalid promo code";
      showNotification(message, "error");
      setIsApplyingPromo(false);
    },
  });

  const [clickedTasks, setClickedTasks] = useState<Set<string>>(new Set());

  const advertiserTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/advertiser-tasks/${taskId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to start task');
      return data;
    },
    onSuccess: async (data, taskId) => {
      setClickedTasks(prev => new Set(prev).add(taskId));
      showNotification("Task started! Click the claim button to earn your reward.", "info");
    },
    onError: (error: any) => {
      showNotification(error.message || 'Failed to start task', 'error');
    },
  });

  const claimAdvertiserTaskMutation = useMutation({
    mutationFn: async ({ taskId, taskType, link }: { taskId: string, taskType: string, link: string | null }) => {
      // Step 1: Real-time verification for channel tasks
      if (taskType === 'channel' && link) {
        const username = link.replace('https://t.me/', '').split('?')[0];
        const currentTelegramData = (window as any).Telegram?.WebApp?.initData || '';
        
        const resVerify = await fetch('/api/tasks/verify/channel', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-telegram-data': currentTelegramData || ''
          },
          body: JSON.stringify({ channelId: `@${username}` }),
          credentials: 'include',
        });
        
        const verifyData = await resVerify.json();
        if (!resVerify.ok || !verifyData.isJoined) {
          throw new Error('Please join the channel to complete this task.');
        }
      }

      // Step 2: Claim reward
      const res = await fetch(`/api/advertiser-tasks/${taskId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to claim reward');
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      await queryClient.refetchQueries({ queryKey: ['/api/tasks/home/unified'] });
      const hrumReward = Number(data.reward ?? 0);
      showNotification(`+${hrumReward.toLocaleString()} Hrum earned!`, 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Failed to claim reward', 'error');
    },
  });

  const handleUnifiedTask = (task: UnifiedTask) => {
    if (!task) return;
    
    if (clickedTasks.has(task.id)) {
      claimAdvertiserTaskMutation.mutate({ taskId: task.id, taskType: task.taskType, link: task.link });
      return;
    }

    if (task.link) {
      window.open(task.link, '_blank');
      advertiserTaskMutation.mutate(task.id);
    } else {
      advertiserTaskMutation.mutate(task.id);
    }
  };

  const getTaskIcon = (task: UnifiedTask) => {
    return task.taskType === 'channel' ? <Send className="w-4 h-4" /> : 
           task.taskType === 'bot' ? <ExternalLink className="w-4 h-4" /> :
           <ExternalLink className="w-4 h-4" />;
  };

  const isTaskPending = advertiserTaskMutation.isPending;

  const showAdsgramAd = (): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if ((window as any).Adsgram) {
        try {
          await (window as any).Adsgram.init({ blockId: "int-20373" }).show();
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

  const showMonetagAd = (): Promise<{ success: boolean; unavailable: boolean }> => {
    return new Promise((resolve) => {
      if (typeof window.show_10401872 === 'function') {
        window.show_10401872()
          .then(() => {
            resolve({ success: true, unavailable: false });
          })
          .catch((error) => {
            console.error('Monetag ad error:', error);
            resolve({ success: false, unavailable: false });
          });
      } else {
        resolve({ success: false, unavailable: true });
      }
    });
  };

  const showMonetagRewardedAd = (): Promise<{ success: boolean; unavailable: boolean }> => {
    return new Promise((resolve) => {
      console.log('🎬 Attempting to show Monetag rewarded ad...');
      if (typeof window.show_10401872 === 'function') {
        console.log('✅ Monetag SDK found, calling rewarded ad...');
        window.show_10401872()
          .then(() => {
            console.log('✅ Monetag rewarded ad completed successfully');
            resolve({ success: true, unavailable: false });
          })
          .catch((error) => {
            console.error('❌ Monetag rewarded ad error:', error);
            resolve({ success: false, unavailable: false });
          });
      } else {
        console.log('⚠️ Monetag SDK not available, skipping ad');
        resolve({ success: false, unavailable: true });
      }
    });
  };

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [adStartTime, setAdStartTime] = useState<number>(0);
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/referrals/stats'],
    retry: false,
    staleTime: 60000,
  });

  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'MoneyAdzbot';
  const referralLink = user?.referralCode 
    ? `https://t.me/${botUsername}?start=${user.referralCode}`
    : '';

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      showNotification('Link copied!', 'success');
    }
  };

  const [isSharing, setIsSharing] = useState(false);

  const shareReferralLink = async () => {
    if (!referralLink || isSharing) return;
    setIsSharing(true);
    
    try {
      const tgWebApp = (window as any).Telegram?.WebApp;
      
      // Native Telegram share: Use shareMessage() with prepared message from backend
      if (tgWebApp?.shareMessage) {
        try {
          // First, prepare the message on the backend
          const response = await fetch('/api/share/prepare-message', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          
          if (data.success && data.messageId) {
            // Use the native Telegram share dialog with prepared message
            tgWebApp.shareMessage(data.messageId, (success: boolean) => {
              if (success) {
                showNotification('Message shared successfully!', 'success');
              }
              setIsSharing(false);
            });
            return;
          } else if (data.fallbackUrl) {
            // Backend returned fallback URL
            tgWebApp.openTelegramLink(data.fallbackUrl);
            setIsSharing(false);
            return;
          }
        } catch (error) {
          console.error('Prepare message error:', error);
        }
      }
      
      // Fallback: Use Telegram's native share URL dialog
      const shareTitle = `💵 Get paid for completing tasks and watching ads.`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareTitle)}`;
      
      if (tgWebApp?.openTelegramLink) {
        tgWebApp.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
    
    setIsSharing(false);
  };

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
      queryClient.setQueryData(["/api/auth/user"], (old: any) => ({
        ...old,
        balance: data.newBalance,
        adsWatchedToday: data.adsWatchedToday
      }));
      
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings"] });
      
      showNotification(`You received ${data.rewardHrum || 1000} Hrum on your balance`, "success");
      setLoadingProvider(null);
    },
    onError: (error: any) => {
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
      setLoadingProvider(null);
    },
  });

  const handleWatchAd = async (providerId: string) => {
    if (loadingProvider) return;
    
    setLoadingProvider(providerId);
    const startTime = Date.now();
    setAdStartTime(startTime);
    
    const handleAdCompletion = () => {
      const watchDuration = Date.now() - startTime;
      if (watchDuration < 3000) {
        showNotification("Claiming too fast!", "error");
        setLoadingProvider(null);
        return;
      }
      watchAdMutation.mutate(providerId);
    };

    const handleAdError = (error?: any) => {
      showNotification("Ad failed to load. Please try again.", "error");
      setLoadingProvider(null);
    };
    
    try {
      switch (providerId) {
        case 'monetag':
          if (typeof (window as any).show_10013974 === 'function') {
            (window as any).show_10013974()
              .then(() => {
                handleAdCompletion();
              })
              .catch((error: any) => {
                console.error('❌ Monetag ad error:', error);
                handleAdError(error);
              });
          } else {
            showNotification("Monetag not available. Try again later.", "error");
            setLoadingProvider(null);
          }
          break;
          
        case 'adexora':
          if (typeof (window as any).showAdexora === 'function') {
            (window as any).showAdexora()
              .then(() => {
                handleAdCompletion();
              })
              .catch((error: any) => {
                console.error('❌ Adexora ad error:', error);
                handleAdError(error);
              });
          } else {
            showNotification("Adexora not available. Please open in Telegram app.", "error");
            setLoadingProvider(null);
          }
          break;
          
        case 'adextra':
          const adExtraContainer = document.getElementById('353c332d4f2440f448057df79cb605e5d3d64ef0');
          if (adExtraContainer) {
            adExtraContainer.style.display = 'flex';
            adExtraContainer.style.alignItems = 'center';
            adExtraContainer.style.justifyContent = 'center';
            
            let closeBtn = document.getElementById('adextra-close-btn') as HTMLButtonElement | null;
            let skipBtn = document.getElementById('adextra-skip-btn') as HTMLButtonElement | null;
            
            if (!closeBtn) {
              closeBtn = document.createElement('button');
              closeBtn.id = 'adextra-close-btn';
              closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;background:#4cd3ff;color:#000;border:none;padding:12px 24px;border-radius:8px;font-weight:bold;cursor:pointer;z-index:10000;display:none;';
              closeBtn.textContent = 'Claim Reward';
              adExtraContainer.appendChild(closeBtn);
            }
            
            if (!skipBtn) {
              skipBtn = document.createElement('button');
              skipBtn.id = 'adextra-skip-btn';
              skipBtn.style.cssText = 'position:absolute;top:20px;left:20px;background:#333;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;z-index:10000;';
              skipBtn.textContent = 'Close';
              adExtraContainer.appendChild(skipBtn);
            }
            
            closeBtn.style.display = 'none';
            skipBtn.style.display = 'block';
            let adLoadedAndViewed = false;
            let contentCheckInterval: NodeJS.Timeout | null = null;
            
            const checkForAdContent = () => {
              const hasContent = adExtraContainer.querySelector('iframe, img, video, div[class]');
              return hasContent !== null && adExtraContainer.childElementCount > 2;
            };
            
            contentCheckInterval = setInterval(() => {
              if (checkForAdContent()) {
                if (contentCheckInterval) clearInterval(contentCheckInterval);
                setTimeout(() => {
                  if (closeBtn) {
                    closeBtn.style.display = 'block';
                    adLoadedAndViewed = true;
                  }
                }, 5000);
              }
            }, 500);
            
            setTimeout(() => {
              if (contentCheckInterval) clearInterval(contentCheckInterval);
              if (!adLoadedAndViewed && closeBtn) {
                closeBtn.style.display = 'none';
              }
            }, 15000);
            
            const handleClaim = () => {
              if (contentCheckInterval) clearInterval(contentCheckInterval);
              adExtraContainer.style.display = 'none';
              if (closeBtn) closeBtn.style.display = 'none';
              if (skipBtn) skipBtn.style.display = 'none';
              closeBtn?.removeEventListener('click', handleClaim);
              skipBtn?.removeEventListener('click', handleSkip);
              
              if (adLoadedAndViewed) {
                handleAdCompletion();
              } else {
                showNotification("Ad did not load properly", "error");
                setLoadingProvider(null);
              }
            };
            
            const handleSkip = () => {
              if (contentCheckInterval) clearInterval(contentCheckInterval);
              adExtraContainer.style.display = 'none';
              if (closeBtn) closeBtn.style.display = 'none';
              if (skipBtn) skipBtn.style.display = 'none';
              closeBtn?.removeEventListener('click', handleClaim);
              skipBtn?.removeEventListener('click', handleSkip);
              showNotification("Ad skipped - no reward earned", "info");
              setLoadingProvider(null);
            };
            
            closeBtn.addEventListener('click', handleClaim);
            skipBtn.addEventListener('click', handleSkip);
          } else {
            showNotification("AdExtra not available. Try again later.", "error");
            setLoadingProvider(null);
          }
          break;
          
        case 'adsgram':
          if ((window as any).Adsgram) {
            try {
              await (window as any).Adsgram.init({ blockId: "int-18225" }).show();
              handleAdCompletion();
            } catch (error) {
              handleAdError(error);
            }
          } else {
            showNotification("Adsgram not available. Try again later.", "error");
            setLoadingProvider(null);
          }
          break;
          
        default:
          showNotification("Unknown ad provider", "error");
          setLoadingProvider(null);
      }
    } catch (error) {
      showNotification("Ad display failed. Please try again.", "error");
      setLoadingProvider(null);
    }
  };

  const adsWatchedToday = (user as any)?.adsWatchedToday || 0;
  const dailyLimit = appSettings?.dailyAdLimit || 50;

  const handleConvertClick = () => {
    setConvertPopupOpen(true);
  };

  const rawBalance = parseFloat((user as User)?.balance || "0");
  const padBalance = rawBalance < 1 ? Math.round(rawBalance * 10000000) : Math.round(rawBalance);
  const balanceUSD = parseFloat((user as User)?.usdBalance || "0");
  const balanceBUG = parseFloat((user as User)?.bugBalance || "0");
  
  const displayName = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.first_name || (user as User)?.firstName || (user as User)?.username || "User";
  const photoUrl = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;

  const handleConvertConfirm = async () => {
    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    const minimumConvertPAD = selectedConvertType === 'USD' 
      ? (appSettings?.minimumConvertPAD || 10000)
      : selectedConvertType === 'TON'
        ? (appSettings?.minimumConvertPadToTon || 10000)
        : (appSettings?.minimumConvertPadToBug || 1000);
    
    if (amount < minimumConvertPAD) {
      showNotification(`Minimum ${minimumConvertPAD.toLocaleString()} PAD required.`, "error");
      return;
    }

    if (padBalance < amount) {
      showNotification("Insufficient PAD balance", "error");
      return;
    }

    if (isConverting || convertMutation.isPending) return;
    
    setIsConverting(true);
    console.log('💱 Convert started, showing AdsGram ad first...');
    
    try {
      // Then show Monetag rewarded ad
      console.log('🎬 Proceeding with Monetag rewarded...');
      const monetagResult = await showMonetagRewardedAd();
      
      if (monetagResult.unavailable) {
        // If Monetag unavailable, proceed
        console.log('⚠️ Monetag unavailable, proceeding with convert');
        convertMutation.mutate({ amount, convertTo: selectedConvertType });
        return;
      }
      
      if (!monetagResult.success) {
        showNotification("Please watch the ad to convert.", "error");
        setIsConverting(false);
        return;
      }
      
      console.log('✅ Ad watched, converting');
      convertMutation.mutate({ amount, convertTo: selectedConvertType });
      
    } catch (error) {
      console.error('Convert error:', error);
      showNotification("Something went wrong. Please try again.", "error");
    } finally {
      setIsConverting(false);
    }
  };

  const canClaimStreak = !hasClaimed;

  const handleClaimStreak = async () => {
    if (isClaimingStreak || hasClaimed) return;
    
    setIsClaimingStreak(true);
    
    try {
      // Then show Monetag rewarded ad
      const monetagResult = await showMonetagRewardedAd();
      
      if (monetagResult.unavailable) {
        // If Monetag unavailable, proceed
        claimStreakMutation.mutate();
        return;
      }
      
      if (!monetagResult.success) {
        showNotification("Please watch the ad completely to claim your bonus.", "error");
        setIsClaimingStreak(false);
        return;
      }
      
      claimStreakMutation.mutate();
    } catch (error) {
      console.error('Streak claim failed:', error);
      showNotification("Failed to claim streak. Please try again.", "error");
      setIsClaimingStreak(false);
    }
  };

  useEffect(() => {
    if (checkForUpdatesStep === 'countdown' && checkForUpdatesCountdown > 0) {
      const timer = setTimeout(() => setCheckForUpdatesCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (checkForUpdatesStep === 'countdown' && checkForUpdatesCountdown === 0) {
      setCheckForUpdatesStep('ready');
    }
  }, [checkForUpdatesStep, checkForUpdatesCountdown]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      showNotification("Please enter a promo code", "error");
      return;
    }

    if (isApplyingPromo || redeemPromoMutation.isPending) return;
    
    setIsApplyingPromo(true);
    console.log('🎫 Promo code claim started, showing AdsGram ad first...');
    
    try {
      // Then show Monetag rewarded ad
      console.log('🎬 Proceeding with Monetag rewarded...');
      const monetagResult = await showMonetagRewardedAd();
      
      if (monetagResult.unavailable) {
        // If Monetag unavailable, proceed
        console.log('⚠️ Monetag unavailable, proceeding with promo claim');
        redeemPromoMutation.mutate(promoCode.trim().toUpperCase());
        return;
      }
      
      if (!monetagResult.success) {
        showNotification("Please watch the ad to claim your promo code.", "error");
        setIsApplyingPromo(false);
        return;
      }
      
      console.log('✅ Ad watched, claiming promo code');
      redeemPromoMutation.mutate(promoCode.trim().toUpperCase());
    } catch (error) {
      console.error('Promo claim error:', error);
      showNotification("Something went wrong. Please try again.", "error");
      setIsApplyingPromo(false);
    }
  };

  const handleBoosterClick = () => {
    setBoosterPopupOpen(true);
  };

  const handleWatchExtraAd = async () => {
    if (isTaskPending) return;
    
    showNotification("Ad sequence starting...", "info");
    
    try {
      // 1. Show Monetag
      const monetagResult = await showMonetagRewardedAd();
      if (!monetagResult.success && !monetagResult.unavailable) {
        throw new Error("Please watch the Monetag ad completely.");
      }
      
      // Small delay between ads
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Show GigaPub
      console.log('🎬 Attempting GigaPub ad...');
      if (typeof (window as any).showGiga === 'function') {
        console.log('✅ Calling window.showGiga()');
        (window as any).showGiga();
        // Give some time for the ad to at least start showing
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error("❌ GigaPub not available. Please refresh or check your ad blocker.");
        throw new Error("GigaPub ad service not ready. Please refresh.");
      }
      
      // 3. Reward
      const response = await apiRequest("POST", "/api/ads/extra-watch");
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      const data = await response.json();
      
      queryClient.setQueryData(["/api/auth/user"], (old: any) => ({
        ...old,
        balance: data.newBalance,
        extraAdsWatchedToday: data.extraAdsWatchedToday
      }));
      
      showNotification(`You received ${data.rewardPAD} PAD for Extra Earn!`, "success");
    } catch (error: any) {
      console.error('Extra earn error:', error);
      showNotification(error.message || "Extra Earn ad failed", "error");
    }
  };

  const handleShareWithFriends = useCallback(() => {
    if (!referralLink) return;
    const tgWebApp = (window as any).Telegram?.WebApp;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join me on CashWatch and earn rewards together!")}`;
    if (tgWebApp?.openTelegramLink) {
      tgWebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
    setShareWithFriendsStep('ready');
  }, [referralLink]);

  const shareWithFriendsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/missions/claim", { missionId: 'shareStory' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      showNotification("Rewards claimed!", "success");
      setShareWithFriendsStep('idle');
    }
  });

  const handleClaimShareWithFriends = useCallback(() => {
    shareWithFriendsMutation.mutate();
  }, [shareWithFriendsMutation]);

  const dailyCheckinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/missions/claim", { missionId: 'dailyCheckin' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      showNotification("Daily check-in successful!", "success");
      setDailyCheckinStep('idle');
    }
  });

  const handleDailyCheckin = useCallback(async () => {
    if (missionStatus?.dailyCheckin?.claimed || dailyCheckinStep !== 'idle') return;
    setDailyCheckinStep('ads');
    const adResult = await runAdFlow();
    if (!adResult.monetagWatched) {
      showNotification("Please watch the ads completely to claim!", "error");
      setDailyCheckinStep('idle');
      return;
    }
    setDailyCheckinStep('ready');
  }, [missionStatus?.dailyCheckin?.claimed, dailyCheckinStep, runAdFlow]);

  const handleClaimDailyCheckin = useCallback(() => {
    if (dailyCheckinMutation.isPending) return;
    setDailyCheckinStep('claiming');
    dailyCheckinMutation.mutate();
  }, [dailyCheckinMutation]);

  const checkForUpdatesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/missions/claim", { missionId: 'checkForUpdates' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      showNotification("Rewards claimed!", "success");
      setCheckForUpdatesStep('idle');
    }
  });

  const handleCheckForUpdates = useCallback(() => {
    if (missionStatus?.checkForUpdates?.claimed || checkForUpdatesStep !== 'idle') return;
    const tgWebApp = (window as any).Telegram?.WebApp;
    const channelUrl = 'https://t.me/MoneyAdz';
    if (tgWebApp?.openTelegramLink) {
      tgWebApp.openTelegramLink(channelUrl);
    } else if (tgWebApp?.openLink) {
      tgWebApp.openLink(channelUrl);
    } else {
      window.open(channelUrl, '_blank');
    }
    setCheckForUpdatesStep('opened');
    setCheckForUpdatesCountdown(3);
    const countdownInterval = setInterval(() => {
      setCheckForUpdatesCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCheckForUpdatesStep('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [missionStatus?.checkForUpdates?.claimed, checkForUpdatesStep]);

  const handleClaimCheckForUpdates = useCallback(() => {
    if (checkForUpdatesMutation.isPending) return;
    setCheckForUpdatesStep('claiming');
    checkForUpdatesMutation.mutate();
  }, [checkForUpdatesMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-1 justify-center mb-4">
            <div className="w-2 h-2 rounded-full bg-[#4cd3ff] animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#4cd3ff] animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#4cd3ff] animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <div className="text-foreground font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  const userRank = leaderboardData?.userEarnerRank?.rank;

  return (
    <Layout>
      <main className="max-w-md mx-auto px-4 pt-4 pb-8">
        {/* Profile Card Section */}
        <div className="bg-[#0d0d0d] rounded-[24px] p-4 border border-[#1a1a1a]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div 
                className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border border-white/5 ${isAdmin ? 'cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-blue-500/50' : ''}`}
                onClick={() => isAdmin && setLocation("/admin")}
              >
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span 
                  className={`text-white font-bold text-base leading-none ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => isAdmin && setLocation("/admin")}
                >
                  {(user as User)?.firstName || (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "User"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-[100]">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Settings clicked, opening popup...");
                  setSettingsOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/5 text-[#8E8E93] hover:text-white hover:bg-[#222] transition-colors flex items-center justify-center cursor-pointer"
              >
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Balance Card Section */}
          <div className="bg-[#141414] rounded-2xl px-4 py-3 flex justify-between items-center mb-4 border border-white/5">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[#8E8E93] text-[9px] font-semibold uppercase tracking-wider mb-0.5">Total Points Earned</span>
              <span className="text-white text-lg font-black tabular-nums">
                {padBalance.toLocaleString()}
              </span>
            </div>
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[#8E8E93] text-[9px] font-semibold uppercase tracking-wider">Total BUZZ Earned</span>
                <div className="bg-[#B9FF66] rounded-full p-0.5 flex-shrink-0">
                  <Info className="w-2 h-2 text-black" />
                </div>
              </div>
              <span className="text-white text-lg font-black tabular-nums">
                {balanceBUG.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleConvertClick}
              className="bg-[#1a1a1a] hover:bg-[#222] text-[#B9FF66] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 border border-[#B9FF66]/10 h-auto transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Convert
            </Button>
            <Button
              onClick={() => setPromoPopupOpen(true)}
              className="bg-[#1a1a1a] hover:bg-[#222] text-[#B9FF66] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 border border-[#B9FF66]/10 h-auto transition-transform active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              Promo
            </Button>
          </div>
        </div>

        <div className="mt-2">
          <Tabs defaultValue="earn" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#0d0d0d] border-b border-white/5 h-12 p-0 rounded-none mb-4">
              <TabsTrigger 
                value="earn" 
                className="flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-wider rounded-none data-[state=active]:bg-transparent data-[state=active]:text-white transition-all relative h-full"
              >
                <LayoutDashboard className="w-4 h-4" />
                Earn
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 opacity-0 data-[state=active]:opacity-100 transition-opacity"></div>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-wider rounded-none data-[state=active]:bg-transparent data-[state=active]:text-white transition-all relative h-full"
              >
                <ClipboardList className="w-4 h-4" />
                Tasks
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 opacity-0 data-[state=active]:opacity-100 transition-opacity"></div>
              </TabsTrigger>
              <TabsTrigger 
                value="referrals" 
                className="flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-wider rounded-none data-[state=active]:bg-transparent data-[state=active]:text-white transition-all relative h-full"
              >
                <HeartHandshake className="w-4 h-4" />
                Referrals
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 opacity-0 data-[state=active]:opacity-100 transition-opacity"></div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="earn" className="mt-0 outline-none">
              <div className="space-y-4">
                <AdWatchingSection user={user as User} />
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 outline-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Active Tasks</h2>
                  </div>
                  <div className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider tabular-nums">
                    {unifiedTasksData?.tasks?.length || 0} Available
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {isLoadingTasks ? (
                      <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    ) : (unifiedTasksData?.tasks && unifiedTasksData.tasks.length > 0) ? (
                      unifiedTasksData.tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/5">
                                <span className="text-white/80">
                                  {getTaskIcon(task)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-black text-sm uppercase tracking-tight truncate">{task.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1.5">
                                    <DiamondIcon size={14} />
                                    <span className="text-[13px] font-black text-white">+{task.rewardPAD.toLocaleString()}</span>
                                  </div>
                                  {task.rewardBUG && task.rewardBUG > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <Bug className="w-3.5 h-3.5 text-blue-400" />
                                      <span className="text-[13px] font-black text-blue-400">+{task.rewardBUG}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleUnifiedTask(task)}
                              disabled={isTaskPending || claimAdvertiserTaskMutation.isPending || completedTasks.has(task.id)}
                              className={`h-10 px-6 text-xs font-black rounded-xl uppercase tracking-widest transition-all ${
                                completedTasks.has(task.id)
                                  ? "bg-white/5 text-white/40 border border-white/5"
                                  : clickedTasks.has(task.id)
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-black hover:bg-gray-200"
                              }`}
                            >
                              {completedTasks.has(task.id) ? "Done" : clickedTasks.has(task.id) ? "Claim" : "Start"}
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-16 px-6 text-center"
                      >
                        <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                          <Check className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">All Caught Up!</h3>
                        <p className="text-sm text-zinc-500 max-w-[240px] mx-auto leading-relaxed font-bold">
                          You've completed all available missions. Check back soon for new opportunities to earn!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="referrals" className="mt-0 outline-none">
              <div className="flex flex-col items-center text-center pt-4">
                <h2 className="text-xl font-bold text-white mb-1">Invite friends and earn</h2>
                <p className="text-[13px] text-[#8E8E93] mb-5 max-w-[280px] leading-snug">
                  10% of their Hrum and When your friend buys a plan you get <span className="font-bold">{appSettings?.referralRewardPAD || 50} PAD</span> instantly
                </p>

                <div className="w-full bg-[#111111] rounded-[24px] p-5 mb-5 flex justify-around">
                  <div>
                    <p className="text-[10px] text-[#8E8E93] mb-1 uppercase font-bold tracking-wider">User referred</p>
                    <p className="text-2xl font-black text-white">{stats?.totalInvites || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8E8E93] mb-1 uppercase font-bold tracking-wider">Successful</p>
                    <p className="text-2xl font-black text-white">{stats?.successfulInvites || 0}</p>
                  </div>
                </div>

                <div className="flex w-full gap-2">
                  <Button
                    onClick={copyReferralLink}
                    disabled={!referralLink}
                    className="flex-1 h-12 bg-[#111111] hover:bg-[#1a1a1a] text-white rounded-2xl font-bold text-sm gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={shareReferralLink}
                    disabled={!referralLink || isSharing}
                    className="flex-1 h-12 bg-[#B9FF66] hover:bg-[#a8e65a] text-black rounded-2xl font-bold text-sm"
                  >
                    {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite Friends +"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>


      {boosterPopupOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d0d0d] rounded-2xl p-6 w-full max-w-sm border border-[#1a1a1a] relative">
            <div className="flex items-center justify-center gap-2 mb-6">
              <CalendarCheck className="w-5 h-5 text-[#4cd3ff]" />
              <h2 className="text-lg font-bold text-white">Daily Tasks</h2>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3 hover:bg-[#222] transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#4cd3ff]" />
                    <p className="text-white text-sm font-medium truncate">Share with Friends</p>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">
                    <p>Reward: <span className="text-white font-medium">{appSettings?.referralRewardPAD || '5'} PAD</span></p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {missionStatus?.shareStory?.claimed ? (
                    <div className="h-8 w-20 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  ) : shareWithFriendsStep === 'ready' || shareWithFriendsStep === 'claiming' ? (
                    <Button
                      onClick={handleClaimShareWithFriends}
                      disabled={shareWithFriendsMutation.isPending}
                      className="h-8 w-20 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white"
                    >
                      {shareWithFriendsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleShareWithFriends}
                      disabled={!referralLink}
                      className="h-8 w-16 text-xs font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Share
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3 hover:bg-[#222] transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck className="w-4 h-4 text-[#4cd3ff]" />
                    <p className="text-white text-sm font-medium truncate">Daily Check-in</p>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">
                    <p>Reward: <span className="text-white font-medium">{appSettings?.dailyCheckinReward || '5'} PAD</span></p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {missionStatus?.dailyCheckin?.claimed ? (
                    <div className="h-8 w-20 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  ) : dailyCheckinStep === 'ads' ? (
                    <Button
                      disabled={true}
                      className="h-8 w-20 text-xs font-bold rounded-lg bg-purple-600 text-white"
                    >
                      Watching...
                    </Button>
                  ) : dailyCheckinStep === 'ready' || dailyCheckinStep === 'claiming' ? (
                    <Button
                      onClick={handleClaimDailyCheckin}
                      disabled={dailyCheckinMutation.isPending}
                      className="h-8 w-20 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white"
                    >
                      {dailyCheckinMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDailyCheckin}
                      className="h-8 w-20 text-xs font-bold rounded-lg bg-[#4cd3ff] hover:bg-[#3db8e0] text-black"
                    >
                      Check-in
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3 hover:bg-[#222] transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-[#4cd3ff]" />
                    <p className="text-white text-sm font-medium truncate">Check for Updates</p>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">
                    <p>Reward: <span className="text-white font-medium">{appSettings?.checkForUpdatesReward || '5'} PAD</span></p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {missionStatus?.checkForUpdates?.claimed ? (
                    <div className="h-8 w-20 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  ) : checkForUpdatesStep === 'opened' ? (
                    <div className="h-8 w-20 flex items-center justify-center gap-1 bg-[#1a1a1a] border border-[#4cd3ff]/30 rounded-lg">
                      <Clock size={12} className="text-[#4cd3ff]" />
                      <span className="text-white text-xs font-bold">{checkForUpdatesCountdown}s</span>
                    </div>
                  ) : checkForUpdatesStep === 'ready' || checkForUpdatesStep === 'claiming' ? (
                    <Button
                      onClick={handleClaimCheckForUpdates}
                      disabled={checkForUpdatesMutation.isPending}
                      className="h-8 w-20 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white"
                    >
                      {checkForUpdatesMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCheckForUpdates}
                      className="h-8 w-20 text-xs font-bold rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Open
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setBoosterPopupOpen(false)}
              className="w-full mt-6 bg-[#1a1a1a] hover:bg-[#222] text-white border border-[#333] rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {promoPopupOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d0d0d] rounded-2xl p-6 w-full max-w-sm border border-[#1a1a1a]">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Ticket className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Promo Code</h2>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 text-center">
              Enter your promo code below to claim special rewards!
            </p>

            <div className="space-y-4">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="ENTER CODE"
                className="bg-[#1a1a1a] border-[#333] text-white font-bold text-center h-12 rounded-xl focus:border-purple-500 transition-all uppercase placeholder:text-gray-600"
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setPromoPopupOpen(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-[#333] text-white rounded-xl h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || !promoCode.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-12 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                >
                  {isApplyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {convertPopupOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d0d0d] rounded-2xl p-6 w-full max-w-sm border border-[#1a1a1a]">
            <div className="flex items-center justify-center gap-2 mb-6">
              <RefreshCw className="w-5 h-5 text-[#4cd3ff]" />
              <h2 className="text-lg font-bold text-white">Convert PAD</h2>
            </div>

            <div className="flex bg-[#1a1a1a] p-1 rounded-xl mb-6">
              <button
                onClick={() => setSelectedConvertType('USD')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedConvertType === 'USD' ? 'bg-[#4cd3ff] text-black shadow-lg' : 'text-gray-400'}`}
              >
                TO USD
              </button>
              <button
                onClick={() => setSelectedConvertType('TON')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedConvertType === 'TON' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
              >
                TO TON
              </button>
              <button
                onClick={() => setSelectedConvertType('BUG')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedConvertType === 'BUG' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}
              >
                TO BUG
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block ml-1 uppercase font-bold tracking-wider">Amount to Convert</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    placeholder="0"
                    className="bg-[#1a1a1a] border-[#333] text-white font-bold h-14 rounded-xl pl-12 focus:border-[#4cd3ff] transition-all"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <DiamondIcon size={18} />
                  </div>
                  <button 
                    onClick={() => setConvertAmount(padBalance.toString())}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#4cd3ff] hover:text-white transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 ml-1">
                  Balance: <span className="text-white">{padBalance.toLocaleString()} PAD</span>
                </p>
              </div>

              <div className="bg-[#1a1a1a]/50 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Estimated Value</span>
                  <span className="text-white font-bold">
                    {selectedConvertType === 'USD' 
                      ? `$${((parseFloat(convertAmount || "0") / (appSettings?.padToUsdRate || 1000000))).toFixed(4)}`
                      : selectedConvertType === 'TON'
                        ? `${(parseFloat(convertAmount || "0") / (appSettings?.padToTonRate || 1000000)).toFixed(4)} TON`
                        : `${(parseFloat(convertAmount || "0") / (appSettings?.padToBugRate || 1000)).toFixed(2)} BUG`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Fee</span>
                  <span className="text-white font-bold">0.00%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setConvertPopupOpen(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-[#333] text-white rounded-xl h-14"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConvertConfirm}
                  disabled={isConverting || convertMutation.isPending || !convertAmount}
                  className="flex-1 bg-[#4cd3ff] hover:bg-[#3db8e0] text-black font-bold rounded-xl h-14 shadow-[0_0_20px_rgba(76,211,255,0.3)]"
                >
                  {isConverting || convertMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Convert'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsPopup 
          onClose={() => setSettingsOpen(false)} 
        />
      )}
    </Layout>
  );
}
