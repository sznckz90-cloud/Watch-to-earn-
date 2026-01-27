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
      <DialogContent className="bg-black/95 border-white/5 text-white w-full max-w-[340px] rounded-[28px] p-6 shadow-2xl backdrop-blur-sm [&>button]:hidden">
        <div className="p-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">TON withdrawal</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest ml-1">Address (TON):</Label>
              </div>
              <Input 
                placeholder="Paste your TON address" 
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-[#1a1a1a] border-white/5 text-white h-12 rounded-xl focus:ring-[#B9FF66] font-bold text-sm placeholder:text-[#3a3a3a] placeholder:text-[11px] placeholder:font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest ml-1">Amount (TON):</Label>
                <span className="text-[#8E8E93] text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-lg">Avail: {Number(tonBalanceFromUser).toFixed(4)}</span>
              </div>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-[#1a1a1a] border-white/5 text-white h-12 rounded-xl focus:ring-[#B9FF66] font-bold text-sm pr-16 placeholder:text-[#3a3a3a] placeholder:text-[11px] placeholder:font-medium"
                />
                <button 
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[10px] font-black rounded-lg transition-all uppercase"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">To receive:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-base font-black tabular-nums">{toReceive} TON</span>
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
                    <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-white/5" />
              <div className="flex justify-between items-center text-[#8E8E93]">
                <span className="text-[10px] font-black uppercase tracking-widest">Network fee</span>
                <span className="text-white text-xs font-black">{networkFee} TON</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <Button 
                className="w-full h-12 bg-white hover:bg-zinc-200 text-black rounded-xl font-black text-[13px] uppercase tracking-widest transition-all shadow-xl border-0 active:scale-[0.98] disabled:opacity-50"
                onClick={handleWithdrawClick}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Withdraw Now"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full h-10 bg-transparent border-white/10 hover:bg-white/5 text-[#8E8E93] rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors"
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
