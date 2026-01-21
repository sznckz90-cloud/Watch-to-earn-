import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, Info } from 'lucide-react';
import { showNotification } from '@/components/AppNotification';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface TopUpPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  telegramId: string;
}

export default function TopUpPopup({ open, onOpenChange, telegramId }: TopUpPopupProps) {
  const [amount, setAmount] = useState('');
  const adminAddress = "UQAiuvbhsGT8EEHl2koLD6vex4mWVFFun3fLfunLJ2y_Xj0-";

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create deposit');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deposits'] });
      showNotification('Deposit request submitted! Waiting for admin approval.', 'success');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, 'error');
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showNotification(`${label} copied!`, 'success');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-[90vw] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-center">Top Up TON</DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs text-center font-bold uppercase tracking-wider">
            Manual Deposit with Admin Approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Amount (TON)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-900 border-white/5 rounded-xl h-12 font-bold text-white focus:ring-[#B9FF66]/20"
            />
          </div>

          <div className="bg-[#B9FF66]/5 border border-[#B9FF66]/10 rounded-2xl p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-[#B9FF66] uppercase tracking-widest">Admin TON Address</p>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-white/5">
                <code className="text-[10px] font-mono text-zinc-300 break-all flex-1">{adminAddress}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#B9FF66]" onClick={() => copyToClipboard(adminAddress, 'Address')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-black text-[#B9FF66] uppercase tracking-widest">Memo (Required)</p>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-white/5">
                <code className="text-[10px] font-mono text-zinc-300 flex-1">{telegramId}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#B9FF66]" onClick={() => copyToClipboard(telegramId, 'Memo')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-[10px] text-blue-200 leading-relaxed font-medium">
              Manually send TON from your wallet using the address and memo above. Click confirm after sending.
            </p>
          </div>

          <Button
            onClick={() => depositMutation.mutate(amount)}
            disabled={!amount || parseFloat(amount) <= 0 || depositMutation.isPending}
            className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black uppercase italic tracking-wider rounded-2xl transition-all"
          >
            {depositMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Deposit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
