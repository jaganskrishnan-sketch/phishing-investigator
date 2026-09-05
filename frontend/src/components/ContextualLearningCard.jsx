import React from 'react';
import { BookOpen, AlertTriangle, Lightbulb, Shield, CheckCircle2 } from 'lucide-react';

export default function ContextualLearningCard({ indicators, attackCategory }) {
  // Dynamically determine educational lessons based on actual fired indicators
  const lessons = [];

  const indTexts = (indicators || []).map(i => `${i.category} ${i.finding} ${i.evidence}`).join(' ').toLowerCase();

  if (indTexts.includes('typosquat') || indTexts.includes('similarity') || indTexts.includes('homoglyph')) {
    lessons.push({
      title: 'How Typosquatting & Lookalike Domains Work',
      concept: 'Attackers register domain names that look nearly identical to authentic brands by substituting lookalike characters (such as "paypa1" for "paypal" or "micros0ft" for "microsoft").',
      tip: 'Always inspect the domain name directly after the @ sign in the sender address and before the first forward slash in links.',
    });
  }

  if (indTexts.includes('urgency') || indTexts.includes('suspension') || indTexts.includes('hours') || indTexts.includes('final notice')) {
    lessons.push({
      title: 'Understanding Artificial Urgency & Coercion',
      concept: 'Phishing attacks frequently create synthetic panic (such as "Account will be suspended in 24 hours" or "Final Notice") to make targets act impulsively without verifying.',
      tip: 'Legitimate service providers rarely shut down essential accounts with extreme short-notice countdowns without prior in-app notifications.',
    });
  }

  if (indTexts.includes('forms.gle') || indTexts.includes('free form') || indTexts.includes('typeform')) {
    lessons.push({
      title: 'Abuse of Free Public Form Builders',
      concept: 'Scammers frequently use free form hosting providers (like Google Forms or Typeform) to collect student or corporate credentials because anyone can generate a form link for free.',
      tip: 'Established government bodies, universities, and Fortune 500 companies host application portals on their own authentic verified domain, not public form links.',
    });
  }

  if (indTexts.includes('advance-fee') || indTexts.includes('training fee') || indTexts.includes('scholarship')) {
    lessons.push({
      title: 'Recognizing Advance-Fee & Training Scams',
      concept: 'Attackers offer prestigious "scholarships" or "guaranteed internships" but bury mandatory training or registration fees inside the fine print.',
      tip: 'Authentic corporate internships and government scholarships pay you; they do not require you to pay "mandatory training fees" to secure a position.',
    });
  }

  if (indTexts.includes('credential') || indTexts.includes('password') || indTexts.includes('otp') || indTexts.includes('cvv')) {
    lessons.push({
      title: 'Credential Harvesting Mechanics',
      concept: 'Messages directing you to "confirm your password" or "verify your identity" point to spoofed web pages designed solely to record your keystrokes.',
      tip: 'Never enter passwords or verification codes through links sent in email. Always open a fresh browser tab and navigate to the official portal.',
    });
  }

  // Fallback default lesson if none matched or safe email
  if (lessons.length === 0) {
    lessons.push({
      title: 'Routine Email Verification Habits',
      concept: 'Even when an email appears benign, establishing a routine habit of verifying unexpected attachments and links prevents sophisticated spearphishing attempts.',
      tip: 'Bookmark the authentic login URLs of your primary email, banking, and work accounts rather than clicking links inside message threads.',
    });
  }

  return (
    <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
        <BookOpen className="w-4 h-4 text-aurora-violet" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Learn From This Email — Security Intelligence
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {lessons.map((lesson, idx) => (
          <div key={idx} className="bg-aurora-surface/70 border border-aurora-border rounded-xl p-4 space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-aurora-cyan flex-shrink-0" />
              <span>{lesson.title}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lesson.concept}
            </p>
            <div className="p-2.5 rounded-lg bg-aurora-card border border-aurora-border text-xs text-aurora-cyan font-medium flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-aurora-cyan mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Pro Tip:</strong> {lesson.tip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
