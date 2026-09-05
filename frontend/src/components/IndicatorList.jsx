import React from 'react';
import { AlertOctagon, AlertTriangle, Info, Terminal } from 'lucide-react';

export default function IndicatorList({ indicators }) {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="bg-[#111827]/90 border border-emerald-500/30 rounded-2xl p-6 text-center text-emerald-300">
        <p className="font-semibold text-sm">✅ No malicious indicators fired.</p>
        <p className="text-xs text-slate-400 mt-1">This email matches authentic enterprise communication standards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          🚩 Evidence & Indicators of Compromise ({indicators.length} Fired)
        </h3>
        <span className="text-xs text-slate-400">Ranked by risk weight</span>
      </div>

      <div className="space-y-2.5">
        {indicators.map((ind, idx) => {
          const pts = ind.points || 0;
          const isHigh = pts >= 20;
          const isMed = pts >= 12;

          const badgeClass = isHigh
            ? 'border-l-red-500 bg-gradient-to-r from-red-950/30 to-[#111827]'
            : isMed
            ? 'border-l-amber-500 bg-gradient-to-r from-amber-950/30 to-[#111827]'
            : 'border-l-sky-500 bg-gradient-to-r from-sky-950/30 to-[#111827]';

          return (
            <div
              key={idx}
              className={`border border-slate-800 border-l-4 rounded-xl p-4 shadow-md backdrop-blur-sm transition-all hover:translate-x-1 ${badgeClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {ind.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    {ind.finding}
                  </h4>
                  {ind.evidence && (
                    <div className="flex items-center gap-2 mt-2">
                      <Terminal className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span className="font-mono text-xs text-sky-300 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 break-all">
                        {ind.evidence}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-white shadow-inner">
                    +{pts} pts
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
