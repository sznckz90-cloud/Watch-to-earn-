import { useBotStats, useTriggerScheduler } from "@/hooks/use-bot";
import { FeatureCard } from "@/components/FeatureCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Send, 
  BarChart3,
  Terminal,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { data: stats, isLoading } = useBotStats();
  const { mutate: triggerScheduler, isPending: isTriggering } = useTriggerScheduler();
  const { toast } = useToast();

  const handleSimulate = () => {
    triggerScheduler(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Scheduler Triggered",
          description: data.message,
          variant: "default",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to trigger update cycle.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[url('/grid.svg')] bg-fixed bg-center">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header / Nav */}
        <nav className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-2 text-2xl font-bold font-display">
            <div className="bg-gradient-to-tr from-primary to-accent p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-white">Crypto<span className="text-primary">Bot</span></span>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2 border-white/10 hover:bg-white/5">
            <Terminal className="w-4 h-4" />
            Documentation
          </Button>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-block mb-6">
              <StatusBadge status={stats?.status || "loading"} count={stats?.activeUsers} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block"
              >
                Automated
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gradient block"
              >
                Crypto Updates
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="block"
              >
                for Telegram.
              </motion.span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Never miss a price movement. Get real-time cryptocurrency updates delivered directly to your Telegram channels and groups. Powered by PostgreSQL.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 glow transition-all duration-200 w-full sm:w-auto">
                  Add to Telegram <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="h-14 px-8 text-lg rounded-xl bg-card border border-white/10 hover:bg-white/5 w-full sm:w-auto"
                  onClick={handleSimulate}
                  disabled={isTriggering}
                >
                  {isTriggering ? (
                    <span className="animate-pulse">Triggering...</span>
                  ) : (
                    <>
                      <Zap className="mr-2 w-5 h-5 text-accent" />
                      Test Scheduler
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-md lg:max-w-full"
          >
            <div className="relative mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-20 transform rotate-6 rounded-3xl" />
              <div className="relative bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Mock Telegram Interface */}
                <div className="bg-[#242424] px-4 py-3 flex items-center gap-3 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">CB</div>
                  <div>
                    <div className="font-bold text-white">Crypto Bot</div>
                    <div className="text-xs text-blue-400">bot</div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-[#2b2b2b] p-4 rounded-xl rounded-tl-none max-w-[85%] border border-white/5"
                  >
                    <p className="text-sm text-gray-300 font-mono mb-3">
                      📊 <span className="text-white font-bold">BITCOIN</span> LIVE PRICE
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white font-bold">$64,231.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Change:</span>
                        <span className="text-emerald-400 font-bold">+2.34% 🚀</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Updated 1 min ago
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="bg-[#2b2b2b] p-4 rounded-xl rounded-tl-none max-w-[85%] border border-white/5"
                  >
                    <p className="text-sm text-gray-300 font-mono mb-3">
                      📊 <span className="text-white font-bold">ETHEREUM</span> LIVE PRICE
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white font-bold">$3,452.12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Change:</span>
                        <span className="text-rose-400 font-bold">-0.85% 📉</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <div className="bg-[#242424] px-4 py-3 text-center text-xs text-gray-500 border-t border-white/5">
                  Bot is running active cycle
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <FeatureCard 
            icon={Zap}
            title="Real-time Updates"
            description="Fetch the latest prices from CoinGecko API with zero latency. Supports all major cryptocurrencies."
            delay={0.1}
          />
          <FeatureCard 
            icon={Clock}
            title="Custom Intervals"
            description="Set your own update frequency. Choose from 1 minute, 5 minutes, or hourly updates to suit your needs."
            delay={0.2}
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="PostgreSQL Powered"
            description="Built on robust PostgreSQL infrastructure for 99.9% uptime and enterprise-grade reliability."
            delay={0.3}
          />
        </div>

        {/* How it works */}
        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 -z-10" />

            {[
              { icon: Send, title: "Add to Channel", text: "Add the bot to your Telegram channel or group." },
              { icon: ShieldCheck, title: "Grant Admin", text: "Give the bot permission to post messages." },
              { icon: Terminal, title: "Configure", text: "Use /start to select your coin and interval." },
              { icon: BarChart3, title: "Track Profit", text: "Sit back and watch the market moves live." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-background p-4 z-10">
                <div className="w-16 h-16 rounded-full bg-card border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/5">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-12 pb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold font-display mb-2 justify-center md:justify-start">
                <Bot className="w-5 h-5 text-primary" />
                <span className="text-white">CryptoBot</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automated cryptocurrency tracking for the modern trader.
              </p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-white/20">
            © 2024 CryptoBot Service. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
