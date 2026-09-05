import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function ProcessingModal({ isOpen }) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      return;
    }
    
    // Smooth realistic progression through actual stages
    const t1 = setTimeout(() => setCurrentStep(2), 250);
    const t2 = setTimeout(() => setCurrentStep(3), 600);
    const t3 = setTimeout(() => setCurrentStep(4), 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Reading email metadata & MIME headers' },
    { id: 2, label: 'Extracting indicators, typosquats & embedded URLs' },
    { id: 3, label: 'Evaluating security signals & authentication (SPF/DKIM)' },
    { id: 4, label: 'Generating AI explanation & risk verdict' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-bg/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-aurora-surface border border-aurora-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-aurora-border">
          <div className="p-2.5 rounded-2xl bg-aurora-violet/15 border border-aurora-violet/30 text-aurora-violet">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Analyzing Security Signals</h3>
            <p className="text-xs text-slate-400">Deep multi-factor email verification in progress...</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3.5">
          {steps.map((s) => {
            const isDone = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <div key={s.id} className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-security-safe flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-aurora-cyan animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium ${
                  isDone ? 'text-slate-300' : isCurrent ? 'text-aurora-cyan font-bold' : 'text-slate-500'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <div className="w-full h-1.5 bg-aurora-card rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-aurora-violet to-aurora-cyan transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
