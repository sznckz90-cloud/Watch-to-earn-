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
    retry: false,
    staleTime: 30000,
  });

  const minWithdraw = parseFloat(appSettings?.minWithdrawal || "0.10");
  const networkFee = parseFloat(appSettings?.withdrawalFee || "0.01");

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/withdrawals", {
        address: withdrawAddress,
        amount: parseFloat(withdrawAmount).toString(),
        method: "TON",
        withdrawalPackage: "FULL"
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
    onError: (error: Error) => {
      showNotification(error.message, "error");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="bg-[#0d0d0d] border-white/5 text-white w-[95%] max-w-[320px] rounded-[24px] p-6 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-xl font-black text-center uppercase tracking-tight">TON withdrawal</DialogTitle>
          <p className="text-[11px] text-zinc-400 text-center font-bold leading-relaxed px-1 mt-1">
            Withdraw your earned TON to your personal wallet instantly.
          </p>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Address (TON):</Label>
            <Input 
              placeholder="EQDxZjSx4D9gFDL..." 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-white/5 border-white/10 h-11 rounded-xl text-sm placeholder:text-zinc-600 focus:border-blue-500/50 transition-all font-black"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Amount (TON):</Label>
            <Input 
              type="number"
              placeholder="0.0000" 
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-white/5 border-white/10 h-11 rounded-xl text-sm placeholder:text-zinc-600 focus:border-blue-500/50 transition-all font-black"
            />
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
