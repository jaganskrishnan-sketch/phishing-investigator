import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle2, Lock, Key, CreditCard, Download, Send, HelpCircle, X, ArrowRight, LifeBuoy } from 'lucide-react';

export default function RecoveryWorkflowModal({ isOpen, onClose, verdict, riskScore }) {
  const [selectedScenario, setSelectedScenario] = useState('credentials');

  if (!isOpen) return null;

  const scenarios = [
    { id: 'link', label: 'I clicked a link', icon: ArrowRight },
    { id: 'credentials', label: 'I entered passwords / credentials', icon: Key },
    { id: 'financial', label: 'I entered payment / card info', icon: CreditCard },
    { id: 'attachment', label: 'I downloaded an attachment', icon: Download },
    { id: 'reply', label: 'I replied to the email', icon: Send },
    { id: 'unsure', label: "I'm not sure what happened", icon: HelpCircle },
  ];

  const getRecoveryPlan = (id) => {
    switch (id) {
      case 'credentials':
        return {
          title: 'Credential Exposure Recovery Plan',
          immediate: [
            'Immediately change your password on the authentic website/app (navigate directly, not via the email).',
            'If you use the same password on other accounts, change those passwords immediately as well.',
            'Log out of all active sessions in your account security settings.',
          ],
          protect: [
            'Enable Two-Factor Authentication (2FA) / Multi-Factor Authentication (MFA) using an authenticator app.',
            'Review recent account activity for unauthorized logins or password recovery attempts.',
          ],
          monitor: [
            'Watch for unexpected security alert emails or SMS verification codes.',
            'Monitor connected email forwarding rules or authorized third-party applications.',
          ],
          seekHelp: 'If this is a corporate or work account, notify your organization’s IT or Security department immediately.',
        };
      case 'financial':
        return {
          title: 'Financial Information Exposure Recovery Plan',
          immediate: [
            'Immediately call your bank or card issuer using the phone number on the back of your card.',
            'Request a temporary freeze or cancellation and reissue of the exposed card.',
            'Cancel any pending wire or payment transfers if applicable.',
          ],
          protect: [
            'Review your recent transaction history for unauthorized charges or micro-transactions.',
            'Set up real-time transaction SMS/email alerts on your banking app.',
          ],
          monitor: [
            'Check your bank and credit statements weekly for the next 60 days.',
            'Consider placing a credit freeze or fraud alert with major credit bureaus if personal identity info was shared.',
          ],
          seekHelp: 'Contact your financial institution’s dedicated fraud department to report the transaction.',
        };
      case 'attachment':
        return {
          title: 'Suspicious Attachment Download Recovery Plan',
          immediate: [
            'Do NOT open or execute the downloaded file. Delete it from your Downloads folder and empty Trash.',
            'Disconnect your device from Wi-Fi / Ethernet temporarily if you executed the file.',
          ],
          protect: [
            'Run a full system anti-malware scan using Windows Defender or your trusted endpoint security software.',
            'Check your browser downloads list and remove any installed extensions you do not recognize.',
          ],
          monitor: [
            'Monitor your device for unusual CPU spikes, unexpected pop-ups, or unprompted reboots.',
          ],
          seekHelp: 'If you ran an executable file (.exe, .scr, .iso, .bat) on a company device, inform IT immediately for endpoint isolation.',
        };
      case 'link':
        return {
          title: 'Clicked Link Recovery Plan',
          immediate: [
            'Close the browser tab immediately. Do not submit any forms or accept any permission prompts.',
            'Clear your browser cache and cookies for the suspicious site.',
          ],
          protect: [
            'Ensure your web browser and operating system are up to date with the latest security patches.',
            'Check that no background files were downloaded during the visit.',
          ],
          monitor: [
            'Watch for suspicious follow-up emails targeting you with personalized lures.',
          ],
          seekHelp: 'If no credentials or downloads were involved, the risk is typically low once the tab is closed.',
        };
      case 'reply':
        return {
          title: 'Replied to Sender Recovery Plan',
          immediate: [
            'Cease all further communication with the sender.',
            'Do not engage in follow-up arguments or attempts to verify via the same thread.',
          ],
          protect: [
            'Be aware that attackers now know your email address is active and may send more targeted lures.',
            'Filter or block the sender domain in your email client settings.',
          ],
          monitor: [
            'Be vigilant against incoming messages pretending to follow up on your conversation.',
          ],
          seekHelp: 'Report the sender address to your email provider or IT security team.',
        };
      default:
        return {
          title: 'General Security Incident Recovery Plan',
          immediate: [
            'Change the passwords for any accounts associated with the email request.',
            'Close all open tabs and avoid opening any attachments or links.',
          ],
          protect: [
            'Enable 2FA/MFA across your primary email and banking accounts.',
            'Run a malware scan on your computer or mobile device.',
          ],
          monitor: [
            'Monitor your inbox for password reset requests or unauthorized login notices.',
          ],
          seekHelp: 'When in doubt, consult your organization’s security team or an IT professional.',
        };
    }
  };

  const plan = getRecoveryPlan(selectedScenario);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-bg/85 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-aurora-surface border border-aurora-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-aurora-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-aurora-violet/10 border border-aurora-violet/30 text-aurora-violet">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Incident Recovery Guide</h3>
              <p className="text-xs text-slate-400">
                That's okay. Let's calmly go through the next protective steps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-aurora-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select What Happened */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Step 1: What happened?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {scenarios.map((s) => {
              const Icon = s.icon;
              const isSelected = selectedScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-aurora-cardElevated border-aurora-violet text-white shadow-sm ring-1 ring-aurora-violet'
                      : 'bg-aurora-card border-aurora-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-aurora-violet' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold leading-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Structured Recovery Plan */}
        <div className="bg-aurora-card border border-aurora-border rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-aurora-cyan" />
            <span>{plan.title}</span>
          </h4>

          {/* Immediate Actions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-security-highRisk block">
              1. What to do right now (Immediate)
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {plan.immediate.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-security-highRisk mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What to Protect */}
          <div className="space-y-1.5 pt-2 border-t border-aurora-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-cyan block">
              2. What to protect & secure
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {plan.protect.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-cyan mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What to Monitor */}
          <div className="space-y-1.5 pt-2 border-t border-aurora-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-security-suspicious block">
              3. What to monitor over the next week
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {plan.monitor.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-security-suspicious mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Seek Help */}
          <div className="pt-2 border-t border-aurora-border text-xs text-slate-400">
            <span className="font-bold text-slate-200">When to seek professional help: </span>
            <span>{plan.seekHelp}</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-aurora-cardElevated hover:bg-aurora-border border border-aurora-border text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all"
          >
            Done with Recovery Guide
          </button>
        </div>

      </div>
    </div>
  );
}
