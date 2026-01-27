import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Hrum (HRM) and how can I earn it?",
    answer: "Hrum is our platform's native currency. You can earn it by watching ads, completing daily missions, and through our passive mining system. 10,000 Hrum can be converted to 1 TON."
  },
  {
    question: "How does the passive mining system work?",
    answer: "Mining runs automatically in the background. You can boost your mining rate by purchasing boosters in the Store or by inviting friends to join your network."
  },
  {
    question: "When can I withdraw my earnings to my wallet?",
    answer: "You can withdraw whenever you reach the minimum threshold (0.1 TON). Withdrawals are processed to your connected TON wallet within 24 hours of approval."
  },
  {
    question: "How do I increase my daily ad watching limit?",
    answer: "Standard users have a set daily limit. You can increase this limit and reduce withdrawal fees by upgrading your account level in the Upgrade section."
  }
];

export function FAQSection() {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="-mt-14 px-4 w-full max-w-md mx-auto pb-6 relative z-10">
      <div className="bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setIsMainOpen(!isMainOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all duration-500 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-transform duration-500 group-hover:scale-105">
              <HelpCircle className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-500" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em] mb-0.5">Support Center</p>
              <h3 className="font-black text-xs uppercase tracking-widest text-zinc-200">Frequently Asked Questions</h3>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isMainOpen ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
              <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </motion.div>
        </button>

        <AnimatePresence>
          {isMainOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="border-t border-white/5 bg-black/40"
            >
              <div className="p-4 space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="group/item rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01] transition-all duration-500 hover:border-white/10 hover:bg-white/[0.03]">
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full flex items-center justify-between p-4 text-left transition-all duration-300"
                    >
                      <span className="text-[11px] font-black text-zinc-400 group-hover/item:text-zinc-200 transition-colors leading-relaxed pr-6 uppercase tracking-wider">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="shrink-0"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover/item:text-zinc-400 transition-colors" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence mode="wait">
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                          <div className="px-5 pb-5 pt-0 text-[10px] font-bold text-zinc-500 border-t border-white/5 leading-loose bg-black/20">
                            <div className="pt-4 border-t border-blue-500/10">
                              {faq.answer}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
