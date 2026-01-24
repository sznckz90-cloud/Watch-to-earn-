import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showNotification } from "@/components/AppNotification";

interface Withdrawal {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  method?: string;
}

interface WithdrawalsResponse {
  success: boolean;
  withdrawals: Withdrawal[];
}

interface User {
  id: string;
  tonBalance?: string;
}

export default function Withdraw() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  
  // Withdrawal Popup State
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 0,
  });

  const { data: appSettings } = useQuery<any>({
    queryKey: ['/api/app-settings'],
    retry: false,
    staleTime: 0,
  });

  const { data: withdrawalsResponse, isLoading: withdrawalsLoading } = useQuery<WithdrawalsResponse>({
    queryKey: ['/api/withdrawals'],
    retry: false,
    staleTime: 0,
  });

  const tonBalance = parseFloat(user?.tonBalance || "0");
  const withdrawalsData = Array.isArray(withdrawalsResponse?.withdrawals) ? withdrawalsResponse.withdrawals : [];
  
  const minWithdraw = parseFloat(appSettings?.minimum_withdrawal_ton || "0.1");
  const networkFee = parseFloat(appSettings?.withdrawal_fee_ton || "0.01");

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/withdrawals", {
        address: withdrawAddress,
        amount: parseFloat(withdrawAmount),
        method: 'TON'
      });
      return res.json();
    },
    onSuccess: () => {
      showNotification("Withdrawal request submitted successfully", "success");
      setWithdrawDialogOpen(false);
      setWithdrawAddress('');
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const filteredWithdrawals = withdrawalsData.filter(w => {
    if (filter === 'all') return true;
    if (filter === 'withdraw') return true;
    return false;
  });

  const formatTon = (amount: any) => {
    const val = parseFloat(amount);
    return isNaN(val) ? "0" : val.toString();
  };

  const handleWithdrawClick = () => {
    if (parseFloat(withdrawAmount) < minWithdraw) {
      showNotification(`Minimum withdrawal amount is ${minWithdraw} TON`, "error");
      return;
    }
    if (parseFloat(withdrawAmount) > tonBalance) {
      showNotification("Insufficient balance", "error");
      return;
    }
    if (!withdrawAddress.trim()) {
      showNotification("Please enter TON address", "error");
      return;
    }
    withdrawMutation.mutate();
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-[#1A0D00] text-white p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-[#261400] rounded-2xl p-4 space-y-4 border border-[#B34700]/30 shadow-xl">
          <div className="space-y-1">
            <p className="text-[#D1D5DB] text-[10px] font-bold tracking-wider uppercase">BALANCE</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#3D1F00] flex items-center justify-center overflow-hidden border border-[#B34700]/30 shadow-inner">
                <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-3xl font-bold leading-none">{formatTon(tonBalance)}</span>
                <span className="text-lg font-bold text-[#D1D5DB] leading-none self-end pb-0.5">TON</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 h-11 bg-[#E88A1A] hover:bg-[#B34700] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-0 shadow-lg shadow-[#E88A1A]/10 transition-all active:scale-95"
              onClick={() => setLocation('/top-up')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 origin-center" />
              </svg>
              Deposit
            </Button>

            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 h-11 bg-[#3D1F00] hover:bg-[#261400] text-white border border-[#B34700]/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-none transition-all active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#261400] border-[#B34700]/30 text-white w-[90%] rounded-3xl p-6 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-center">TON withdrawal</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-[#D1D5DB] font-bold">Address (TON):</Label>
                    <Input 
                      placeholder="Enter address" 
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      className="bg-[#3D1F00] border-[#B34700]/30 h-12 rounded-xl text-sm placeholder:text-[#555] focus:border-[#E88A1A]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-[#D1D5DB] font-bold">Amount (TON):</Label>
                    <Input 
                      type="number"
                      placeholder="0.0000" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-[#3D1F00] border-[#B34700]/30 h-12 rounded-xl text-sm placeholder:text-[#555] focus:border-[#E88A1A]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-[#D1D5DB] font-bold">To receive (TON):</Label>
                    <div className="bg-[#3D1F00] border-[#B34700]/30 h-12 rounded-xl px-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {withdrawAmount ? (parseFloat(withdrawAmount) - networkFee > 0 ? (parseFloat(withdrawAmount) - networkFee).toFixed(4) : "0.0000") : "0.0000"}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#3D1F00] flex items-center justify-center overflow-hidden border border-[#B34700]/30 shadow-inner">
                        <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover scale-110" />
                      </div>
                    </div>
                  </div>

                    <div className="pt-2">
                      <Button 
                        className="w-full h-14 bg-[#E88A1A] hover:bg-[#B34700] text-white rounded-2xl text-lg font-bold shadow-lg shadow-[#E88A1A]/20 border-0 transition-all active:scale-95 disabled:opacity-50"
                        onClick={handleWithdrawClick}
                        disabled={withdrawMutation.isPending}
                      >
                        {withdrawMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          `Withdraw (Min ${minWithdraw} TON)`
                        )}
                      </Button>
                    </div>

                  <div className="space-y-1 pt-2">
                    <p className="text-[11px] text-[#D1D5DB] font-bold">•Network fee: {networkFee} TON</p>
                    <p className="text-[11px] text-[#D1D5DB] font-bold">•Withdrawal time: 24 hours.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transaction Tabs */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['all', 'deposit', 'withdraw'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === t 
                    ? 'bg-[#E88A1A] text-white shadow-lg shadow-[#E88A1A]/20' 
                    : 'bg-[#261400] text-[#D1D5DB] border border-[#B34700]/30'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="bg-[#261400] border border-[#B34700]/30 rounded-2xl min-h-[160px] flex flex-col items-center justify-center p-6 shadow-xl">
            {withdrawalsLoading ? (
              <Loader2 className="w-6 h-6 text-[#E88A1A] animate-spin" />
            ) : filteredWithdrawals.length === 0 ? (
              <p className="text-[#D1D5DB] font-bold text-sm">No transactions yet</p>
            ) : (
              <div className="w-full space-y-4">
                {filteredWithdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-2 border-b border-[#B34700]/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3D1F00] flex items-center justify-center border border-[#B34700]/30">
                         <Clock className="w-4 h-4 text-[#F2B824]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Withdrawal</p>
                        <p className="text-xs text-[#D1D5DB]">{format(new Date(w.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#E88A1A]">-{formatTon(w.amount)} TON</p>
                      <p className={`text-[10px] font-bold uppercase ${
                        w.status === 'pending' ? 'text-[#F2B824]' : 
                        w.status === 'approved' || w.status === 'paid' ? 'text-[#26D07C]' : 'text-red-500'
                      }`}>
                        {w.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
