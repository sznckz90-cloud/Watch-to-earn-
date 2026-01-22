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
          // Check if it's a JSON string from apiRequest
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
    if (amount > tonBalance) {
      showNotification(`Insufficient balance. Available: ${tonBalance} TON`, "error");
      return;
    }
    if (!withdrawAddress.trim()) {
      showNotification("Please enter TON address", "error");
      return;
    }
    console.log("Submitting withdrawal:", {
      address: withdrawAddress,
      amount: amount.toString(),
      method: "TON"
    });
    withdrawMutation.mutate();
  };

  const toReceive = withdrawAmount ? Math.max(0, parseFloat(withdrawAmount) - networkFee).toFixed(4) : "0.0000";

  const handleMaxClick = () => {
    setWithdrawAmount(tonBalance.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#0d0d0d] border-white/5 text-white w-[95%] max-w-[320px] rounded-[24px] p-6 shadow-2xl backdrop-blur-sm [&>button]:hidden">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-xl font-black text-center uppercase tracking-tight">TON withdrawal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Address (TON):</Label>
            <Input 
              placeholder="" 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-white/5 border-white/10 h-11 rounded-xl text-sm placeholder:text-zinc-600 focus:border-blue-500/50 transition-all font-black"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Amount (TON):</Label>
            <div className="relative">
              <Input 
                type="number"
                placeholder="0.0000" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-white/5 border-white/10 h-11 rounded-xl text-sm placeholder:text-zinc-600 focus:border-blue-500/50 transition-all font-black pr-16"
              />
              <button 
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[10px] font-black rounded-md transition-all uppercase"
              >
                Max
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold ml-1">
              Available: <span className="text-zinc-300">{Number(tonBalance).toFixed(4)} TON</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">To receive (TON):</Label>
            <div className="bg-white/5 border-white/10 h-11 rounded-xl px-4 flex items-center justify-between">
              <span className="text-sm font-black text-white tabular-nums">
                {toReceive}
              </span>
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
                <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-white/5 border-0 active:scale-[0.98] disabled:opacity-50"
              onClick={handleWithdrawClick}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Withdraw Now"
              )}
            </Button>
          </div>

          <div className="pt-3 border-t border-white/5 mt-1 space-y-1.5">
            <p className="text-[9px] font-black flex items-center gap-1.5 uppercase tracking-wider text-zinc-500">
              <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
              Network fee: {networkFee} TON
            </p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-lg font-black text-[10px] uppercase tracking-wider"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
