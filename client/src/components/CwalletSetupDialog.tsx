import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, HelpCircle, Info, Lock, Check, Gem, DollarSign, Star } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { showNotification } from "@/components/AppNotification";
import { apiRequest } from "@/lib/queryClient";

interface CwalletSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WalletType = '' | 'TONT' | 'STARS';

export default function CwalletSetupDialog({ open, onOpenChange }: CwalletSetupDialogProps) {
  const queryClient = useQueryClient();
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('');
  
  //  wallet states
  const [tonWalletId, setTonWalletId] = useState('');
  const [newTonWalletId, setNewTonWalletId] = useState('');
  const [isChangingTonWallet, setIsChangingTonWallet] = useState(false);
  
  // TONT wallet states
  const [usdtWalletAddress, setUsdtWalletAddress] = useState('');
  const [newUsdtWalletAddress, setNewUsdtWalletAddress] = useState('');
  const [isChangingUsdtWallet, setIsChangingUsdtWallet] = useState(false);
  
  // Telegram Stars states
  const [telegramUsername, setTelegramUsername] = useState('');
  const [newTelegramUsername, setNewTelegramUsername] = useState('');
  const [isChangingStarsUsername, setIsChangingStarsUsername] = useState(false);

  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: appSettings } = useQuery<any>({
    queryKey: ['/api/app-settings'],
    retry: false,
  });

  const walletChangeFee = appSettings?.walletChangeFee || 5000;

  useEffect(() => {
    if (user?.cwalletId) {
      setTonWalletId(user.cwalletId);
    }
    if (user?.usdtWalletAddress) {
      setUsdtWalletAddress(user.usdtWalletAddress);
    }
    if (user?.telegramStarsUsername) {
      setTelegramUsername(user.telegramStarsUsername);
    }
  }, [user]);
  
  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setIsChangingTonWallet(false);
      setNewTonWalletId('');
      setIsChangingUsdtWallet(false);
      setNewUsdtWalletAddress('');
      setIsChangingStarsUsername(false);
      setNewTelegramUsername('');
    }
  }, [open]);

  //  wallet mutations
  const saveTonWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wallet/cwallet', {
        cwalletId: tonWalletId.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      showNotification(" wallet saved successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const changeTonWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wallet/change', {
        newWalletId: newTonWalletId.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      showNotification(" wallet updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsChangingTonWallet(false);
      setNewTonWalletId('');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  // TONT wallet mutations
  const saveUsdtWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wallet/usdt', {
        usdtAddress: usdtWalletAddress.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      showNotification("TONT wallet saved successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const changeUsdtWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wallet/usdt', {
        usdtAddress: newUsdtWalletAddress.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      showNotification("TONT wallet updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsChangingUsdtWallet(false);
      setNewUsdtWalletAddress('');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  // Telegram Stars mutations
  const saveTelegramStarsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wallet/telegram-stars', {
        telegramUsername: telegramUsername.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      showNotification("Telegram username saved successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const changeTelegramStarsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wallet/telegram-stars', {
        telegramUsername: newTelegramUsername.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      showNotification("Telegram username updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsChangingStarsUsername(false);
      setNewTelegramUsername('');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const handleSaveTonWallet = () => {
    if (!tonWalletId.trim()) {
      showNotification("Please enter your  wallet address", "error");
      return;
    }
    
    // Validate  wallet address (must start with UQ or EQ)
    if (!/^(UQ|EQ)[A-Za-z0-9_-]{46}/.test(tonWalletId.trim())) {
      showNotification("Please enter a valid  wallet address", "error");
      return;
    }
    
    saveTonWalletMutation.mutate();
  };

  const handleChangeTonWallet = () => {
    if (!newTonWalletId.trim()) {
      showNotification("Please enter a new  wallet address", "error");
      return;
    }
    
    // Validate  wallet address (must start with UQ or EQ)
    if (!/^(UQ|EQ)[A-Za-z0-9_-]{46}/.test(newTonWalletId.trim())) {
      showNotification("Please enter a valid  wallet address", "error");
      return;
    }
    
    changeTonWalletMutation.mutate();
  };

  const handleSaveUsdtWallet = () => {
    if (!usdtWalletAddress.trim()) {
      showNotification("Please enter your TONT wallet address", "error");
      return;
    }
    
    // Validate Optimism TONT address (0x... format, 42 characters)
    if (!/^0x[a-fA-F0-9]{40}/.test(usdtWalletAddress.trim())) {
      showNotification("Please enter a valid Optimism TONT address (0x...)", "error");
      return;
    }
    
    saveUsdtWalletMutation.mutate();
  };

  const handleChangeUsdtWallet = () => {
    if (!newUsdtWalletAddress.trim()) {
      showNotification("Please enter a new TONT wallet address", "error");
      return;
    }
    
    // Validate Optimism TONT address
    if (!/^0x[a-fA-F0-9]{40}/.test(newUsdtWalletAddress.trim())) {
      showNotification("Please enter a valid Optimism TONT address (0x...)", "error");
      return;
    }
    
    changeUsdtWalletMutation.mutate();
  };

  const handleSaveTelegramStars = () => {
    if (!telegramUsername.trim()) {
      showNotification("Please enter your Telegram username", "error");
      return;
    }
    
    saveTelegramStarsMutation.mutate();
  };

  const handleChangeTelegramStars = () => {
    if (!newTelegramUsername.trim()) {
      showNotification("Please enter a new Telegram username", "error");
      return;
    }
    
    changeTelegramStarsMutation.mutate();
  };

  const isTonWalletSet = !!user?.cwalletId;
  const isUsdtWalletSet = !!user?.usdtWalletAddress;
  const isTelegramStarsSet = !!user?.telegramStarsUsername;

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        className="sm:max-w-md frosted-glass border border-white/10 rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#4cd3ff] text-lg">
            <Wallet className="w-5 h-5" />
            Setup Wallets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Type Selector - List View */}
          <div className="space-y-2">
            <label className="text-xs text-[#c0c0c0]">Select Wallet Type</label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedWalletType('')}
                className={`w-full flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  selectedWalletType === ''
                    ? 'border-[#4cd3ff] bg-[#4cd3ff]/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#4cd3ff]/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedWalletType === '' ? 'border-[#4cd3ff] bg-[#4cd3ff]' : 'border-[#aaa]'
                }`}>
                  {selectedWalletType === '' && <Check className="w-3 h-3 text-black" />}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Gem className="w-5 h-5 text-[#4cd3ff]" />
                  <span className="text-white"> Wallet</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedWalletType('TONT')}
                className={`w-full flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  selectedWalletType === 'TONT'
                    ? 'border-[#4cd3ff] bg-[#4cd3ff]/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#4cd3ff]/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedWalletType === 'TONT' ? 'border-[#4cd3ff] bg-[#4cd3ff]' : 'border-[#aaa]'
                }`}>
                  {selectedWalletType === 'TONT' && <Check className="w-3 h-3 text-black" />}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#4cd3ff]" />
                  <span className="text-white">TONT (Optimism)</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedWalletType('STARS')}
                className={`w-full flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  selectedWalletType === 'STARS'
                    ? 'border-[#4cd3ff] bg-[#4cd3ff]/10'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#4cd3ff]/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedWalletType === 'STARS' ? 'border-[#4cd3ff] bg-[#4cd3ff]' : 'border-[#aaa]'
                }`}>
                  {selectedWalletType === 'STARS' && <Check className="w-3 h-3 text-black" />}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#4cd3ff]" />
                  <span className="text-white">Telegram Stars</span>
                </div>
              </button>
            </div>
          </div>

          {/*  Wallet Section */}
          {selectedWalletType === '' && (
            <>
              {isTonWalletSet && !isChangingTonWallet ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Check className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-green-500"> wallet linked successfully</p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={tonWalletId}
                      disabled={true}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              ) : isChangingTonWallet ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-[#c0c0c0]">Current Wallet</label>
                    <Input
                      type="text"
                      value={tonWalletId}
                      disabled={true}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#c0c0c0]">New  Wallet Address</label>
                    <Input
                      type="text"
                      placeholder="Enter  wallet address (UQ... or EQ...)"
                      value={newTonWalletId}
                      onChange={(e) => setNewTonWalletId(e.target.value)}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-[#4cd3ff]/10 rounded-lg border border-[#4cd3ff]/30">
                    <Info className="w-4 h-4 text-[#4cd3ff] mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-[#c0c0c0]">
                      Fee: <span className="text-[#4cd3ff] font-semibold">{walletChangeFee} Hrum</span> will be deducted
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#c0c0c0]">
                    <span className="text-red-500 font-semibold">One time setup</span> • Used for  withdrawals
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter  wallet address (UQ... or EQ...)"
                      value={tonWalletId}
                      onChange={(e) => setTonWalletId(e.target.value)}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11"
                    />
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Set carefully – one-time setup only!
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-[#0d0d0d] rounded-lg border border-white/5">
                    <HelpCircle className="w-4 h-4 text-[#4cd3ff] mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-[#c0c0c0]">
                      Don't have a  wallet?{' '}
                      <a 
                        href="https://ton.org/wallets" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#4cd3ff] hover:text-[#6ddeff] underline transition-colors"
                      >
                        Get one here
                      </a>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* TONT Wallet Section */}
          {selectedWalletType === 'TONT' && (
            <>
              {isUsdtWalletSet && !isChangingUsdtWallet ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Check className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-green-500">TONT wallet linked successfully</p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={usdtWalletAddress}
                      disabled={true}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              ) : isChangingUsdtWallet ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-[#c0c0c0]">Current Wallet</label>
                    <Input
                      type="text"
                      value={usdtWalletAddress}
                      disabled={true}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#c0c0c0]">New TONT Wallet Address</label>
                    <Input
                      type="text"
                      placeholder="Enter TONT wallet address (0x...)"
                      value={newUsdtWalletAddress}
                      onChange={(e) => setNewUsdtWalletAddress(e.target.value)}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-[#4cd3ff]/10 rounded-lg border border-[#4cd3ff]/30">
                    <Info className="w-4 h-4 text-[#4cd3ff] mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-[#c0c0c0]">
                      Fee: <span className="text-[#4cd3ff] font-semibold">{walletChangeFee} Hrum</span> will be deducted
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#c0c0c0]">
                    Set up your <span className="text-[#4cd3ff] font-semibold">Optimism Network</span> TONT wallet
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter TONT wallet address (0x...)"
                      value={usdtWalletAddress}
                      onChange={(e) => setUsdtWalletAddress(e.target.value)}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11"
                    />
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Optimism network only – not TRON, BNB, or Ethereum
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-[#0d0d0d] rounded-lg border border-white/5">
                    <HelpCircle className="w-4 h-4 text-[#4cd3ff] mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-[#c0c0c0]">
                      Need an Optimism wallet?{' '}
                      <a 
                        href="https://www.optimism.io/apps/wallets" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#4cd3ff] hover:text-[#6ddeff] underline transition-colors"
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Telegram Stars Section */}
          {selectedWalletType === 'STARS' && (
            <>
              {isTelegramStarsSet && !isChangingStarsUsername ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Check className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-green-500">Telegram username set successfully</p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={telegramUsername}
                      disabled={true}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              ) : isChangingStarsUsername ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-[#c0c0c0]">Current Username</label>
                    <Input
                      type="text"
                      value={telegramUsername}
                      disabled={true}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#c0c0c0]">New Telegram Username</label>
                    <Input
                      type="text"
                      placeholder="Your Telegram username (e.g., szxzyz)"
                      value={newTelegramUsername}
                      onChange={(e) => setNewTelegramUsername(e.target.value)}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-[#4cd3ff]/10 rounded-lg border border-[#4cd3ff]/30">
                    <Info className="w-4 h-4 text-[#4cd3ff] mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-[#c0c0c0]">
                      Fee: <span className="text-[#4cd3ff] font-semibold">{walletChangeFee} Hrum</span> will be deducted
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#c0c0c0]">
                    Enter your Telegram username for <span className="text-[#4cd3ff] font-semibold">Stars</span> withdrawals
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Your Telegram username (e.g., szxzyz)"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="bg-[#0d0d0d] border-white/20 text-white placeholder:text-[#808080] focus:border-[#4cd3ff] transition-colors rounded-lg h-11"
                    />
                    <p className="text-xs text-[#c0c0c0] flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      @ will be added automatically. Letters, numbers, and underscores only.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {selectedWalletType === '' && isTonWalletSet && !isChangingTonWallet ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsChangingTonWallet(true)}
                className="flex-1 bg-transparent border-[#4cd3ff]/50 text-[#4cd3ff] hover:bg-[#4cd3ff]/10"
              >
                Change Wallet
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                Close
              </Button>
            </>
          ) : selectedWalletType === '' && isChangingTonWallet ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingTonWallet(false);
                  setNewTonWalletId('');
                }}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangeTonWallet}
                disabled={changeTonWalletMutation.isPending}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                {changeTonWalletMutation.isPending ? "Processing..." : `Pay ${walletChangeFee} Hrum & Confirm`}
              </Button>
            </>
          ) : selectedWalletType === '' && !isTonWalletSet ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTonWallet}
                disabled={saveTonWalletMutation.isPending}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                {saveTonWalletMutation.isPending ? "Saving..." : "Save  Wallet"}
              </Button>
            </>
          ) : selectedWalletType === 'TONT' && isUsdtWalletSet && !isChangingUsdtWallet ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsChangingUsdtWallet(true)}
                className="flex-1 bg-transparent border-[#4cd3ff]/50 text-[#4cd3ff] hover:bg-[#4cd3ff]/10"
              >
                Change Wallet
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                Close
              </Button>
            </>
          ) : selectedWalletType === 'TONT' && isChangingUsdtWallet ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingUsdtWallet(false);
                  setNewUsdtWalletAddress('');
                }}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangeUsdtWallet}
                disabled={changeUsdtWalletMutation.isPending}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                {changeUsdtWalletMutation.isPending ? "Processing..." : "Update TONT Wallet"}
              </Button>
            </>
          ) : selectedWalletType === 'TONT' && !isUsdtWalletSet ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUsdtWallet}
                disabled={saveUsdtWalletMutation.isPending}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                {saveUsdtWalletMutation.isPending ? "Saving..." : "Save TONT Wallet"}
              </Button>
            </>
          ) : selectedWalletType === 'STARS' && isTelegramStarsSet && !isChangingStarsUsername ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsChangingStarsUsername(true)}
                className="flex-1 bg-transparent border-[#4cd3ff]/50 text-[#4cd3ff] hover:bg-[#4cd3ff]/10"
              >
                Change Username
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                Close
              </Button>
            </>
          ) : selectedWalletType === 'STARS' && isChangingStarsUsername ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingStarsUsername(false);
                  setNewTelegramUsername('');
                }}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangeTelegramStars}
                disabled={changeTelegramStarsMutation.isPending}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                {changeTelegramStarsMutation.isPending ? "Processing..." : "Update Username"}
              </Button>
            </>
          ) : selectedWalletType === 'STARS' && !isTelegramStarsSet ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTelegramStars}
                disabled={saveTelegramStarsMutation.isPending}
                className="flex-1 bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
              >
                {saveTelegramStarsMutation.isPending ? "Saving..." : "Save Username"}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-[#4cd3ff] hover:bg-[#6ddeff] text-black font-semibold"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
