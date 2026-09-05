import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Mail, ArrowRight, Search, FileDown, Clock, Shield } from 'lucide-react';

export default function DashboardPage({ investigations = [], onNavigate, onSelectInvestigation }) {
  const safeList = Array.isArray(investigations) ? investigations : [];
  const totalAnalyzed = safeList.length;
  
  // Real non-fabricated counts
  const threatsDetected = safeList.filter(i => (i?.verdict || '').includes('HIGH') || (i?.verdict || '').includes('CRITICAL') || (i?.verdict || '').includes('PHISHING')).length;
  const suspiciousCount = safeList.filter(i => (i?.verdict || '').includes('SUSPICIOUS')).length;
  const safeCount = safeList.filter(i => (i?.verdict || '').includes('SAFE')).length;

  const criticalCount = safeList.filter(i => (i?.verdict || '').includes('CRITICAL')).length;
  const highRiskCount = Math.max(0, threatsDetected - criticalCount);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-aurora-card via-aurora-surface to-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Security Operations Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and investigation metrics from your analyzed emails.
          </p>
        </div>
        <button
          onClick={() => onNavigate('analyze')}
          className="flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-aurora-violet/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-4 h-4" />
          <span>Start New Analysis</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Emails Analyzed */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Emails Analyzed</span>
            <div className="p-2 rounded-xl bg-aurora-surface border border-aurora-border text-slate-300">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{totalAnalyzed}</span>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalAnalyzed > 0 ? 'Total logged investigations' : 'No investigations yet'}
            </p>
          </div>
        </div>

        {/* Threats Detected */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Threats Detected</span>
            <div className="p-2 rounded-xl bg-security-highRiskBg text-security-highRisk border border-security-highRiskBorder">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-security-highRisk">{threatsDetected}</span>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalAnalyzed > 0 ? 'High & Critical risk emails' : 'No investigations yet'}
            </p>
          </div>
        </div>

        {/* Suspicious Emails */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Suspicious Emails</span>
            <div className="p-2 rounded-xl bg-security-suspiciousBg text-security-suspicious border border-security-suspiciousBorder">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-security-suspicious">{suspiciousCount}</span>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalAnalyzed > 0 ? 'Borderline anomalies flagged' : 'No investigations yet'}
            </p>
          </div>
        </div>

        {/* Safe Emails */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Safe Emails</span>
            <div className="p-2 rounded-xl bg-security-safeBg text-security-safe border border-security-safeBorder">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-security-safe">{safeCount}</span>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalAnalyzed > 0 ? 'Verified authentic emails' : 'No investigations yet'}
            </p>
          </div>
        </div>

      </div>

      {/* Risk Distribution & Overview */}
      {totalAnalyzed > 0 && (
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Risk Distribution</h3>
              <p className="text-xs text-slate-400">Breakdown of all {totalAnalyzed} investigated emails</p>
            </div>
          </div>

          {/* Distribution Progress Bar */}
          <div className="w-full h-3 bg-aurora-surface rounded-full overflow-hidden flex border border-aurora-border">
            {safeCount > 0 && (
              <div
                style={{ width: `${(safeCount / totalAnalyzed) * 100}%` }}
                className="bg-security-safe transition-all duration-500"
                title={`Safe: ${safeCount}`}
              />
            )}
            {suspiciousCount > 0 && (
              <div
                style={{ width: `${(suspiciousCount / totalAnalyzed) * 100}%` }}
                className="bg-security-suspicious transition-all duration-500"
                title={`Suspicious: ${suspiciousCount}`}
              />
            )}
            {highRiskCount > 0 && (
              <div
                style={{ width: `${(highRiskCount / totalAnalyzed) * 100}%` }}
                className="bg-security-highRisk transition-all duration-500"
                title={`High Risk: ${highRiskCount}`}
              />
            )}
            {criticalCount > 0 && (
              <div
                style={{ width: `${(criticalCount / totalAnalyzed) * 100}%` }}
                className="bg-security-critical transition-all duration-500"
                title={`Critical: ${criticalCount}`}
              />
            )}
          </div>

          {/* Distribution Legend */}
          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-security-safe" />
              <span className="text-slate-300 font-medium">Safe ({safeCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-security-suspicious" />
              <span className="text-slate-300 font-medium">Suspicious ({suspiciousCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-security-highRisk" />
              <span className="text-slate-300 font-medium">High Risk ({highRiskCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-security-critical" />
              <span className="text-slate-300 font-medium">Critical ({criticalCount})</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Investigations Table */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-5 border-b border-aurora-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Investigations</h3>
            <p className="text-xs text-slate-400">Click any row to open the complete investigation dossier</p>
          </div>
          {totalAnalyzed > 0 && (
            <button
              onClick={() => onNavigate('investigations')}
              className="text-xs font-semibold text-aurora-cyan hover:text-aurora-violet flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {totalAnalyzed > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-aurora-surface text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-aurora-border">
                <tr>
                  <th className="p-4">Investigation ID</th>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Verdict</th>
                  <th className="p-4">Analyzed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-border">
                {investigations.slice(0, 8).map((inv) => {
                  const isPhishing = (inv.verdict || '').includes('HIGH') || (inv.verdict || '').includes('CRITICAL') || (inv.verdict || '').includes('PHISHING');
                  const isSuspicious = (inv.verdict || '').includes('SUSPICIOUS');

                  const badgeClass = isPhishing
                    ? 'bg-security-highRiskBg border-security-highRiskBorder text-security-highRisk'
                    : isSuspicious
                    ? 'bg-security-suspiciousBg border-security-suspiciousBorder text-security-suspicious'
                    : 'bg-security-safeBg border-security-safeBorder text-security-safe';

                  return (
                    <tr
                      key={inv.id || inv.investigation_id}
                      onClick={() => onSelectInvestigation(inv)}
                      className="hover:bg-aurora-surface/60 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 font-mono font-bold text-aurora-cyan group-hover:underline">
                        {inv.investigation_id || inv.id}
                      </td>
                      <td className="p-4 font-medium text-slate-300 max-w-[200px] truncate">
                        {inv.telemetry?.sender_address || 'Unknown'}
                      </td>
                      <td className="p-4 font-semibold text-white max-w-[260px] truncate">
                        {inv.telemetry?.subject || '(No Subject)'}
                      </td>
                      <td className="p-4 font-bold text-slate-200">
                        {inv.risk_score} / 100
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeClass}`}>
                          {inv.verdict}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {inv.analyzed_at ? inv.analyzed_at.slice(0, 16) : 'Just now'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="p-3 bg-aurora-surface border border-aurora-border rounded-2xl w-fit mx-auto text-slate-400">
              <Shield className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No investigations yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an email from your Gmail inbox or paste message headers to run your first security analysis.
              </p>
            </div>
            <button
              onClick={() => onNavigate('analyze')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
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
