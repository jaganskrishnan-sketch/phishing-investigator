# 🛡️ SOC Threat Hunter — Phishing Attack Investigation Platform (PS-02)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Security](https://img.shields.io/badge/Zero--Retention-Privacy%20Guaranteed-10b981.svg)](https://github.com)

An enterprise-grade, multi-vector email threat investigation platform that answers email authenticity questions with **defensible evidence rather than bare verdicts**. Combines high-speed deterministic heuristics with AI reasoning to detect credential harvesting, advance-fee traps, typosquatting lookalikes, and generate instant **PDF Incident Reports**.

---

## 🌟 Key Architecture & Features

* **Separate Full-Stack Architecture:**
  * **Backend (`FastAPI`):** Asynchronous REST API, MIME/RFC-822 email parser, threat scoring engine, and Vector PDF generator via ReportLab.
  * **Frontend (`React + Vite + Tailwind CSS`):** Cyber SOC dark theme dashboard with real-time risk gauges and IOC breakdown.
* **Public Multi-User Google OAuth 2.0:** Secure web-based authorization flow using encrypted session cookies, enabling public visitors to inspect their own Gmail inboxes.
* **Zero-Retention Privacy Mode:** All email analysis is performed ephemerally in-memory. Zero emails, tokens, or personal identifiers are stored on servers or written to databases.
* **1-Click SOC Incident Reports:** Generates vector PDF and Markdown reports with MITRE ATT&CK technique mapping (*T1566.002, T1598*), IOC tables, and security playbooks.
* **Forwarded Message Parser:** Intelligently extracts embedded headers from forwarded email blocks (`---------- Forwarded message ---------`).

---

## 📁 Project Structure

```text
phishing_platform_fullstack/
├── .gitignore                      # Hardened exclusions for keys, tokens & envs
├── .env.example                    # Clean environment variable template
├── README.md                       # Complete documentation
│
├── backend/                        # FastAPI REST API Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI application routes & CORS
│   │   ├── config.py               # Environment configuration
│   │   ├── auth.py                 # Multi-user Google OAuth2 flow
│   │   ├── analyzer.py             # 8-Dimensional Threat Scoring Engine
│   │   ├── email_parser.py         # RFC-822 & Forwarded block extractor
│   │   ├── report.py               # PDF (ReportLab) & Markdown report builder
│   │   └── models.py               # Pydantic request & response schemas
│   ├── requirements.txt            # Backend dependencies
│   └── run.py                      # FastAPI runner script
│
└── frontend/                       # React 18 + Vite Web App
    ├── package.json
    ├── vite.config.js              # Vite server & API proxy configuration
    ├── tailwind.config.js          # Cyber dark styling
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Dashboard state & orchestration
        ├── index.css
        ├── components/
        │   ├── Header.jsx          # SOC navigation & Auth status
        │   ├── VerdictCard.jsx     # Glowing dynamic risk banner & gauge
        │   ├── TelemetryGrid.jsx   # SPF/DKIM/DMARC badges & MITRE tags
        │   ├── IndicatorList.jsx   # Severity-ranked fired indicators
        │   └── EmailInputTabs.jsx  # Presets, .eml upload & Gmail fetcher
        └── services/
            └── api.js              # REST API client
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ and npm

---

### 2. Backend Setup (`FastAPI`)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Set up your Google OAuth2 credentials in a `.env` file based on `.env.example`:
   ```bash
   cp ../.env.example .env
   ```
4. Start the FastAPI server:
   ```bash
   python run.py
   ```
   *The backend will start at `http://localhost:8000` (Interactive API docs at `http://localhost:8000/docs`).*

---

### 3. Frontend Setup (`React + Vite`)

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React dashboard will be live at `http://localhost:5173`.*

---

## 🔒 Security & Secret Scanning Compliance

This repository is pre-configured with zero embedded secrets. When pushing to GitHub:
* All private credentials (`credentials.json`, `token.pickle`, `.env`) are excluded in `.gitignore`.
* Tokens exchanged during Google OAuth authentication are stored exclusively inside encrypted HTTP-only browser session cookies.
* No personal data or email bodies are logged or stored.

---

## ⚖️ Threat Scoring & Calibration (PS-02)

| Risk Range | Verdict | Meaning |
| :--- | :--- | :--- |
| **0 – 30 pts** | 🟢 **LIKELY SAFE** | Authentic commercial and business correspondence (BookMyShow, GitHub, Amazon). |
| **31 – 65 pts** | 🟡 **SUSPICIOUS** | Borderline anomalies or domain discrepancies requiring manual verification. |
| **66 – 100 pts** | 🔴 **PHISHING** | Active credential theft, typosquatting lookalikes, or advance-fee scams. |

---

## 📄 License
MIT License. Built for Cybersecurity Problem Statement PS-02.
