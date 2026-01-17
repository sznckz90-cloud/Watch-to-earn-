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
  const [memo, setMemo] = useState("");

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
        withdrawalPackage: "FULL",
        memo: memo.trim() || undefined
      });
      return res.json();
    },
    onSuccess: () => {
      showNotification("Withdrawal request submitted successfully", "success");
      onOpenChange(false);
      setWithdrawAddress("");
      setWithdrawAmount("");
      setMemo("");
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
      showNotification("Insufficient balance", "error");
      return;
    }
    if (!withdrawAddress.trim()) {
      showNotification("Please enter TON address", "error");
      return;
    }
    console.log("Submitting withdrawal:", {
      address: withdrawAddress,
      amount: amount.toString(),
      method: "TON",
      memo: memo.trim() || undefined
    });
    withdrawMutation.mutate();
  };

  const toReceive = withdrawAmount ? Math.max(0, parseFloat(withdrawAmount) - networkFee).toFixed(4) : "0.0000";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d0d0d] border-white/10 text-white w-[95%] max-w-md rounded-[32px] p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">TON withdrawal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-400 font-medium">Address (TON):</Label>
            <Input 
              placeholder="EQDxZjSx4D9gFDL..." 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-[#1a1a1a] border-white/5 h-14 rounded-2xl text-base placeholder:text-gray-600 focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400 font-medium">Amount (TON):</Label>
            <Input 
              type="number"
              placeholder="0.0000" 
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-[#1a1a1a] border-white/5 h-14 rounded-2xl text-base placeholder:text-gray-600 focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400 font-medium text-blue-400 flex justify-between items-center">
              Memo (Optional)
              <span className="text-[10px] text-gray-500 font-normal">(Required for some exchanges)</span>
            </Label>
            <Input 
              placeholder="Memo" 
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="bg-[#1a1a1a] border-white/5 h-14 rounded-2xl text-base placeholder:text-gray-600 focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400 font-medium">To receive (TON):</Label>
            <div className="bg-[#1a1a1a] border-white/5 h-14 rounded-2xl px-4 flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                {toReceive}
              </span>
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              className="w-full h-16 bg-[#4c75ff] hover:bg-[#3d64e0] text-white rounded-[24px] text-lg font-bold shadow-lg shadow-blue-500/10 border-0 transition-all active:scale-[0.98] disabled:opacity-50"
              onClick={handleWithdrawClick}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `Minimum ${minWithdraw} TON`
              )}
            </Button>
          </div>

          <div className="space-y-1.5 pt-2 text-gray-400">
            <p className="text-xs font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Network fee: {networkFee} TON.
            </p>
            <p className="text-xs font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Withdrawal time: ~24 hours.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
