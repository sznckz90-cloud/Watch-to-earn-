import { Link, useLocation } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/hooks/useLanguage";
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

const CustomShopIcon = ({ className, isActive }: { className?: string, isActive?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="shopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B9FF66" />
        <stop offset="100%" stopColor="#80B542" />
      </linearGradient>
    </defs>
    <path 
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" 
      stroke={isActive ? "url(#shopGradient)" : "currentColor"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M3 6H21" 
      stroke={isActive ? "url(#shopGradient)" : "currentColor"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" 
      stroke={isActive ? "url(#shopGradient)" : "currentColor"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected } = useWebSocket();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", icon: CustomHomeIcon, label: t('home') },
    { href: "/profile", icon: CustomMenuIcon, label: t('menu') },
  ];

  const isHomePage = location === "/";

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
        <nav className="bg-[#141414]/90 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 h-12 px-1 justify-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className="relative flex items-center justify-center transition-all duration-300"
                  >
                    <div className={`flex items-center gap-2 transition-all duration-300 ease-out ${
                      isActive 
                        ? "bg-white text-black px-5 py-2 rounded-full shadow-lg" 
                        : "text-gray-500 hover:text-gray-300 px-4 py-2"
                    }`}>
                      <Icon className={`${isActive ? "w-4 h-4" : "w-5 h-5"} transition-transform duration-300`} isActive={isActive} />
                      <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? "max-w-[80px] opacity-100" : "max-w-0 opacity-0"}`}>
                        {item.label}
                      </span>
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
