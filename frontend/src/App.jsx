import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardPage from './components/DashboardPage';
import AnalyzePage, { BENCHMARK_PRESETS } from './components/AnalyzePage';
import InvestigationResultView from './components/InvestigationResultView';
import InvestigationsPage from './components/InvestigationsPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import ProcessingModal from './components/ProcessingModal';
import {
  analyzeText,
  analyzeFileUpload,
  downloadPdfReport,
  downloadMarkdownReport,
  checkAuthStatus,
  getGoogleLoginUrl,
  logoutGoogle,
  fetchGmailMessages,
  fetchGmailMessageContent
} from './services/api';
import { AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'phishing_investigator_history_saas_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [authStatus, setAuthStatus] = useState({ is_authenticated: false });
  const [rawText, setRawText] = useState(BENCHMARK_PRESETS.paypal.text);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gmailMessages, setGmailMessages] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [errorNotice, setErrorNotice] = useState(null);

  // Load auth status & persistent history on mount
  useEffect(() => {
    checkAuthStatus()
      .then(res => {
        setAuthStatus(res);
        if (res.is_authenticated) {
          fetchGmailMessages('').then(data => setGmailMessages(data.messages || [])).catch(() => {});
        }
      })
      .catch(() => {});

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setInvestigations(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Check if OAuth returned with an error in query string
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('auth_error');
    if (authError) {
      setErrorNotice(`Google Authentication Notice: ${authError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const saveInvestigation = (resultData, originalSource) => {
    const entry = {
      ...resultData,
      id: resultData.investigation_id || `INV-${Date.now()}`,
      originalContent: originalSource,
      analyzed_at: resultData.analyzed_at || new Date().toISOString()
    };

    setInvestigations(prev => {
      const updated = [entry, ...prev.filter(i => (i.investigation_id || i.id) !== entry.id)].slice(0, 100);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    setInvestigations([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDeleteInvestigation = (id) => {
    setInvestigations(prev => {
      const updated = prev.filter(i => (i.investigation_id || i.id) !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleAnalyzeText = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await analyzeText(rawText);
      setCurrentResult(data);
      saveInvestigation(data, rawText);
      setCurrentTab('result');
    } catch (err) {
      setErrorNotice(err.message || 'Analysis could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFile = async (file) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await analyzeFileUpload(file);
      setCurrentResult(data);
      saveInvestigation(data, `[File Uploaded: ${file.name}]`);
      setCurrentTab('result');
    } catch (err) {
      setErrorNotice(err.message || 'File analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGmailMessage = async (msgId) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const { raw_content } = await fetchGmailMessageContent(msgId);
      setRawText(raw_content);
      const data = await analyzeText(raw_content);
      setCurrentResult(data);
      saveInvestigation(data, raw_content);
      setCurrentTab('result');
    } catch (err) {
      setErrorNotice(err.message || 'Unable to fetch selected Gmail message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchGmail = async (query = '') => {
    try {
      const res = await fetchGmailMessages(query);
      setGmailMessages(res.messages || []);
    } catch (err) {
      setErrorNotice(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const { auth_url } = await getGoogleLoginUrl();
      window.location.href = auth_url;
    } catch (err) {
      setErrorNotice(
        'Google OAuth Notice: Please ensure credentials.json is configured in backend or set environment variables.'
      );
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setAuthStatus({ is_authenticated: false });
    setGmailMessages([]);
  };

  const handleDownloadPdf = async (sourceContent) => {
    try {
      const content = sourceContent || rawText;
      const blob = await downloadPdfReport(content);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishing_investigation_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('PDF generation error: ' + err.message);
    }
  };

  const handleDownloadMarkdown = async (sourceContent) => {
    try {
      const content = sourceContent || rawText;
      const md = await downloadMarkdownReport(content);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishing_investigation_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Markdown generation error: ' + err.message);
    }
  };

  const handleSelectHistoricalInvestigation = (item) => {
    setCurrentResult(item);
    if (item.originalContent && !item.originalContent.startsWith('[File Uploaded')) {
      setRawText(item.originalContent);
    }
    setCurrentTab('result');
  };

  return (
    <div className="min-h-screen bg-aurora-bg text-slate-100 flex flex-col selection:bg-aurora-violet selection:text-white font-sans bg-aurora-gradient">
      
      {/* SaaS Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        authStatus={authStatus}
        onLogin={handleLogin}
        onLogout={handleLogout}
        investigationsCount={investigations.length}
      />

      {/* Realistic Stage Processing Modal */}
      <ProcessingModal isOpen={isLoading} />

      {/* Notification / Error Banner */}
      {errorNotice && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-security-suspiciousBg border border-security-suspiciousBorder text-security-suspicious p-4 rounded-2xl text-xs flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-security-suspicious mt-0.5 flex-shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="p-1 hover:bg-aurora-surface rounded-lg text-security-suspicious"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Landing Page */}
        {currentTab === 'landing' && (
          <LandingPage
            onStartAnalysis={() => setCurrentTab('analyze')}
            onLearnMore={() => {
              const el = document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            authStatus={authStatus}
            onLogin={handleLogin}
          />
        )}

        {/* Dashboard View */}
        {currentTab === 'dashboard' && (
          <DashboardPage
            investigations={investigations}
            onNavigate={setCurrentTab}
            onSelectInvestigation={handleSelectHistoricalInvestigation}
          />
        )}

        {/* Analyze View */}
        {currentTab === 'analyze' && (
          <AnalyzePage
            rawText={rawText}
            setRawText={setRawText}
            onAnalyzeText={handleAnalyzeText}
            onAnalyzeFile={handleAnalyzeFile}
            isLoading={isLoading}
            authStatus={authStatus}
            onLogin={handleLogin}
            gmailMessages={gmailMessages}
            onFetchGmailMessages={handleFetchGmail}
            onSelectGmailMessage={handleSelectGmailMessage}
          />
        )}

        {/* Investigation Result Dossier View */}
        {currentTab === 'result' && (
          <InvestigationResultView
            result={currentResult}
            onDownloadPdf={() => handleDownloadPdf(currentResult?.originalContent || rawText)}
            onDownloadMarkdown={() => handleDownloadMarkdown(currentResult?.originalContent || rawText)}
            onNewAnalysis={() => setCurrentTab('analyze')}
          />
        )}

        {/* Investigations History View */}
        {currentTab === 'investigations' && (
          <InvestigationsPage
            investigations={investigations}
            onSelectInvestigation={handleSelectHistoricalInvestigation}
            onDeleteInvestigation={handleDeleteInvestigation}
            onClearAll={handleClearAllHistory}
            onNavigate={setCurrentTab}
          />
        )}

        {/* Reports View */}
        {currentTab === 'reports' && (
          <ReportsPage
            investigations={investigations}
            onDownloadPdf={handleDownloadPdf}
            onDownloadMarkdown={handleDownloadMarkdown}
            onNavigate={setCurrentTab}
          />
        )}

        {/* Settings View */}
        {currentTab === 'settings' && (
          <SettingsPage
            authStatus={authStatus}
            onLogin={handleLogin}
            onLogout={handleLogout}
            investigationsCount={investigations.length}
            onClearAllHistory={handleClearAllHistory}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-aurora-border bg-aurora-surface py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-400">Phishing Investigator SaaS Platform • Enterprise Email Security</span>
          <span>In-Memory Zero-Retention Privacy Architecture</span>
        </div>
      </footer>

    </div>
  );
}
