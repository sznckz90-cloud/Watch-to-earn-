import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showNotification } from '@/components/AppNotification';
import Layout from '@/components/Layout';
import { Share2, Users, Copy, Loader2, Bug, DollarSign, Gift, Zap, Check, Lock } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username?: string;
  firstName?: string;
  referralCode?: string;
  friendsInvited?: number;
  [key: string]: any;
}

interface ReferralTask {
  id: string;
  required: number;
  rewardHrum: number;
  boost: number;
  title: string;
  claimed: boolean;
  canClaim: boolean;
}

interface ReferralStats {
  totalInvites: number;
  successfulInvites: number;
  totalClaimed: string;
  availableBonus: string;
  readyToClaim: string;
  totalBugEarned?: number;
  totalUsdEarned?: number;
}

interface AppSettings {
  affiliateCommission?: number;
  referralRewardEnabled?: boolean;
  referralRewardTON?: number;
  referralRewardHrum?: number;
}

export default function Affiliates() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 60000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    retry: false,
    staleTime: 60000,
  });

  const { data: appSettings } = useQuery<AppSettings>({
    queryKey: ['/api/app-settings'],
    retry: false,
    staleTime: 120000,
  });

  const { data: referralTasks, isLoading: tasksLoading } = useQuery<ReferralTask[]>({
    queryKey: ['/api/referrals/tasks'],
    retry: false,
  });

  const claimTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest("POST", `/api/referrals/tasks/${taskId}/claim`);
      return res.json();
    },
    onSuccess: (data) => {
      showNotification(data.message, "success");
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/state'] });
    },
    onError: (error: any) => {
      showNotification(error.message || "Failed to claim reward", "error");
    }
  });

  const isLoading = userLoading || statsLoading || tasksLoading;

  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'MoneyHrumbot';
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
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp?.shareMessage) {
        const response = await fetch('/api/share/prepare-message', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success && data.messageId) {
          tgWebApp.shareMessage(data.messageId, (success: boolean) => {
            if (success) showNotification('Message shared successfully!', 'success');
            setIsSharing(false);
          });
          return;
        }
      }
      const shareTitle = `💵 Get paid for completing tasks and watching ads.`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareTitle)}`;
      if (tgWebApp?.openTelegramLink) tgWebApp.openTelegramLink(shareUrl);
      else window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('Share error:', error);
    }
    setIsSharing(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="flex gap-1 justify-center mb-4">
              <div className="w-2 h-2 rounded-full bg-[#4cd3ff] animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#4cd3ff] animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#4cd3ff] animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div className="text-foreground font-medium">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="max-w-md mx-auto px-4 pt-3 pb-24">
        <Card className="mb-4 minimal-card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-7 h-7 text-[#007BFF]" />
              <h1 className="text-2xl font-bold text-white">Affiliates program</h1>
            </div>
            
            <p className="text-sm text-center text-white/80 leading-relaxed mb-4">
              Invite friends and get <span className="font-bold text-blue-400">{appSettings?.affiliateCommission || 10}%</span> of every ads completed by your referrals
            </p>
            
            {appSettings?.referralRewardEnabled && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-xs text-green-400 font-medium text-center">
                  Bonus: Earn <span className="font-bold">{appSettings.referralRewardHrum || 50} Hrum</span> + <span className="font-bold" >{appSettings.referralReward || 0.0005} TON</span> on first ad!
                </p>
              </div>
            )}
            
            <div className="bg-muted/30 border border-white/5 rounded-xl p-3 mb-3 overflow-x-auto text-sm text-foreground whitespace-nowrap scrollbar-hide">
              {referralLink}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-12 btn-primary rounded-xl" onClick={copyReferralLink} disabled={!referralLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button className="h-12 btn-primary rounded-xl" onClick={shareReferralLink} disabled={!referralLink || isSharing}>
                {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                {isSharing ? 'Sending...' : 'Share'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* New Referral Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Gift className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Invite Tasks</h2>
          </div>
          
          <div className="space-y-3">
            {referralTasks?.map((task) => (
              <Card key={task.id} className={`minimal-card transition-all duration-300 ${task.claimed ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.claimed ? 'bg-zinc-800' : task.canClaim ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-900 text-zinc-500'}`}>
                        {task.claimed ? <Check className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white leading-tight uppercase tracking-tight">{task.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">+{task.rewardHrum} HRUM</span>
                          <span className="text-[10px] font-bold text-blue-400 uppercase">+{task.boost} H/H</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      disabled={task.claimed || !task.canClaim || claimTaskMutation.isPending}
                      onClick={() => claimTaskMutation.mutate(task.id)}
                      className={`h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all ${
                        task.claimed 
                          ? 'bg-zinc-800 text-zinc-500 border-none' 
                          : task.canClaim 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-zinc-900 text-zinc-500 border border-white/5'
                      }`}
                    >
                      {task.claimed ? 'Completed' : task.canClaim ? 'Claim' : 'Locked'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="minimal-card">
            <CardContent className="pt-4 pb-4">
              <div className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">Total Invites</div>
              <div className="text-xl font-black text-white">{stats?.totalInvites || 0}</div>
            </CardContent>
          </Card>
          <Card className="minimal-card">
            <CardContent className="pt-4 pb-4">
              <div className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">Successful</div>
              <div className="text-xl font-black text-[#4cd3ff]">{stats?.successfulInvites || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="minimal-card">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Bug className="w-4 h-4 text-green-400" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">BUG Earned</span>
              </div>
              <div className="text-xl font-black text-green-400">
                {(stats?.totalBugEarned || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="minimal-card">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <img src="/images/ton.png" alt="TON" className="w-4 h-4" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">TON Earned</span>
              </div>
              <div className="text-xl font-black text-emerald-400">
                {(stats?.totalUsdEarned || 0).toFixed(4)}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
