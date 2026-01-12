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
  [key: string]: any;
}

const MINING_PLANS = [
  { id: 'cookgo', name: 'CookGo', price: 0.1, netProfit: 40, totalReturn: 1040, icon: Zap, color: 'text-blue-400' },
  { id: 'wannacook', name: 'WannaCook', price: 0.2, netProfit: 100, totalReturn: 2100, icon: TrendingUp, color: 'text-green-400' },
  { id: 'cookpad', name: 'Cookpad', price: 0.3, netProfit: 210, totalReturn: 3210, icon: Zap, color: 'text-purple-400' },
  { id: 'pepper', name: 'Pepper', price: 0.4, netProfit: 360, totalReturn: 4360, icon: Zap, color: 'text-red-400' },
  { id: 'mrcook', name: 'Mr Cook', price: 0.5, netProfit: 600, totalReturn: 5600, icon: Users, color: 'text-yellow-400' },
  { id: 'mealplanner', name: 'Meal Planner', price: 0.6, netProfit: 900, totalReturn: 6900, icon: Zap, color: 'text-orange-400' },
  { id: 'recify', name: 'Recify', price: 0.7, netProfit: 1260, totalReturn: 8260, icon: Zap, color: 'text-pink-400' },
  { id: 'chowman', name: 'Chowman', price: 0.8, netProfit: 1760, totalReturn: 9760, icon: Zap, color: 'text-indigo-400' },
  { id: 'cookbook', name: 'Cookbook', price: 0.9, netProfit: 2430, totalReturn: 11430, icon: Zap, color: 'text-cyan-400' },
  { id: 'recime', name: 'ReciMe', price: 1, netProfit: 3500, totalReturn: 13500, icon: Star, color: 'text-yellow-500', best: true },
];

export default function Shop() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const buyPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
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
      showNotification('Plan purchased successfully!', 'success');
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hrum Shop</h1>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-white/5">
            <img src="/images/ton.png" alt="TON" className="w-4 h-4" />
            <span className="text-sm font-bold text-white">{parseFloat(user?.tonBalance || '0').toFixed(4)}</span>
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
                        Profit: <span className="text-green-400">+{plan.netProfit.toLocaleString()} Hrum</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                        Total: <span className="text-white">{plan.totalReturn.toLocaleString()} Hrum</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      onClick={() => buyPlanMutation.mutate(plan.id)}
                      disabled={buyPlanMutation.isPending}
                      className="bg-white hover:bg-zinc-200 text-black font-black text-xs h-9 px-4 rounded-xl uppercase tracking-widest"
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
