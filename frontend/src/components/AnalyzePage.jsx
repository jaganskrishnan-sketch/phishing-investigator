import React, { useState } from 'react';
import { Mail, Upload, Inbox, Search, RefreshCw, CheckCircle2, Play, Trash2, ArrowRight, Shield, AlertCircle, FileText, Sparkles } from 'lucide-react';

export const BENCHMARK_PRESETS = {
  paypal: {
    label: '🔴 PayPal Credential Phishing',
    desc: 'Typosquatted paypa1 domain with suspension coercion',
    text: `From: "PayPal Security" <security@paypa1-login.com>
To: target.user@enterprise.com
Date: Tue, 01 Sep 2026 09:30:00 +0000
Subject: Your account will be suspended!
Authentication-Results: spf=fail (sender IP not authorized) dkim=fail dmarc=fail

Dear Valued Customer,

We detected unusual activity and unauthorized login attempts on your PayPal account.
To prevent permanent account suspension, you must verify your identity immediately within 24 hours.

Please click the secure verification link below to confirm your password, card number, and CVV:
http://paypa1-login.com/verify

If you fail to complete this verification, your account will be permanently closed.

Sincerely,
PayPal Security Department`,
  },
  corizo: {
    label: '🔴 Forwarded Corizo/NSDC Scam',
    desc: 'Advance-fee scholarship lure & unauthenticated form',
    text: `---------- Forwarded message ---------
From: <prem@knowledgechakra.com>
Date: Wed, Aug 26, 2026 at 7:02 PM
Subject: FINAL NOTICE | JEEVA K : ALL SEMESTER STUDENTS KINDLY ENROLL : NSDC X CORIZO
To: <727724euec081@skcet.ac.in>

Dear JEEVA K from Sri Krishna College of Engineering and Technology,

Greetings from Corizo, proudly partnering with the National Skill Development Corporation (NSDC)!
We are thrilled to extend an exclusive opportunity to the talented students of Sri Krishna College of Engineering and Technology as part of our flagship summer campaign. By combining forces with NSDC—the powerhouse driving India’s skill development ecosystem—SkipperX bridges the gap between academic learning and industry readiness.

In addition to our government-aligned NSDC collaboration, this program connects you with industry giants like IBM, Deloitte, KPMG, Amazon, Goldman Sachs, Microsoft, TCS, Infosys, and Wipro, alongside premier institutions including NIT, VIT, BIT, SRM, and DYPU.

Act Fast! ONLY 11 SCHOLARSHIP SLOTS REMAINING!

REGISTER NOW: To secure your spot, please complete your application by clicking the link below:
[Apply Now](https://forms.gle/MTM6y13aeNJQT6JP6) (Note: Training fees are applicable.)

Program Structure:
Our comprehensive 3-Month Online Program (2+1 Structure) is designed to transition you seamlessly from a student to an industry professional:
- Month 1: Advanced Training Period
- Month 2: Immersive Internship Period (Real-World Application)
- Month 3: Placement Assistance (100% Support)

Certifications Provided:
- Official NSDC Certification
- Corizo Training Completion Certificate
- Co-Branded Microsoft / AICTE / MSME Internship Certificate
- Letter of Recommendation (LOR)

Contact Information:
For assistance with the verification or registration process, feel free to reach out to our team at support@corizo.info.

Best regards,
The Corizo Team
In Proud Collaboration with NSDC`,
  },
  bookmyshow: {
    label: '🟢 BookMyShow Ticket (Clean)',
    desc: 'Authentic commercial receipt with whitelisted links',
    text: `---------- Forwarded message ---------
From: BookMyShow <tickets@bookmyshow.com>
Date: Sat, Aug 29, 2026 at 8:51 PM
Subject: Your Tickets
To: <merwina3126@gmail.com>

Hi Merwin,
Thank you for booking your movie tickets on BookMyShow!
Booking ID: BMS9823412
Movie: Interstellar (IMAX 2D)
Cinema: PVR Cinemas
Seats: A1, A2
Convenience Fee: Rs. 45.00
Download our app on https://play.google.com/store/apps/details?id=com.bt.bms or https://apps.apple.com/in/app/bookmyshow/id352668880.
Follow us on https://facebook.com/BookMyShowIN and https://instagram.com/bookmyshowin.
View your booking at https://in.bookmyshow.com/my-bookings.`,
  },
};

export default function AnalyzePage({
  rawText,
  setRawText,
  onAnalyzeText,
  onAnalyzeFile,
  isLoading,
  authStatus,
  onLogin,
  gmailMessages,
  onFetchGmailMessages,
  onSelectGmailMessage,
}) {
  const [activeTab, setActiveTab] = useState(authStatus?.is_authenticated ? 'gmail' : 'paste');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingGmail, setIsSearchingGmail] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);

  const handleSearch = async () => {
    setIsSearchingGmail(true);
    await onFetchGmailMessages(searchQuery);
    setIsSearchingGmail(false);
  };

  const handleFileDrop = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAnalyzeFile(file);
    }
  };

  const handleSelectAndAnalyzeGmail = async (msgId) => {
    setSelectedMsgId(msgId);
    await onSelectGmailMessage(msgId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Threat Analysis Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an email from your connected Gmail or import raw headers for deep multi-vector inspection.
          </p>
        </div>
      </div>

      {/* Main Analysis Container */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        
        {/* Ingestion Source Tabs */}
        <div className="flex border-b border-aurora-border bg-aurora-surface overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'gmail'
                ? 'border-aurora-violet text-aurora-violet bg-aurora-card'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Gmail Live Inbox</span>
            {authStatus?.is_authenticated && (
              <span className="w-2 h-2 rounded-full bg-security-safe ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-aurora-violet text-aurora-violet bg-aurora-card'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Paste Email / Forwarded Block</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-aurora-violet text-aurora-violet bg-aurora-card'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload .eml File</span>
          </button>

        </div>

        {/* Tab 1: Gmail Live Inbox */}
        {activeTab === 'gmail' && (
          <div className="p-6">
            {!authStatus?.is_authenticated ? (
              <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                <div className="p-3.5 bg-aurora-violet/10 border border-aurora-violet/20 rounded-2xl w-fit mx-auto text-aurora-violet">
                  <Inbox className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Connect Google Workspace or Gmail</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authorize read-only access to inspect suspicious messages directly from your inbox with zero manual copy-pasting.
                  </p>
                </div>
                <button
                  onClick={onLogin}
                  className="bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-aurora-violet/25 transition-all"
                >
                  Sign in with Google OAuth
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search inbox (e.g. from:support OR subject:urgent)..."
                      className="w-full bg-aurora-bg border border-aurora-border rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-aurora-violet"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearchingGmail}
                    className="flex items-center gap-1.5 bg-aurora-surface hover:bg-aurora-cardElevated border border-aurora-border text-white font-semibold text-xs px-5 py-2 rounded-xl transition-all"
                  >
                    {isSearchingGmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Search</span>
                  </button>
                </div>

                {/* Email Messages List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {gmailMessages && gmailMessages.length > 0 ? (
                    gmailMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 bg-aurora-surface border border-aurora-border rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-aurora-borderLight"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-white truncate">
                              {msg.subject || '(No Subject)'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {msg.date ? msg.date.slice(0, 16) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-aurora-cyan font-mono truncate mb-1">
                            {msg.sender}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {msg.snippet}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSelectAndAnalyzeGmail(msg.id)}
                          disabled={isLoading}
                          className="flex-shrink-0 flex items-center gap-1.5 bg-aurora-violet hover:bg-aurora-violetHover text-white font-bold text-xs px-4 py-2 rounded-lg shadow transition-all group-hover:scale-[1.02]"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Analyze</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-500 space-y-2">
                      <p className="text-xs">Click Search to load your recent inbox messages.</p>
                      <button
                        onClick={() => onFetchGmailMessages('')}
                        className="text-xs text-aurora-cyan hover:underline font-semibold"
                      >
                        Load Recent 15 Emails
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Raw Email Source */}
        {activeTab === 'paste' && (
          <div className="p-6 space-y-4">
            
            {/* Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-aurora-border">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-aurora-violet" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Benchmark Samples:
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(BENCHMARK_PRESETS).map(([k, p]) => (
                  <button
                    key={k}
                    onClick={() => setRawText(p.text)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-aurora-surface hover:bg-aurora-cardElevated text-slate-300 border border-aurora-border transition-all"
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setRawText('')}
                  title="Clear editor"
                  className="p-1 text-slate-500 hover:text-security-highRisk rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw email message with headers or forwarded block (---------- Forwarded message ---------)..."
              rows={9}
              className="w-full bg-aurora-bg border border-aurora-border rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-aurora-violet transition-colors resize-y leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-500">
                Supports RFC-822 headers, webmail dumps, and forwarded message headers.
              </span>
              <button
                onClick={onAnalyzeText}
                disabled={isLoading || !rawText.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-aurora-violet/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4" />
                <span>Investigate Security Signals</span>
              </button>
            </div>

          </div>
        )}

        {/* Tab 3: Upload .eml file */}
        {activeTab === 'upload' && (
          <div className="p-8">
            <div className="border-2 border-dashed border-aurora-border hover:border-aurora-violet rounded-2xl p-10 text-center transition-colors bg-aurora-surface/60">
              <Upload className="w-10 h-10 text-aurora-violet mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">
                Select or Drop an Email File (.eml / .txt)
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Export an email from Outlook, Apple Mail, or Thunderbird and drop it here for static parsing.
              </p>
              <label className="inline-flex items-center gap-2 bg-aurora-card hover:bg-aurora-cardElevated border border-aurora-border text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".eml,.txt"
                  onChange={handleFileDrop}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
