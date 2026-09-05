/**
 * API client service communicating with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

export async function analyzeText(rawContent) {
  const res = await fetch(`${API_BASE}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_content: rawContent }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Analysis failed. Please check the email format.');
  }
  return res.json();
}

export async function analyzeFileUpload(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE}/analyze/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'File analysis failed.');
  }
  return res.json();
}

export async function downloadPdfReport(rawContent) {
  const res = await fetch(`${API_BASE}/report/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_content: rawContent }),
  });
  if (!res.ok) throw new Error('PDF Generation failed');
  return res.blob();
}

export async function downloadMarkdownReport(rawContent) {
  const res = await fetch(`${API_BASE}/report/markdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_content: rawContent }),
  });
  if (!res.ok) throw new Error('Markdown Report Generation failed');
  return res.text();
}

export async function checkAuthStatus() {
  const res = await fetch(`${API_BASE}/auth/status`, {
    credentials: 'include'
  });
  if (!res.ok) return { is_authenticated: false };
  return res.json();
}

export async function getGoogleLoginUrl() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to initiate Google sign-in.');
  }
  return res.json();
}

export async function logoutGoogle() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

export async function fetchGmailMessages(query = '') {
  const res = await fetch(`${API_BASE}/gmail/messages?query=${encodeURIComponent(query)}`, {
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch Gmail messages.');
  }
  return res.json();
}

export async function fetchGmailMessageContent(messageId) {
  const res = await fetch(`${API_BASE}/gmail/message/${messageId}`, {
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch message body.');
  }
  return res.json();
}
