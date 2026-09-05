import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function VerdictCard({ result }) {
  if (!result) return null;

  const { verdict, risk_score, attack_category, confidence_level, indicators } = result;

  const isPhishing = verdict.includes('PHISHING');
  const isSuspicious = verdict.includes('SUSPICIOUS');
  const isSafe = verdict.includes('SAFE');

  const config = isPhishing
    ? {
        bg: 'from-red-950/40 via-slate-900/90 to-red-950/20',
        border: 'border-red-500/50',
        glow: 'shadow-red-500/20',
        text: 'text-red-400',
        icon: ShieldAlert,
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        bar: 'bg-gradient-to-r from-orange-500 to-red-500',
      }
    : isSuspicious
    ? {
        bg: 'from-amber-950/40 via-slate-900/90 to-amber-950/20',
        border: 'border-amber-500/50',
        glow: 'shadow-amber-500/20',
        text: 'text-amber-400',
        icon: AlertTriangle,
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        bar: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      }
    : {
        bg: 'from-emerald-950/40 via-slate-900/90 to-emerald-950/20',
        border: 'border-emerald-500/50',
        glow: 'shadow-emerald-500/20',
        text: 'text-emerald-400',
        icon: ShieldCheck,
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        bar: 'bg-gradient-to-r from-teal-500 to-emerald-500',
      };

  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border ${config.border} bg-gradient-to-b ${config.bg} p-6 shadow-2xl ${config.glow} backdrop-blur-xl relative overflow-hidden transition-all duration-300`}>
      
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left: Verdict Label & Category */}
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className={`p-4 rounded-2xl border ${config.border} bg-slate-950/80 shadow-inner`}>
            <Icon className={`w-10 h-10 ${config.text}`} />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Threat Investigation Verdict
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badge}`}>
                {confidence_level} Confidence
              </span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${config.text}`}>
              {verdict}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Category: <span className="font-semibold text-white">{attack_category}</span> • <span className="text-sky-400 font-medium">{indicators.length} threat indicators</span> fired
            </p>
          </div>
        </div>

        {/* Right: Risk Score Meter */}
        <div className="w-full md:w-64 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center md:text-right">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold text-slate-400">Risk Score</span>
            <span className="text-2xl font-black text-white">
              {risk_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full ${config.bar} transition-all duration-700 ease-out`}
              style={{ width: `${Math.max(risk_score, 4)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
            <span>0 (Safe)</span>
            <span>31 (Suspicious)</span>
            <span>66 (Phishing)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
