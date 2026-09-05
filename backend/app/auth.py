"""
Multi-user Google OAuth2 flow and Gmail API client for Web Applications.
Uses direct token exchange with Google's OAuth2 endpoints for maximum reliability.
"""

import base64
import os
import json
import requests
from typing import List, Dict, Any, Optional
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from config import settings

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

# Global in-memory token store as fallback for localhost sessions
_GLOBAL_TOKEN_STORE: Dict[str, dict] = {}


def get_authorization_url() -> str:
    """Generates the direct Google OAuth authorization URL."""
    base_url = "https://accounts.google.com/o/oauth2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
    }
    query_string = "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in params.items())
    return f"{base_url}?{query_string}"


def exchange_code_for_token(code: str) -> dict:
    """Directly exchanges authorization code for access & refresh tokens."""
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(token_url, data=payload, timeout=15)
    data = response.json()
    
    if "error" in data:
        raise ValueError(f"Google Token Exchange Failed: {data.get('error_description', data.get('error'))}")
    
    token_info = {
        "access_token": data.get("access_token"),
        "refresh_token": data.get("refresh_token"),
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
    }
    return token_info


def save_user_token(session_id: str, token_info: dict):
    """Saves user token in in-memory session cache."""
    _GLOBAL_TOKEN_STORE[session_id] = token_info


def get_user_token(session_id: str) -> Optional[dict]:
    """Retrieves token from session cache."""
    return _GLOBAL_TOKEN_STORE.get(session_id) or _GLOBAL_TOKEN_STORE.get("default_user")


def clear_user_token(session_id: str):
    """Clears user token from session cache."""
    _GLOBAL_TOKEN_STORE.pop(session_id, None)
    _GLOBAL_TOKEN_STORE.pop("default_user", None)


def get_gmail_service_from_token(token_info: dict):
    """Builds a Gmail API service instance from user's token."""
    creds = Credentials(
        token=token_info.get("access_token"),
        refresh_token=token_info.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=SCOPES
    )
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def list_user_messages(token_info: dict, max_results: int = 15, query: str = "") -> List[Dict[str, Any]]:
    """List recent messages for the authenticated user."""
    service = get_gmail_service_from_token(token_info)
    results = service.users().messages().list(
        userId="me", maxResults=max_results, q=query
    ).execute()
    
    message_refs = results.get("messages", [])
    summaries = []
    
    for ref in message_refs:
        msg = service.users().messages().get(
            userId="me", id=ref["id"], format="metadata",
            metadataHeaders=["Subject", "From", "Date"]
        ).execute()
        
        headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
        summaries.append({
            "id": ref["id"],
            "subject": headers.get("Subject", "(No Subject)"),
            "sender": headers.get("From", "(Unknown Sender)"),
            "date": headers.get("Date", ""),
            "snippet": msg.get("snippet", ""),
        })
    return summaries


def fetch_raw_message(token_info: dict, message_id: str) -> str:
    """Fetch raw RFC-822 message string from user's mailbox."""
    service = get_gmail_service_from_token(token_info)
    raw_msg = service.users().messages().get(
        userId="me", id=message_id, format="raw"
    ).execute()
    raw_bytes = base64.urlsafe_b64decode(raw_msg["raw"])
    return raw_bytes.decode('utf-8', errors='replace')
