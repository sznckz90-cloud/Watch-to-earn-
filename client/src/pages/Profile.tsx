import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { 
  User as UserIcon, 
  Copy, 
  Globe, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  Check, 
  ChevronRight, 
  RefreshCw,
  LogOut,
  Settings,
  Bell,
  HelpCircle,
  Shield,
  Languages,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { showNotification } from "@/components/AppNotification";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [copied, setCopied] = React.useState(false);
  const [selectedLegal, setSelectedLegal] = React.useState<string | null>(null);

  const uid = (user as any)?.referralCode || (user as any)?.id?.slice(0, 8) || '00000';

  const copyUid = () => {
    navigator.clipboard.writeText(uid);
    setCopied(true);
    showNotification(t('copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
    showNotification(language === 'en' ? 'Language changed to Russian' : 'Language changed to English', 'success');
  };

  const openLink = (url: string) => {
    if ((window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const legalContent: Record<string, { title: string, content: React.ReactNode }> = {
    terms: {
      title: t('terms_conditions'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p className="text-[#B9FF66] font-bold">Last Updated: January 19, 2026</p>
          <p>By using CashWatch, you agree to these terms. Tokens earned are for platform use and subject to withdrawal rules.</p>
          <div>
            <h4 className="text-white font-bold mb-1">1. Eligibility</h4>
            <p>Users must be at least 13 years old. You are responsible for your account.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">2. Rewards</h4>
            <p>Abuse of rewards, bots, or multiple accounts will result in immediate ban without refund.</p>
          </div>
        </div>
      )
    },
    privacy: {
      title: t('privacy_policy'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p>We value your privacy. We only collect necessary data for app functionality.</p>
          <div>
            <h4 className="text-white font-bold mb-1">Data Collection</h4>
            <p>We collect Telegram ID, referral data, and task activity.</p>
          </div>
        </div>
      )
    },
    acceptable: {
      title: t('acceptable_use'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p>Prohibited: Bots, scripts, multiple accounts, and bug exploitation.</p>
        </div>
      )
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-transparent text-white p-4 space-y-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center overflow-hidden">
              {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url ? (
                <img 
                  src={(window as any).Telegram.WebApp.initDataUnsafe.user.photo_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    if (e.target instanceof HTMLElement && e.target.parentElement) {
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-[#B9FF66] to-[#80B542] flex items-center justify-center text-black font-black text-xs">{(user as any)?.firstName?.[0] || "U"}</div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#B9FF66] to-[#80B542] flex items-center justify-center text-black font-black text-xs">
                  {(user as any)?.firstName?.[0] || 'U'}
                </div>
              )}
            </div>
            <span className="font-black italic uppercase tracking-tighter text-sm">{(user as any)?.firstName || (user as any)?.username || 'User'}</span>
          </div>
        </div>

        {/* User Info Card - Simplified to match Home page style */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">USER ACCOUNT</span>
            <span className="text-[#B9FF66] text-[10px] font-black uppercase tracking-widest">ACTIVE</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
              <p className="text-[9px] text-[#8E8E93] font-semibold uppercase tracking-wider mb-1">HRUM Balance</p>
              <p className="text-lg font-black text-[#B9FF66]">{Math.floor(parseFloat((user as any)?.balance || "0")).toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
              <p className="text-[9px] text-[#8E8E93] font-semibold uppercase tracking-wider mb-1">User UID</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-white">{uid}</p>
                <button onClick={copyUid} className="text-[#B9FF66]">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-4">
          <section>
            <h3 className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-3 px-1">Account & Localization</h3>
            <div className="space-y-2">
              <ProfileItem 
                icon={<Languages className="w-4 h-4 text-purple-400" />} 
                label={`App Language`} 
                value={language === 'en' ? 'English' : 'Russian'}
                onClick={toggleLanguage}
              />
              {(user as any)?.isAdmin && (
                <ProfileItem 
                  icon={<ShieldCheck className="w-4 h-4 text-red-500" />} 
                  label="Admin Control Panel" 
                  onClick={() => window.location.href = '/admin'}
                />
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-3 px-1">Support & Legal</h3>
            <div className="space-y-2">
              <ProfileItem 
                icon={<MessageSquare className="w-4 h-4 text-blue-400" />} 
                label="Contact Support" 
                onClick={() => openLink('http://t.me/szxzyz')}
              />
              <ProfileItem 
                icon={<Shield className="w-4 h-4 text-emerald-400" />} 
                label="Terms & Conditions" 
                onClick={() => setSelectedLegal('terms')}
              />
              <ProfileItem 
                icon={<FileText className="w-4 h-4 text-orange-400" />} 
                label="Privacy Policy" 
                onClick={() => setSelectedLegal('privacy')}
              />
              <ProfileItem 
                icon={<HelpCircle className="w-4 h-4 text-rose-400" />} 
                label="Acceptable Use" 
                onClick={() => setSelectedLegal('acceptable')}
              />
            </div>
          </section>
        </div>


        {/* Legal Overlay */}
        <AnimatePresence>
          {selectedLegal && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-[#050505] z-[100] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">
                  {legalContent[selectedLegal].title}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLegal(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {legalContent[selectedLegal].content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function ProfileItem({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value?: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-[#141414] border border-white/5 rounded-xl p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-bold text-[13px] text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[10px] font-black text-[#B9FF66] bg-[#B9FF66]/10 px-2 py-0.5 rounded-md uppercase">{value}</span>}
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
      </div>
    </button>
  );
}
