import React from 'react';
import { FileText, FileDown, FileCode, Search, Shield, ArrowRight, Clock } from 'lucide-react';

export default function ReportsPage({ investigations, onDownloadPdf, onDownloadMarkdown, onNavigate }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Security Incident Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Download vector PDF incident documentation and MITRE ATT&CK telemetry for any past investigation.
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl shadow-xl overflow-hidden">
        {investigations && investigations.length > 0 ? (
          <div className="divide-y divide-aurora-border">
            {investigations.map((item) => {
              const isPhishing = (item.verdict || '').includes('HIGH') || (item.verdict || '').includes('CRITICAL') || (item.verdict || '').includes('PHISHING');
              const isSuspicious = (item.verdict || '').includes('SUSPICIOUS');

              const badgeColor = isPhishing
                ? 'bg-security-highRiskBg border-security-highRiskBorder text-security-highRisk'
                : isSuspicious
                ? 'bg-security-suspiciousBg border-security-suspiciousBorder text-security-suspicious'
                : 'bg-security-safeBg border-security-safeBorder text-security-safe';

              return (
                <div
                  key={item.id || item.investigation_id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-aurora-surface/60 transition-all"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-aurora-cyan">
                        {item.investigation_id || item.id}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {item.verdict} ({item.risk_score}/100)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">
                      {item.telemetry?.subject || '(No Subject)'}
                    </h4>

                    <p className="text-xs text-slate-400 font-mono truncate">
                      Sender: {item.telemetry?.sender_address || 'Unknown'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => onDownloadPdf(item.originalContent || item.raw_input || item.telemetry?.subject)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-security-critical to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all hover:scale-[1.02]"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => onDownloadMarkdown(item.originalContent || item.raw_input || item.telemetry?.subject)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-aurora-surface hover:bg-aurora-cardElevated border border-aurora-border text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Markdown</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="p-3 bg-aurora-surface border border-aurora-border rounded-2xl w-fit mx-auto text-slate-400">
              <FileText className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No reports generated yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Reports are automatically compiled when you analyze emails. Run your first analysis to generate documentation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('analyze')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Analyze an Email</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
