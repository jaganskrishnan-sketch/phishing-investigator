import React from 'react';
import { Mail, Shield, CheckCircle2, XCircle, HelpCircle, FileText, Globe, Clock } from 'lucide-react';

export default function TelemetryGrid({ telemetry, authResults, mitreTechniques }) {
  if (!telemetry) return null;

  const renderAuthBadge = (label, val) => {
    const status = (val || 'unknown').toLowerCase();
    const isPass = status === 'pass';
    const isFail = status === 'fail' || status === 'softfail';

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
        isPass
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          : isFail
          ? 'bg-red-500/15 border-red-500/30 text-red-300'
          : 'bg-slate-800 border-slate-700 text-slate-400'
      }`}>
        {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : isFail ? <XCircle className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
        <span>{label}: {status.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Box 1: Message Telemetry */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <Mail className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Message Metadata & Origin
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <span className="font-semibold text-slate-400 min-w-[90px]">From:</span>
            <span className="font-mono text-sky-300 break-all">
              {telemetry.display_name && `"${telemetry.display_name}" `}
              &lt;{telemetry.sender_address || 'N/A'}&gt;
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <span className="font-semibold text-slate-400 min-w-[90px]">Subject:</span>
            <span className="text-slate-100 font-medium break-words">
              {telemetry.subject || '(No Subject)'}
            </span>
          </div>

          {telemetry.date && (
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Timestamp: {telemetry.date}</span>
            </div>
          )}

          {telemetry.is_forwarded && (
            <div className="mt-2 text-[11px] p-2 rounded-lg bg-sky-950/40 border border-sky-800/50 text-sky-300">
              ℹ️ Forwarded Message Block detected — embedded headers extracted automatically.
            </div>
          )}
        </div>
      </div>

      {/* Box 2: Authentication & MITRE Mapping */}
      <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <Shield className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Authentication & Threat Matrix
          </h3>
        </div>

        {/* Auth Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {renderAuthBadge('SPF', authResults?.spf)}
          {renderAuthBadge('DKIM', authResults?.dkim)}
          {renderAuthBadge('DMARC', authResults?.dmarc)}
        </div>

        {/* MITRE Techniques */}
        {mitreTechniques && mitreTechniques.length > 0 && (
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              MITRE ATT&CK Mapping:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mitreTechniques.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-indigo-950/50 border border-indigo-700/40 text-indigo-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
