import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { showNotification } from "@/components/AppNotification";
import { Loader2 } from "lucide-react";

interface WithdrawalPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tonBalance: number;
}

export default function WithdrawalPopup({ open, onOpenChange, tonBalance }: WithdrawalPopupProps) {
  const queryClient = useQueryClient();
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: appSettings } = useQuery<any>({
    queryKey: ['/api/app-settings'],
    staleTime: 30000,
  });

  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    staleTime: 0,
  });

  const tonBalanceFromUser = parseFloat(user?.tonBalance || "0");

  const minWithdraw = appSettings?.minimum_withdrawal_ton ? parseFloat(appSettings.minimum_withdrawal_ton) : 0.1;
  const networkFee = appSettings?.withdrawal_fee_ton ? parseFloat(appSettings.withdrawal_fee_ton) : 0.01;

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/withdrawals", {
        address: withdrawAddress,
        amount: parseFloat(withdrawAmount).toString(),
        method: "TON"
      });
      return res.json();
    },
    onSuccess: () => {
      showNotification("Withdrawal request submitted successfully", "success");
      onOpenChange(false);
      setWithdrawAddress("");
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
    },
    onError: (error: any) => {
      let message = "Withdrawal failed";
      try {
        if (typeof error.message === 'string') {
          const trimmed = error.message.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            const parsed = JSON.parse(trimmed);
            if (parsed.message) message = parsed.message;
          } else {
            message = error.message;
          }
        }
      } catch (e) {
        message = error.message;
      }
      showNotification(message, "error");
    },
  });

  const handleWithdrawClick = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < minWithdraw) {
      showNotification(`Minimum withdrawal amount is ${minWithdraw} TON`, "error");
      return;
    }
    if (amount > tonBalanceFromUser) {
      showNotification(`Insufficient balance. Available: ${tonBalanceFromUser} TON`, "error");
      return;
    }
    if (!withdrawAddress.trim()) {
      showNotification("Please enter TON address", "error");
      return;
    }
    withdrawMutation.mutate();
  };

  const toReceive = withdrawAmount ? Math.max(0, parseFloat(withdrawAmount) - networkFee).toFixed(4) : "0.0000";

  const handleMaxClick = () => {
    setWithdrawAmount(tonBalanceFromUser.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 border-white/5 text-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl backdrop-blur-sm [&>button]:hidden">
        <div className="p-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">TON withdrawal</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-[#8E8E93] text-[11px] font-black uppercase tracking-widest ml-1">Address (TON):</Label>
              </div>
              <Input 
                placeholder="Enter wallet address" 
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-[#1a1a1a] border-white/5 text-white h-14 rounded-2xl focus:ring-[#B9FF66] font-bold text-base"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[#8E8E93] text-[11px] font-black uppercase tracking-widest ml-1">Amount (TON):</Label>
                <span className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">Avail: {Number(tonBalanceFromUser).toFixed(4)}</span>
              </div>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0.0000" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-[#1a1a1a] border-white/5 text-white h-14 rounded-2xl focus:ring-[#B9FF66] font-bold text-base pr-20"
                />
                <button 
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[11px] font-black rounded-xl transition-all uppercase"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="bg-[#141414] rounded-3xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8E8E93] text-[11px] font-black uppercase tracking-widest">To receive (TON):</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-black tabular-nums">{toReceive}</span>
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                    <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-white/5" />
              <div className="flex justify-between items-center text-[#8E8E93]">
                <span className="text-[11px] font-black uppercase tracking-widest">Network fee</span>
                <span className="text-white text-sm font-black">{networkFee} TON</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                className="w-full h-14 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl border-0 active:scale-[0.98] disabled:opacity-50"
                onClick={handleWithdrawClick}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Withdraw Now"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[11px] uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
}
