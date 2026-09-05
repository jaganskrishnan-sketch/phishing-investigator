import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, Mail, Globe, Lock,
  FileDown, FileCode, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp,
  Clock, ArrowRight, ExternalLink, Terminal, Shield, Sparkles, UserCheck, Activity,
  LifeBuoy, Paperclip, CheckSquare
} from 'lucide-react';
import ContextualLearningCard from './ContextualLearningCard';
import BeforeYouClickChecklist from './BeforeYouClickChecklist';
import RecoveryWorkflowModal from './RecoveryWorkflowModal';

export default function InvestigationResultView({
  result,
  onDownloadPdf,
  onDownloadMarkdown,
  onNewAnalysis
}) {
  const [viewMode, setViewMode] = useState('user'); // 'user' or 'technical'
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  if (!result) {
    return (
      <div className="bg-aurora-card border border-aurora-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 animate-fadeIn">
        <div className="p-4 bg-aurora-surface border border-aurora-border rounded-2xl w-fit mx-auto text-slate-400">
          <Shield className="w-8 h-8 opacity-60" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">No Investigation Dossier Active</h3>
          <p className="text-xs text-slate-400">
            Please analyze an email from your inbox or select a previous investigation from history.
          </p>
        </div>
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <span>Start New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const {
    investigation_id = 'INV-UNKNOWN',
    verdict = 'SUSPICIOUS',
    risk_score = 0,
    attack_category = 'General Assessment',
    confidence_level = 'High',
    confidence_percentage = 95,
    indicators = [],
    risk_breakdown = {},
    url_analysis = [],
    timeline = [],
    llm_summary = '',
    recommended_action = '',
    mitre_attack_techniques = [],
    iocs = {},
    auth_results = {},
    telemetry = {},
    technical_details = {},
    analyzed_at = 'Recent'
  } = result;

  const isCritical = (verdict || '').includes('CRITICAL');
  const isHighRisk = (verdict || '').includes('HIGH') || (verdict || '').includes('PHISHING');
  const isSuspicious = (verdict || '').includes('SUSPICIOUS');
  const isSafe = (verdict || '').includes('SAFE');

  const config = isCritical
    ? {
        bg: 'from-security-criticalBg via-aurora-card to-aurora-surface',
        border: 'border-security-criticalBorder',
        text: 'text-security-critical',
        badge: 'bg-security-criticalBg text-security-critical border-security-criticalBorder',
        bar: 'bg-gradient-to-r from-red-600 to-rose-700',
        icon: ShieldAlert,
        statusLabel: 'CRITICAL RISK',
      }
    : isHighRisk
    ? {
        bg: 'from-security-highRiskBg via-aurora-card to-aurora-surface',
        border: 'border-security-highRiskBorder',
        text: 'text-security-highRisk',
        badge: 'bg-security-highRiskBg text-security-highRisk border-security-highRiskBorder',
        bar: 'bg-gradient-to-r from-orange-500 to-red-600',
        icon: ShieldAlert,
        statusLabel: 'HIGH RISK',
      }
    : isSuspicious
    ? {
        bg: 'from-security-suspiciousBg via-aurora-card to-aurora-surface',
        border: 'border-security-suspiciousBorder',
        text: 'text-security-suspicious',
        badge: 'bg-security-suspiciousBg text-security-suspicious border-security-suspiciousBorder',
        bar: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        icon: AlertTriangle,
        statusLabel: 'SUSPICIOUS',
      }
    : {
        bg: 'from-security-safeBg via-aurora-card to-aurora-surface',
        border: 'border-security-safeBorder',
        text: 'text-security-safe',
        badge: 'bg-security-safeBg text-security-safe border-security-safeBorder',
        bar: 'bg-gradient-to-r from-teal-500 to-emerald-500',
        icon: ShieldCheck,
        statusLabel: 'SAFE',
      };

  const Icon = config.icon;

  const renderRiskPill = (level) => {
    const l = (level || 'UNKNOWN').toUpperCase();
    if (l === 'CRITICAL') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-security-criticalBg text-security-critical border border-security-criticalBorder">CRITICAL</span>;
    if (l === 'HIGH') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-security-highRiskBg text-security-highRisk border border-security-highRiskBorder">HIGH</span>;
    if (l === 'MEDIUM') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-security-suspiciousBg text-security-suspicious border border-security-suspiciousBorder">MEDIUM</span>;
    if (l === 'SAFE') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-security-safeBg text-security-safe border border-security-safeBorder">SAFE</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-aurora-border text-slate-400 border border-aurora-borderLight">UNKNOWN</span>;
  };

  const renderAuthPill = (label, val) => {
    const v = (val || 'UNKNOWN').toUpperCase();
    const isPass = v.includes('PASS');
    const isFail = v.includes('FAIL');
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
        isPass
          ? 'bg-security-safeBg border-security-safeBorder text-security-safe'
          : isFail
          ? 'bg-security-highRiskBg border-security-highRiskBorder text-security-highRisk'
          : 'bg-aurora-card border-aurora-border text-slate-400'
      }`}>
        {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : isFail ? <XCircle className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
        <span>{label}: {v}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Recovery Modal */}
      <RecoveryWorkflowModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        verdict={verdict}
        riskScore={risk_score}
      />

      {/* A. INVESTIGATION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-aurora-card border border-aurora-border rounded-2xl p-4 shadow-md">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            Investigation Reference
          </span>
          <span className="text-sm font-mono font-black text-aurora-cyan">
            {investigation_id}
          </span>
          <span className="text-xs text-slate-400 ml-2">
            • Logged {analyzed_at || 'Just now'}
          </span>
        </div>

        {/* User View vs Technical View Toggle */}
        <div className="flex items-center gap-1 bg-aurora-surface p-1 rounded-xl border border-aurora-border">
          <button
            onClick={() => setViewMode('user')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'user'
                ? 'bg-aurora-violet text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User View
          </button>
          <button
            onClick={() => setViewMode('technical')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'technical'
                ? 'bg-aurora-violet text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Technical View
          </button>
        </div>
      </div>

      {/* B & C & D. THREAT VERDICT, RISK SCORE & CONFIDENCE */}
      <div className={`rounded-3xl border ${config.border} bg-gradient-to-b ${config.bg} p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Verdict Label */}
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl border ${config.border} bg-aurora-bg/80 shadow-inner`}>
              <Icon className={`w-10 h-10 ${config.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Security Verdict
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badge}`}>
                  {config.statusLabel}
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${config.text}`}>
                {verdict}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Category: <span className="font-semibold text-white">{attack_category}</span> • <span className="text-aurora-cyan font-semibold">{(indicators || []).length} security indicators</span> fired
              </p>
            </div>
          </div>

          {/* Risk Score & Confidence Section */}
          <div className="w-full lg:w-80 bg-aurora-bg/90 border border-aurora-border rounded-2xl p-5 shadow-inner space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Score</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {risk_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </span>
            </div>
            
            {/* Horizontal Risk Bar */}
            <div className="w-full h-3 bg-aurora-surface rounded-full overflow-hidden p-0.5 border border-aurora-border">
              <div
                className={`h-full rounded-full ${config.bar} transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(risk_score, 4)}%` }}
              />
            </div>

            {/* Separate Confidence Metric */}
            <div className="pt-1 flex items-center justify-between text-xs border-t border-aurora-border/60">
              <span className="text-slate-400">Analysis Confidence:</span>
              <span className="font-bold text-aurora-cyan">
                {confidence_level ? `${confidence_level} (${confidence_percentage || 94}%)` : 'Not available'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. SHORT EXPLANATION (EXECUTIVE SUMMARY) */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 sm:p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aurora-violet" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Threat Intelligence Summary
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {llm_summary}
        </p>
      </div>

      {/* 6. EMAIL SUMMARY & METADATA CARD */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-aurora-border">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-aurora-cyan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Information & Origin
            </h3>
          </div>
          {telemetry?.is_forwarded && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-aurora-violet/15 text-aurora-violet border border-aurora-violet/30">
              Forwarded Header Extracted
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">From:</span>
              <span className="font-mono text-aurora-cyan break-all font-semibold">
                {telemetry?.display_name && `"${telemetry?.display_name}" `}
                &lt;{telemetry?.sender_address || 'N/A'}&gt;
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Subject:</span>
              <span className="text-white font-semibold break-words">
                {telemetry?.subject || '(No Subject)'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Sender Domain:</span>
              <span className="font-mono text-slate-200">
                {iocs?.sender_domain || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Received / Timestamp:</span>
              <span className="text-slate-300">
                {telemetry?.date || analyzed_at}
              </span>
            </div>

            {telemetry?.reply_to && (
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Reply-To:</span>
                <span className="font-mono text-security-suspicious">{telemetry.reply_to}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Technical Headers */}
        <div className="pt-2 border-t border-aurora-border">
          <button
            onClick={() => setShowRawHeaders(!showRawHeaders)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showRawHeaders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showRawHeaders ? 'Hide Technical Details' : 'Expand Technical Details'}</span>
          </button>

          {showRawHeaders && (
            <div className="mt-3 p-4 bg-aurora-bg border border-aurora-border rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Raw Header Telemetry
              </span>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {technical_details?.raw_headers || JSON.stringify(telemetry, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 7. "WHY WAS THIS FLAGGED?" EVIDENCE CARDS */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
          <Sparkles className="w-4 h-4 text-aurora-violet" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Why was this email flagged? (Auditable Evidence)
          </h3>
        </div>

        {indicators && indicators.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {indicators.map((ind, idx) => {
              const sev = ind.severity || 'MEDIUM';
              const isHigh = sev === 'HIGH';
              const isMed = sev === 'MEDIUM';

              const borderAccent = isHigh
                ? 'border-l-security-highRisk bg-security-highRiskBg'
                : isMed
                ? 'border-l-security-suspicious bg-security-suspiciousBg'
                : 'border-l-aurora-cyan bg-aurora-surface/60';

              return (
                <div
                  key={idx}
                  className={`border border-aurora-border border-l-4 rounded-xl p-4 shadow-sm backdrop-blur-sm ${borderAccent}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                          {ind.category}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                          isHigh ? 'bg-security-highRiskBg text-security-highRisk' : 'bg-security-suspiciousBg text-security-suspicious'
                        }`}>
                          Severity: {sev}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {ind.finding}
                      </h4>

                      {ind.explanation && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ind.explanation}
                        </p>
                      )}

                      {ind.evidence && (
                        <div className="flex items-center gap-2 pt-1">
                          <Terminal className="w-3.5 h-3.5 text-aurora-cyan flex-shrink-0" />
                          <span className="font-mono text-xs text-aurora-cyan bg-aurora-bg/90 px-2.5 py-1 rounded-md border border-aurora-border break-all">
                            {ind.evidence}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-aurora-surface border border-aurora-border text-slate-200">
                        +{ind.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-security-safeBg border border-security-safeBorder text-security-safe text-xs">
            No anomalous indicators triggered. Email conforms to authentic standards.
          </div>
        )}
      </div>

      {/* 8. RISK BREAKDOWN */}
      {risk_breakdown && (
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
            <Activity className="w-4 h-4 text-aurora-violet" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Multi-Vector Risk Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-aurora-surface border border-aurora-border rounded-xl p-3.5 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Sender Risk</span>
              {renderRiskPill(risk_breakdown.sender_risk)}
            </div>
            <div className="bg-aurora-surface border border-aurora-border rounded-xl p-3.5 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">URL Risk</span>
              {renderRiskPill(risk_breakdown.url_risk)}
            </div>
            <div className="bg-aurora-surface border border-aurora-border rounded-xl p-3.5 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Content Risk</span>
              {renderRiskPill(risk_breakdown.content_risk)}
            </div>
            <div className="bg-aurora-surface border border-aurora-border rounded-xl p-3.5 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Authentication Risk</span>
              {renderRiskPill(risk_breakdown.auth_risk)}
            </div>
            <div className="bg-aurora-surface border border-aurora-border rounded-xl p-3.5 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Social Engineering</span>
              {renderRiskPill(risk_breakdown.social_engineering_risk)}
            </div>
          </div>
        </div>
      )}

      {/* 9 & 10. SENDER & URL ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sender Analysis */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
            <UserCheck className="w-4 h-4 text-aurora-cyan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sender & Identity Analysis
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Display Name:</span>
              <span className="text-slate-200 font-semibold">{telemetry?.display_name || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sender Address:</span>
              <span className="font-mono text-aurora-cyan">{telemetry?.sender_address || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sender Domain:</span>
              <span className="font-mono text-slate-200">{iocs?.sender_domain || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Auth */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
            <Shield className="w-4 h-4 text-aurora-violet" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Cryptographic Authentication
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {renderAuthPill('SPF', auth_results?.spf)}
            {renderAuthPill('DKIM', auth_results?.dkim)}
            {renderAuthPill('DMARC', auth_results?.dmarc)}
          </div>
        </div>
      </div>

      {/* 11. URL ANALYSIS TABLE */}
      {url_analysis && url_analysis.length > 0 && (
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-aurora-border">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-aurora-cyan" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Destination URL Analysis ({url_analysis.length} Extracted)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">
              URLs rendered safely without auto-execution
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-aurora-surface text-slate-400 uppercase text-[10px] font-mono border-b border-aurora-border">
                <tr>
                  <th className="p-3">Extracted URL</th>
                  <th className="p-3">Risk Assessment</th>
                  <th className="p-3">Reason / Heuristic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-border font-mono">
                {url_analysis.map((u, idx) => (
                  <tr key={idx} className="hover:bg-aurora-surface/40">
                    <td className="p-3 text-aurora-cyan max-w-xs sm:max-w-md truncate break-all">
                      {u.url}
                    </td>
                    <td className="p-3">
                      {renderRiskPill(u.risk)}
                    </td>
                    <td className="p-3 font-sans text-slate-300 text-xs">
                      {u.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 12. ATTACHMENT ANALYSIS */}
      {iocs?.attachments && iocs.attachments.length > 0 && (
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
            <Paperclip className="w-4 h-4 text-aurora-violet" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Attachment Analysis ({iocs.attachments.length} Detected)
            </h3>
          </div>
          <div className="space-y-2">
            {iocs.attachments.map((att, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-aurora-surface border border-aurora-border flex items-center justify-between text-xs">
                <span className="font-mono text-slate-200">{att}</span>
                <span className="text-[10px] text-slate-400">Static Metadata Verified</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Static file extension heuristic check performed. Dynamic sandbox execution is not triggered.
          </p>
        </div>
      )}

      {/* 13 & 14 & 15. "WHAT SHOULD I DO?" & ACTION PRIORITY */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-aurora-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-aurora-cyan" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              What Should I Do? — Action Priority Guidance
            </h3>
          </div>

          {/* I Already Interacted Button */}
          <button
            onClick={() => setIsRecoveryOpen(true)}
            className="flex items-center gap-1.5 bg-aurora-cardElevated hover:bg-aurora-border border border-aurora-violet/40 text-aurora-violet text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>I Already Interacted</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Priority 1: IMMEDIATE */}
          <div className="p-4 rounded-xl bg-aurora-surface/80 border border-aurora-border space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-security-highRisk block">
              1. IMMEDIATE ACTION
            </span>
            <p className="text-slate-200 font-medium">
              {isSafe
                ? 'No immediate defensive action required. The message conforms to standard formats.'
                : 'Do not click embedded links, download unexpected attachments, or submit passwords.'}
            </p>
          </div>

          {/* Priority 2: VERIFY */}
          <div className="p-4 rounded-xl bg-aurora-surface/80 border border-aurora-border space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-aurora-cyan block">
              2. INDEPENDENT VERIFICATION
            </span>
            <p className="text-slate-200 font-medium">
              {isSafe
                ? 'Standard caution applies. Verify payment receipts match your personal booking records.'
                : 'Verify this request through an official app or direct phone call, never via email reply.'}
            </p>
          </div>

          {/* Priority 3: PROTECT */}
          <div className="p-4 rounded-xl bg-aurora-surface/80 border border-aurora-border space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-aurora-violet block">
              3. ACCOUNT PROTECTION
            </span>
            <p className="text-slate-200 font-medium">
              Ensure Multi-Factor Authentication (MFA) is enabled on your primary email and financial accounts.
            </p>
          </div>

          {/* Priority 4: REPORT & RECOVER */}
          <div className="p-4 rounded-xl bg-aurora-surface/80 border border-aurora-border space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-security-suspicious block">
              4. REPORTING & MITIGATION
            </span>
            <p className="text-slate-200 font-medium">
              Export the Incident Report below to forward IOC telemetry to your organization’s IT security team.
            </p>
          </div>
        </div>
      </div>

      {/* 16. CONTEXTUAL LEARNING */}
      <ContextualLearningCard indicators={indicators} attackCategory={attack_category} />

      {/* 17. BEFORE YOU CLICK CHECKLIST */}
      <BeforeYouClickChecklist />

      {/* 18. TECHNICAL VIEW: MITRE & AUDIT TIMELINE */}
      {viewMode === 'technical' && (
        <div className="space-y-6">
          {mitre_attack_techniques && mitre_attack_techniques.length > 0 && (
            <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                MITRE ATT&CK Matrix Mapping
              </h3>
              <div className="flex flex-wrap gap-2">
                {mitre_attack_techniques.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-aurora-violet/15 border border-aurora-violet/30 text-aurora-violet"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {timeline && timeline.length > 0 && (
            <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Investigation Audit Trail
              </h3>
              <div className="space-y-2">
                {timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-aurora-surface rounded-xl border border-aurora-border">
                    <span className="font-semibold text-slate-200">{step.step}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{step.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 19. REPORT EXPORT BAR */}
      <div className="bg-gradient-to-r from-aurora-card via-aurora-surface to-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">
            Generate Official Incident Documentation
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Export a shareable PDF Incident Report or raw Markdown intelligence for ticketing systems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onDownloadPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-security-critical to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={onDownloadMarkdown}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-aurora-cardElevated hover:bg-aurora-border border border-aurora-border text-slate-200 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
          >
            <FileCode className="w-4 h-4" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

    </div>
  );
}
