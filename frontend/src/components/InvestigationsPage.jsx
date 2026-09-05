import React, { useState } from 'react';
import { History, Search, Trash2, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle, Clock, Filter } from 'lucide-react';

export default function InvestigationsPage({
  investigations,
  onSelectInvestigation,
  onDeleteInvestigation,
  onClearAll,
  onNavigate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Filtering
  const filtered = investigations.filter((item) => {
    const q = searchTerm.toLowerCase();
    const sub = (item.telemetry?.subject || '').toLowerCase();
    const sender = (item.telemetry?.sender_address || '').toLowerCase();
    const invId = (item.investigation_id || item.id || '').toLowerCase();
    const matchSearch = sub.includes(q) || sender.includes(q) || invId.includes(q);

    if (!matchSearch) return false;
    if (verdictFilter === 'ALL') return true;
    if (verdictFilter === 'SAFE') return (item.verdict || '').includes('SAFE');
    if (verdictFilter === 'SUSPICIOUS') return (item.verdict || '').includes('SUSPICIOUS');
    if (verdictFilter === 'HIGH RISK') return (item.verdict || '').includes('HIGH') || (item.verdict || '').includes('PHISHING');
    if (verdictFilter === 'CRITICAL') return (item.verdict || '').includes('CRITICAL');
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'risk') return (b.risk_score || 0) - (a.risk_score || 0);
    return new Date(b.analyzed_at || 0) - new Date(a.analyzed_at || 0);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Investigation History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse, search, and review all previous threat investigations.
          </p>
        </div>

        {investigations.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-security-highRisk hover:text-red-300 font-semibold px-3 py-1.5 rounded-xl bg-security-highRiskBg border border-security-highRiskBorder transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, sender, or subject..."
              className="w-full bg-aurora-bg border border-aurora-border rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-aurora-violet"
            />
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-aurora-bg border border-aurora-border rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-aurora-violet"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="risk">Sort: Highest Risk</option>
          </select>

        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {['ALL', 'CRITICAL', 'HIGH RISK', 'SUSPICIOUS', 'SAFE'].map((f) => (
            <button
              key={f}
              onClick={() => setVerdictFilter(f)}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                verdictFilter === f
                  ? 'bg-aurora-violet text-white shadow'
                  : 'bg-aurora-surface text-slate-400 hover:text-slate-200 border border-aurora-border'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Investigations List */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl shadow-xl overflow-hidden">
        {sorted.length > 0 ? (
          <div className="divide-y divide-aurora-border">
            {sorted.map((item) => {
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
                  onClick={() => onSelectInvestigation(item)}
                  className="p-5 hover:bg-aurora-surface/60 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
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

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-aurora-violet transition-colors">
                      {item.telemetry?.subject || '(No Subject)'}
                    </h4>

                    <p className="text-xs text-slate-400 font-mono truncate">
                      {item.telemetry?.sender_address || 'Unknown Sender'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.analyzed_at ? item.analyzed_at.slice(0, 16) : 'Recent'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-aurora-cyan transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="p-3 bg-aurora-surface border border-aurora-border rounded-2xl w-fit mx-auto text-slate-400">
              <History className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No matching investigations found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {investigations.length === 0
                  ? 'Run your first email investigation to view history.'
                  : 'Try adjusting your search query or filter tags.'}
              </p>
            </div>
            {investigations.length === 0 && (
              <button
                onClick={() => onNavigate('analyze')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Analyze an Email</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
