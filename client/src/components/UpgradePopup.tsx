import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, TrendingUp, Clock, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showNotification } from "@/components/AppNotification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  tonAppBalance: string;
}

export default function UpgradePopup({ isOpen, onClose, tonAppBalance }: UpgradePopupProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [tonAmount, setTonAmount] = useState<string>("");
  
  const amount = parseFloat(tonAmount) || 0;
  
  // Constants based on user requirements
  const HRUM_PER_TON = 10000;
  const DURATION_DAYS = 30;
  const DAILY_PROFIT_TON_RATE = 0.1; // 10% daily for calculation clarity based on example
  const ROI_PERCENTAGE = 151.31; // Based on example (0.1 TON -> 0.15 TON total return)

  const dailyProfitTon = amount * DAILY_PROFIT_TON_RATE;
  const dailyProfitHrum = amount * 1000; // 1 TON = 1000 HRUM/day as per server logic
  const hourlyProfitHrum = dailyProfitHrum / 24;
  
  const rawTotalProfitTon = dailyProfitTon * DURATION_DAYS;
  const roiAdjustedTotalProfitTon = amount * (ROI_PERCENTAGE / 100);
  const totalProfitHrum = roiAdjustedTotalProfitTon * HRUM_PER_TON;

  const upgradeMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/mining/upgrade", { tonAmount: amount });
      return res.json();
    },
    onSuccess: () => {
      showNotification("Mining speed boosted! (App Balance used)", "success");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mining/state"] });
      onClose();
    },
    onError: (error: any) => {
      showNotification(error.message || "Failed to upgrade", "error");
    }
  });

  const handleBoost = () => {
    if (amount <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }
    if (amount > parseFloat(tonAppBalance)) {
      showNotification("Insufficient balance", "error");
      return;
    }
    upgradeMutation.mutate(tonAmount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-black/95 w-full max-w-sm rounded-[24px] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Boost Mining</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">Available Balance</Label>
                    <span className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-widest">App Bal: {parseFloat(tonAppBalance).toFixed(3)} TON</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={tonAmount}
                      onChange={(e) => setTonAmount(e.target.value)}
                      className="bg-[#1a1a1a] border-white/5 text-white h-12 rounded-xl focus:ring-[#B9FF66] font-bold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5">
                      <img src="/images/ton.png" alt="TON" className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#8E8E93]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                    </div>
                    <span className="text-white text-xs font-black">{DURATION_DAYS} Days</span>
                  </div>

                  <div className="h-[1px] bg-white/5" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">Mining Power</span>
                      <div className="text-right">
                        <div className="text-[#B9FF66] text-xs font-black">+{hourlyProfitHrum.toFixed(4)} HRUM/h</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">Daily Profit</span>
                      <div className="text-right">
                        <div className="text-white text-xs font-black">{dailyProfitTon.toFixed(3)} TON</div>
                        <div className="text-[#B9FF66] text-[9px] font-bold uppercase">{dailyProfitHrum.toLocaleString()} HRUM/day</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">Total Return</span>
                      <div className="text-right">
                        <div className="text-white text-sm font-black">{roiAdjustedTotalProfitTon.toFixed(3)} TON</div>
                        <div className="text-[#B9FF66] text-[10px] font-bold uppercase">{totalProfitHrum.toLocaleString()} HRUM</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#B9FF66]/10 rounded-xl p-2 flex justify-between items-center border border-[#B9FF66]/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#B9FF66]" />
                      <span className="text-[#B9FF66] text-[10px] font-black uppercase">ROI</span>
                    </div>
                    <span className="text-[#B9FF66] text-xs font-black">{ROI_PERCENTAGE}%</span>
                  </div>
                </div>

                <Button
                  onClick={handleBoost}
                  disabled={upgradeMutation.isPending || amount <= 0}
                  className="w-full h-12 bg-white hover:bg-white/90 text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {upgradeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Boost Mining"}
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full h-10 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-lg font-black text-[10px] uppercase tracking-wider mt-2"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}