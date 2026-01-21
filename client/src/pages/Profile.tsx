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
  const [isLanguageOpen, setIsLanguageOpen] = React.useState(false);

  const languages: { code: Language, name: string, flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const uid = (user as any)?.referralCode || (user as any)?.id?.slice(0, 8) || '00000';

  const copyUid = () => {
    navigator.clipboard.writeText(uid);
    setCopied(true);
    showNotification(t('copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectLanguage = (code: Language) => {
    setLanguage(code);
    setIsLanguageOpen(false);
    showNotification(`Language changed to ${languages.find(l => l.code === code)?.name}`, 'success');
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
          <p className="text-[#B9FF66] font-bold">Last Updated: January 21, 2026</p>
          <p>Welcome to CashWatch. By accessing or using this app, you agree to comply with these Terms & Conditions. If you do not agree, please do not use the app.</p>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">1. Eligibility</h4>
            <p>Users must be at least 13 years old. You represent that you are of legal age to form a binding contract. You are responsible for maintaining the confidentiality of your account and all activities that occur under your account.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">2. Rewards & Earning</h4>
            <p>CashWatch allows users to earn HRUM tokens through various activities including watching ads, completing tasks, and referrals. Rewards are credited to your virtual balance and do not represent legal tender until successfully withdrawn according to our conversion rates and rules.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">3. Withdrawals</h4>
            <p>Withdrawals are subject to system verification, minimum limits, and available liquidity. Users must provide valid wallet addresses. We reserve the right to delay or cancel withdrawals for security audits or suspected fraudulent activity.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">4. Account Suspension & Bans</h4>
            <p>We reserve the right to suspend or permanently ban accounts without prior notice if we detect violations of our policies, including but not limited to: multiple accounts, bot usage, script automation, or exploitation of system bugs.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">5. Fraud & Abuse</h4>
            <p>Any attempt to manipulate the reward system, bypass ad-view requirements, or provide false information during verification will result in immediate termination of the account and forfeiture of all accumulated rewards.</p>
          </div>
        </div>
      )
    },
    privacy: {
      title: t('privacy_policy'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p>CashWatch respects your privacy and is committed to protecting your personal data.</p>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">1. Data Collection</h4>
            <p>We collect essential data to provide our services, including your Telegram User ID (UID), device information (model, OS version), IP address, app usage statistics, and task completion history.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">2. Data Storage & Security</h4>
            <p>Your data is stored securely using industry-standard encryption. We retain your information for as long as your account is active or as needed to provide you with our services and comply with legal obligations.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">3. Third-Party Services</h4>
            <p>We integrate with third-party ad networks (e.g., Monetag, AdGram) and payment gateways. These services may collect non-personal data according to their own privacy policies for the purpose of ad delivery and transaction processing.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic uppercase tracking-tighter">4. Your Rights</h4>
            <p>You have the right to access, correct, or request the deletion of your data. Contact our support team for any privacy-related inquiries.</p>
          </div>
        </div>
      )
    },
    acceptable: {
      title: t('acceptable_use'),
      content: (
        <div className="space-y-4 text-gray-400 text-sm">
          <p>To maintain a fair ecosystem for all users, you must adhere to the following rules:</p>
          <div>
            <h4 className="text-rose-400 font-bold mb-1 flex items-center gap-2 italic uppercase tracking-tighter">
              Prohibited Actions
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Creating or managing multiple accounts for a single user.</li>
              <li>Using automated bots, scripts, or any third-party software to simulate activity.</li>
              <li>Exploiting technical vulnerabilities or bugs for unauthorized gain.</li>
              <li>Bypassing or attempting to circumvent ad-watching requirements.</li>
              <li>Reverse-engineering, decompiling, or attempting to extract source code from the app.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 flex items-center gap-2 italic uppercase tracking-tighter">
              <ShieldCheck className="w-4 h-4 text-[#B9FF66]" />
              Multi-Account Abuse
            </h4>
            <p>Our system employs advanced detection for multi-account activity. Users found operating multiple profiles to inflate referral rewards or daily earnings will face permanent bans across all linked accounts.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 flex items-center gap-2 italic uppercase tracking-tighter">
              <Check className="w-4 h-4 text-green-500" />
              Compliance
            </h4>
            <p>All users must use the app in compliance with applicable local and international laws. We cooperate with law enforcement agencies in cases of suspected illegal activity.</p>
          </div>
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
            <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">{t('user_account')}</span>
            <span className="text-[#B9FF66] text-[10px] font-black uppercase tracking-widest">{t('active')}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
              <p className="text-[9px] text-[#8E8E93] font-semibold uppercase tracking-wider mb-1">{t('hrum_balance')}</p>
              <div className="flex items-center gap-1.5">
                <img src="/hrum-coin.png" alt="HRUM" className="w-4 h-4" onError={(e) => (e.currentTarget.src = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Golden%20Coin.png")} />
                <p className="text-lg font-black text-[#B9FF66]">{Math.floor(parseFloat((user as any)?.balance || "0")).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
              <p className="text-[9px] text-[#8E8E93] font-semibold uppercase tracking-wider mb-1">{t('user_uid')}</p>
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
            <h3 className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-3 px-1">{t('account_localization')}</h3>
            <div className="space-y-2">
              <ProfileItem 
                icon={<Languages className="w-4 h-4 text-purple-400" />} 
                label={t('app_language')} 
                value={languages.find(l => l.code === language)?.name}
                onClick={() => setIsLanguageOpen(true)}
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
            <h3 className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-3 px-1">{t('support_legal')}</h3>
            <div className="space-y-2">
              <ProfileItem 
                icon={<MessageSquare className="w-4 h-4 text-blue-400" />} 
                label={t('contact_support')} 
                onClick={() => openLink('http://t.me/szxzyz')}
              />
              <ProfileItem 
                icon={<Shield className="w-4 h-4 text-emerald-400" />} 
                label={t('terms_conditions')} 
                onClick={() => setSelectedLegal('terms')}
              />
              <ProfileItem 
                icon={<FileText className="w-4 h-4 text-orange-400" />} 
                label={t('privacy_policy')} 
                onClick={() => setSelectedLegal('privacy')}
              />
              <ProfileItem 
                icon={<HelpCircle className="w-4 h-4 text-rose-400" />} 
                label={t('acceptable_use')} 
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
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {legalContent[selectedLegal].content}
              </div>
              <div className="p-6 border-t border-white/5">
                <Button 
                  className="w-full h-14 bg-[#141414] border border-white/5 rounded-2xl font-black uppercase italic tracking-wider text-white"
                  onClick={() => setSelectedLegal(null)}
                >
                  {t('back')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Language Selection Overlay */}
        <AnimatePresence>
          {isLanguageOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-[#050505] z-[100] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">
                  {t('app_language')}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsLanguageOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      language === lang.code 
                        ? "bg-[#B9FF66]/10 border-[#B9FF66] text-[#B9FF66]" 
                        : "bg-[#141414] border-white/5 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-bold">{lang.name}</span>
                    </div>
                    {language === lang.code && <Check className="w-5 h-5" />}
                  </button>
                ))}
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
