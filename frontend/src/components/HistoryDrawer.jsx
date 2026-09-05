import React, { useState } from 'react';
import { History, Trash2, Search, ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle, Download, X, Clock } from 'lucide-react';

export default function HistoryDrawer({ history, onSelectHistoryItem, onClearHistory, isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const q = searchTerm.toLowerCase();
    const subject = (item.telemetry?.subject || '').toLowerCase();
    const sender = (item.telemetry?.sender_address || '').toLowerCase();
    const verdict = (item.verdict || '').toLowerCase();
    return subject.includes(q) || sender.includes(q) || verdict.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f172a] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Investigation History</h3>
              <p className="text-[11px] text-slate-400">{history.length} logged investigations (Local)</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by sender, subject, or verdict..."
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => {
              const isPhishing = item.verdict.includes('PHISHING');
              const isSuspicious = item.verdict.includes('SUSPICIOUS');

              const badgeColor = isPhishing
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : isSuspicious
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="p-3.5 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeColor}`}>
                      {item.verdict} ({item.risk_score}/100)
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.analyzed_at ? item.analyzed_at.slice(11, 19) : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-sky-300 transition-colors">
                      {item.telemetry?.subject || '(No Subject)'}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.telemetry?.sender_address || 'Unknown Sender'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No matching investigation records found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">Stored in browser memory</span>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
