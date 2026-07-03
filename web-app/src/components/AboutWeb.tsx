import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Palette, Sparkles, Code, Cpu } from 'lucide-react';
import { useThemeStyles } from './DashboardWeb';

export const AboutWeb: React.FC = () => {
  const cStyles = useThemeStyles();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className={`p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF007F]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[3px] shadow-lg shadow-[#FF007F]/10">
          <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center">
            <span className="font-['Poppins'] font-black text-4xl text-white">CB</span>
          </div>
        </div>

        <div className="text-center md:text-left space-y-2">
          <h3 className="text-2xl font-black tracking-tight">CoinBurst: Wealth Nexus</h3>
          <p className={`${cStyles.textMuted} text-sm max-w-xl`}>
            A premium personal ledger built to elevate wealth management. Blending high-performance technology, hyper-fluid design aesthetics, and contextual artificial intelligence.
          </p>
        </div>
      </motion.div>

      {/* Core Technical Highlights */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl ${cStyles.cardBg} border ${cStyles.gradientBorder} space-y-4`}>
          <div className={`w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20`}>
            <ShieldCheck size={20} />
          </div>
          <h4 className="font-bold text-base">Military-Grade Ledger</h4>
          <p className={`${cStyles.textMuted} text-xs leading-relaxed`}>
            Real-time Firebase synchronisation guarantees instant updates across your devices, backed by client-side caching and offline storage.
          </p>
        </div>

        <div className={`p-6 rounded-2xl ${cStyles.cardBg} border ${cStyles.gradientBorder} space-y-4`}>
          <div className={`w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20`}>
            <Palette size={20} />
          </div>
          <h4 className="font-bold text-base">Bespoke Styling Engine</h4>
          <p className={`${cStyles.textMuted} text-xs leading-relaxed`}>
            Seamlessly switch visual profiles. From minimalist light modes to neon-saturated cyberpunk scanlines with integrated soundscapes.
          </p>
        </div>

        <div className={`p-6 rounded-2xl ${cStyles.cardBg} border ${cStyles.gradientBorder} space-y-4`}>
          <div className={`w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20`}>
            <Cpu size={20} />
          </div>
          <h4 className="font-bold text-base">Contextual AI Advisor</h4>
          <p className={`${cStyles.textMuted} text-xs leading-relaxed`}>
            Natural language parsing maps instructions directly to actions. Ask for projections, ledger searches, or savings velocity advice.
          </p>
        </div>
      </motion.div>

      {/* Behind the Technology */}
      <motion.div
        variants={itemVariants}
        className={`p-6 rounded-2xl ${cStyles.cardBg} border space-y-6`}
      >
        <h4 className="font-black text-lg flex items-center gap-2">
          <Code className={cStyles.accent} size={20} />
          Tech Stack Architecture
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-gray-400">Frontend Stack</h5>
            <ul className="space-y-2 list-disc pl-4 text-gray-300">
              <li><strong className="text-white">React 19 & TypeScript:</strong> Type-safe interfaces and robust component structuring.</li>
              <li><strong className="text-white">Zustand State Store:</strong> Ultra-fast state management with custom LocalStorage hydration mapping.</li>
              <li><strong className="text-white">Framer Motion & SVG:</strong> Liquid progress bars and dual overlapping wave oscillators.</li>
              <li><strong className="text-white">Tailwind CSS:</strong> Adaptive theme classes leveraging utility tokens.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-gray-400">Mobile & Backend Integration</h5>
            <ul className="space-y-2 list-disc pl-4 text-gray-300">
              <li><strong className="text-white">Capacitor Native SDK:</strong> Cross-platform wrapper targeting Android with custom Safe Area Margins.</li>
              <li><strong className="text-white">Firebase Suite:</strong> Realtime Database ledger backend with synchronised offline write queues.</li>
              <li><strong className="text-white">Recharts Engine:</strong> Interactive area trends and budget tracking nodes.</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Decorative Signature */}
      <motion.div variants={itemVariants} className="text-center pt-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center justify-center gap-1">
          Designed by Antigravity <Sparkles size={10} className="text-amber-400" /> Version 2.4.0
        </p>
      </motion.div>
    </motion.div>
  );
};
