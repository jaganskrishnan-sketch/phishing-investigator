import React, { useState } from 'react';
import { Mail, Upload, Inbox, Play, Trash2, Search, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export const PRESETS = {
  paypal: {
    label: '🔴 PS-02 PayPal Phishing',
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

export default function EmailInputTabs({
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
  const [activeTab, setActiveTab] = useState('paste');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingGmail, setIsFetchingGmail] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAnalyzeFile(file);
    }
  };

  const handleSearchGmail = async () => {
    setIsFetchingGmail(true);
    await onFetchGmailMessages(searchQuery);
    setIsFetchingGmail(false);
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      
      {/* Preset Scenario Buttons */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Benchmark Test Scenarios:
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setRawText(PRESETS.paypal.text);
              setActiveTab('paste');
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all"
          >
            {PRESETS.paypal.label}
          </button>
          <button
            onClick={() => {
              setRawText(PRESETS.corizo.text);
              setActiveTab('paste');
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            {PRESETS.corizo.label}
          </button>
          <button
            onClick={() => {
              setRawText(PRESETS.bookmyshow.text);
              setActiveTab('paste');
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            {PRESETS.bookmyshow.label}
          </button>
          <button
            onClick={() => setRawText('')}
            title="Clear text"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ingestion Tabs Header */}
      <div className="flex border-b border-slate-800 bg-[#0f172a]/80">
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'paste'
              ? 'border-sky-500 text-sky-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Paste Email Source / Forwarded Block</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'upload'
              ? 'border-sky-500 text-sky-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload .eml File</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'gmail'
              ? 'border-sky-500 text-sky-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Connect Live Gmail Inbox</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* Tab 1: Paste Raw Email */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw email source, MIME headers, or forwarded message block here..."
              rows={8}
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors resize-y leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Supports standard RFC-822 headers and forwarded email dumps.
              </span>
              <button
                onClick={onAnalyzeText}
                disabled={isLoading || !rawText.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Threat Vector...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Investigate Threat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Upload .eml file */}
        {activeTab === 'upload' && (
          <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-10 text-center transition-colors bg-slate-950/40">
            <Upload className="w-10 h-10 text-sky-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">
              Select or Drop an Email File (.eml / .txt)
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Export a suspicious message from your email client and drop it here for static parsing.
            </p>
            <label className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all">
              <span>Browse File</span>
              <input
                type="file"
                accept=".eml,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tab 3: Gmail Live Inbox */}
        {activeTab === 'gmail' && (
          <div>
            {!authStatus?.is_authenticated ? (
              <div className="text-center py-8">
                <Inbox className="w-12 h-12 text-sky-400 mx-auto mb-3 opacity-80" />
                <h4 className="text-base font-bold text-white mb-2">
                  Connect Your Personal Google Workspace / Gmail
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                  Authorize read-only access to inspect suspicious emails directly from your inbox with zero manual copy-pasting.
                </p>
                <button
                  onClick={onLogin}
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 transition-all"
                >
                  Sign in with Google OAuth
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter search (e.g. from:paypal OR subject:verify)..."
                      className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    onClick={handleSearchGmail}
                    disabled={isFetchingGmail}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
                  >
                    {isFetchingGmail ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Email Messages List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {gmailMessages && gmailMessages.length > 0 ? (
                    gmailMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => onSelectGmailMessage(msg.id)}
                        className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="text-xs font-bold text-white truncate">
                            {msg.subject || '(No Subject)'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {msg.sender}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">
                      Click Search to fetch your recent inbox messages.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
