import { Link, useLocation } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAdmin } from "@/hooks/useAdmin";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CheckSquare, Users, Wallet } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected } = useWebSocket();
  const { isAdmin } = useAdmin();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/profile", icon: Users, label: "More" },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Page Content with Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          className="relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Traditional Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-white/5 pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-2 h-16">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors TON{
                    isActive ? "text-[#B9FF66]" : "text-[#8E8E93]"
                  }`}
                >
                  <Icon className={`w-5 h-5 TON{isActive ? "fill-current/10" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                  {isActive && (
                    <div className="absolute top-0 w-8 h-0.5 bg-[#B9FF66] rounded-full shadow-[0_0_10px_rgba(185,255,102,0.5)]" />
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
