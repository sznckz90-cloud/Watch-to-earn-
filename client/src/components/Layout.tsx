import { Link, useLocation } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAdmin } from "@/hooks/useAdmin";
import { motion, AnimatePresence } from "framer-motion";
const CustomHomeIcon = ({ className, isActive }: { className?: string, isActive?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B9FF66" />
        <stop offset="100%" stopColor="#80B542" />
      </linearGradient>
    </defs>
    {isActive ? (
      <>
        <path 
          d="M12 3L21 12L12 21L3 12L12 3Z" 
          fill="url(#homeGradient)" 
          fillOpacity="0.15"
          stroke="url(#homeGradient)" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />
        <path 
          d="M12 8V16M8 12H16" 
          stroke="url(#homeGradient)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
      </>
    ) : (
      <path 
        d="M12 3L21 12L12 21L3 12L12 3Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const CustomMenuIcon = ({ className, isActive }: { className?: string, isActive?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="menuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B9FF66" />
        <stop offset="100%" stopColor="#80B542" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="8" height="8" rx="2" stroke={isActive ? "url(#menuGradient)" : "currentColor"} strokeWidth="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" stroke={isActive ? "url(#menuGradient)" : "currentColor"} strokeWidth="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" stroke={isActive ? "url(#menuGradient)" : "currentColor"} strokeWidth="2" />
    <path d="M13 17H21M17 13V21" stroke={isActive ? "url(#menuGradient)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected } = useWebSocket();
  const { isAdmin } = useAdmin();

  const navItems = [
    { href: "/", icon: CustomHomeIcon, label: "Home" },
    { href: "/profile", icon: CustomMenuIcon, label: "Menu" },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-4">
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <nav className="bg-[#141414]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 h-14 px-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className="relative flex items-center justify-center transition-all duration-500"
                  >
                    <div className={`flex items-center gap-2.5 transition-all duration-500 ease-\[cubic-bezier(0.23,1,0.32,1)\] ${
                      isActive 
                        ? "bg-[#B9FF66] text-black px-5 py-2.5 rounded-[20px] shadow-[0_0_20px_rgba(185,255,102,0.3)]" 
                        : "text-[#555] hover:text-[#888] p-2.5"
                    }`}>
                      <Icon className={`${isActive ? "w-5 h-5" : "w-6 h-6"} transition-transform duration-500`} isActive={isActive} />
                      {isActive && (
                        <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap overflow-hidden">
                          {item.label}
                        </span>
                      )}
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
