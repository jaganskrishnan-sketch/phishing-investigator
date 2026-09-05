import React, { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, AlertCircle } from 'lucide-react';

export default function BeforeYouClickChecklist() {
  const [checked, setChecked] = useState({});

  const items = [
    { id: 'expected', text: 'Was I expecting this email or communication?' },
    { id: 'sender', text: 'Do I recognize the sender address and organization domain?' },
    { id: 'match', text: 'Does the sender domain match the official organization referenced?' },
    { id: 'urgency', text: 'Is the message pressuring me with artificial urgency (e.g. 24 hours, account suspension)?' },
    { id: 'sensitive', text: 'Is it asking for sensitive information (passwords, PIN, OTP, card details)?' },
    { id: 'payment', text: 'Is it asking me to make an unusual or unexpected payment?' },
    { id: 'url', text: 'Does the destination URL actually match the authentic website (checked without clicking)?' },
    { id: 'verify', text: 'Can I verify this request through an independent official channel (app or phone)?' },
  ];

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-aurora-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Before You Click — Interactive Verification Checklist
          </h3>
        </div>
        <span className="text-[11px] font-mono text-aurora-cyan">
          {completedCount} / {items.length} Checked
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Review these safety habits before interacting with any external email. Completing this checklist builds protective verification habits.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs ${
                isChecked
                  ? 'bg-aurora-cardElevated border-aurora-violet/40 text-slate-200'
                  : 'bg-aurora-surface/60 border-aurora-border text-slate-400 hover:text-slate-300 hover:border-aurora-borderLight'
              }`}
            >
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-aurora-violet mt-0.5 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
              )}
              <span className="leading-snug">{item.text}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-2 text-[11px] text-slate-500 italic">
        Note: Completing verification items builds safety habits but does not guarantee an email is safe if suspicious indicators were detected.
      </div>
    </div>
  );
}
