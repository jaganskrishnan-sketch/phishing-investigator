import React from 'react';
import { Shield, Lock, Search, ArrowRight, CheckCircle2, AlertTriangle, Eye, Zap, Database, LifeBuoy, BookOpen, UserCheck } from 'lucide-react';

export default function LandingPage({ onStartAnalysis, onLearnMore, authStatus, onLogin }) {
  const steps = [
    { number: '01', title: 'CONNECT', desc: 'Securely link your Google Workspace or Gmail with read-only OAuth permissions.' },
    { number: '02', title: 'ANALYZE', desc: 'Select any email directly from your inbox, upload .eml files, or paste raw headers.' },
    { number: '03', title: 'UNDERSTAND', desc: 'Review plain-English explanations backed by auditable evidence and MITRE techniques.' },
    { number: '04', title: 'RESPOND', desc: 'Follow concrete, prioritized action steps tailored specifically to the threat category.' },
    { number: '05', title: 'RECOVER', desc: 'Follow a calm, non-shaming recovery plan if you already clicked or entered credentials.' },
    { number: '06', title: 'LEARN', desc: 'Build permanent defense habits to recognize lookalikes and social engineering next time.' },
  ];

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aurora-violet/15 border border-aurora-violet/30 text-aurora-violet text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Professional Email Security & Threat Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Don't just detect suspicious emails. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-violet via-indigo-400 to-aurora-cyan">
            Understand them.
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Phishing Investigator helps you investigate suspicious emails, understand why they received their score, decide what action to take, and learn how to recognize similar attacks.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-aurora-violet/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>Analyze an Email</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {!authStatus?.is_authenticated && (
            <button
              onClick={onLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-aurora-card hover:bg-aurora-cardElevated border border-aurora-border text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              <span>Connect Gmail</span>
            </button>
          )}
        </div>

        {/* Trust & Privacy Guarantee */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-security-safe" />
            <span>In-Memory Privacy Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-cyan" />
            <span>100% Auditable Evidence</span>
          </div>
        </div>

      </section>

      {/* Visual Journey Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto bg-aurora-card border border-aurora-border rounded-3xl p-8 sm:p-12 shadow-xl backdrop-blur-md">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-aurora-cyan font-mono">
            The Complete Journey
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            From Uncertainty to Complete Protection
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-aurora-surface border border-aurora-border rounded-2xl p-4 flex flex-col justify-between hover:border-aurora-violet/50 transition-all hover:-translate-y-1 group"
            >
              <div>
                <span className="text-xs font-mono font-bold text-aurora-violet block mb-1.5">
                  {step.number}
                </span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-1 group-hover:text-aurora-cyan transition-colors">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 3 Value Pillars */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-aurora-violet/15 border border-aurora-violet/30 text-aurora-violet w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Deterministic Threat Scoring</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mathematical checks for Levenshtein lookalike typosquats, free form hosting abuse, and SPF/DKIM authentication failures with zero hallucinated points.
          </p>
        </div>

        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-aurora-cyan/15 border border-aurora-cyan/30 text-aurora-cyan w-fit">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Calm Recovery Guidance</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you already clicked a link or entered credentials, our non-shaming recovery workflow guides you through immediate containment, protection, and monitoring.
          </p>
        </div>

        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-security-safeBg border border-security-safeBorder text-security-safe w-fit">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">In-Memory Zero Retention</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your email content is analyzed in-memory to identify potential security threats. We do not store your credentials, tokens, or email bodies on server disks.
          </p>
        </div>

      </section>

    </div>
  );
}
