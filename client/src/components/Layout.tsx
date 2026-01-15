import { Link, useLocation } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAdmin } from "@/hooks/useAdmin";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CircleDollarSign, User, Plus, LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { useSeasonEnd } from "@/lib/SeasonEndContext";
import BanScreen from "@/components/BanScreen";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected } = useWebSocket();
  const { isAdmin } = useAdmin();
  const { showSeasonEnd } = useSeasonEnd();

  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  if (user?.banned) {
    return <BanScreen reason={user.bannedReason} />;
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "EARN" },
    { href: "/withdraw", icon: CircleDollarSign, label: "PAYOUT" },
  ];

  // Get photo from Telegram WebApp first, then fallback to user data
  const telegramPhotoUrl = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
  const userPhotoUrl = telegramPhotoUrl || user?.profileImageUrl || user?.profileUrl || null;
  const isHomeActive = location === "/";

  return (
    <div className="h-screen w-full flex flex-col bg-[#1A0D00] overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ paddingTop: '64px', paddingBottom: '85px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.1,
              ease: "easeOut"
            }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {!showSeasonEnd && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#261400] border-t border-[#B34700]/30 pb-[env(safe-area-inset-bottom,12px)]">
          <div className="max-w-md mx-auto px-4">
            <div className="flex justify-around items-center py-2.5 pb-3">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex flex-col items-center justify-center min-w-[60px] min-h-[52px] transition-all active:scale-90 ${
                        isActive 
                          ? "text-[#F2B824]" 
                          : "text-[#D1D5DB] hover:text-[#FFFFFF]"
                      }`}
                    >
                      <Icon 
                        className="w-7 h-7 transition-all mb-[8px]"
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className={`text-[11px] font-bold ${isActive ? 'text-[#F2B824]' : ''}`}>
                        {item.label}
                      </span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
