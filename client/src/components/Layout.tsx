import { Link, useLocation } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAdmin } from "@/hooks/useAdmin";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Target, Users, Wallet, Trophy } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected } = useWebSocket();
  const { isAdmin } = useAdmin();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Home" },
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
            duration: 0.2,
            ease: "easeOut"
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Modern Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
        <nav className="bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-2 shadow-2xl">
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                      isActive ? "text-[#B9FF66] scale-110" : "text-[#8E8E93] hover:text-white"
                    }`}
                  >
                    <div className={`p-2 rounded-2xl transition-all duration-300 flex items-center gap-2 ${
                      isActive ? "bg-[#B9FF66]/10 shadow-[0_0_20px_rgba(185,255,102,0.15)] px-4" : ""
                    }`}>
                      <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>}
                    </div>
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
