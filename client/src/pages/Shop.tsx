import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showNotification } from '@/components/AppNotification';
import Layout from '@/components/Layout';
import { Share2, Users, Copy, Loader2, Bug, DollarSign, Zap, TrendingUp, Star } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface User {
  id: string;
  username?: string;
  firstName?: string;
  referralCode?: string;
  tonBalance?: string;
  activePlanId?: string;
  planExpiresAt?: string;
  [key: string]: any;
}

const MINING_PLANS = [
  { id: 'cookgo', name: 'CookGo', price: 0.2, hrumProfit: 200, icon: Zap, color: 'text-blue-400' },
  { id: 'wannacook', name: 'WannaCook', price: 0.35, hrumProfit: 450, icon: TrendingUp, color: 'text-green-400' },
  { id: 'cookpad', name: 'Cookpad', price: 0.5, hrumProfit: 750, icon: Zap, color: 'text-purple-400' },
  { id: 'pepper', name: 'Pepper', price: 0.7, hrumProfit: 1100, icon: Zap, color: 'text-red-400' },
  { id: 'mrcook', name: 'Mr Cook', price: 1.0, hrumProfit: 1500, icon: Users, color: 'text-yellow-400' },
  { id: 'mealplanner', name: 'Meal Planner', price: 1.3, hrumProfit: 2000, icon: Zap, color: 'text-orange-400' },
  { id: 'recify', name: 'Recify', price: 1.6, hrumProfit: 2600, icon: Zap, color: 'text-pink-400' },
  { id: 'chowman', name: 'Chowman', price: 2.0, hrumProfit: 3300, icon: Zap, color: 'text-indigo-400' },
  { id: 'cookbook', name: 'Cookbook', price: 2.5, hrumProfit: 4100, icon: Zap, color: 'text-cyan-400' },
  { id: 'recime', name: 'ReciMe', price: 3.0, hrumProfit: 5000, icon: Star, color: 'text-yellow-500', best: true },
];

export default function Shop() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const isActive = user?.activePlanId && user?.planExpiresAt && new Date(user.planExpiresAt) > new Date();

  const buyPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (isActive) {
        throw new Error('You already have an active plan');
      }
      const response = await fetch('/api/shop/buy-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to buy plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      showNotification('Plan activated! Mining started.', 'success');
    },
    onError: (error: Error) => {
      showNotification(error.message, 'error');
    },
  });

  if (userLoading) {
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
      <div className="flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 scrollbar-hide">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hrum Shop</h1>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-4 h-4 rounded-full overflow-hidden border border-white/10 flex items-center justify-center">
              <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-white">{parseFloat(user?.tonBalance || '0').toFixed(4)}</span>
          </div>
        </div>

        {isActive && (
          <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3 h-3 fill-current" />
              Active Plan: {MINING_PLANS.find(p => p.id === user.activePlanId)?.name}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">
              Expires in: {Math.ceil((new Date(user.planExpiresAt!).getTime() - Date.now()) / (1000 * 60 * 60))} hours
            </p>
          </div>
        )}

        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <div className="w-1 h-1 bg-zinc-500 rounded-full" />
            Duration: 24 Hours (Fixed)
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <div className="w-1 h-1 bg-zinc-500 rounded-full" />
            Profit: 1 TON = 10,000 HRUM
          </div>
        </div>

        <div className="grid gap-3">
          {MINING_PLANS.map((plan) => (
            <Card key={plan.id} className={`bg-zinc-950 border-white/5 overflow-hidden relative ${plan.best ? 'ring-2 ring-yellow-500/50' : ''}`}>
              {plan.best && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-xl z-10">
                  Best Plan
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 ${plan.color}`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{plan.name}</h3>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                        Net Profit: <span className="text-green-400">+{plan.hrumProfit.toLocaleString()} HRUM</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                        Profit (TON): <span className="text-white">{(plan.hrumProfit / 10000).toFixed(3)} TON</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                        Rate: <span className="text-zinc-300">{(plan.hrumProfit / 24).toFixed(2)} HRUM/h</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      onClick={() => buyPlanMutation.mutate(plan.id)}
                      disabled={buyPlanMutation.isPending || isActive}
                      className={`${isActive ? 'bg-zinc-800 text-zinc-500' : 'bg-white hover:bg-zinc-200 text-black'} font-black text-xs h-9 px-4 rounded-xl uppercase tracking-widest transition-all`}
                    >
                      {buyPlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `${plan.price} TON`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </main>
      </div>
    </Layout>
  );
}
