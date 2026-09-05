"""
Configuration module for FastAPI backend.
Loads settings from environment variables or auto-discovers credentials.json.
"""

import os
import json

class Settings:
    PROJECT_NAME: str = "Phishing & Scam Attack Investigation Platform API"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "prod-threat-hunter-secret-key-982341234-change-in-env")
    
    # Google OAuth2 Credentials
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")
    
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

# Auto-discover credentials.json if GOOGLE_CLIENT_ID not explicitly passed in environment
def auto_load_google_credentials():
    possible_paths = [
        "/etc/secrets/credentials.json",
        os.path.join(os.path.dirname(__file__), "..", "credentials.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "credentials.json"),
        os.path.join(os.path.dirname(__file__), "credentials.json"),
        "credentials.json",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    info = data.get("web") or data.get("installed", {})
                    if info.get("client_id") and info.get("client_secret"):
                        settings.GOOGLE_CLIENT_ID = info["client_id"]
                        settings.GOOGLE_CLIENT_SECRET = info["client_secret"]
                        print(f"[OK] Loaded Google OAuth Client ID from: {path}")
                        break
            except Exception as e:
                print(f"[WARN] Error reading credentials from {path}: {e}")

auto_load_google_credentials()
