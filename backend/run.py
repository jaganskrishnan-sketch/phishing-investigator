"""
Starts the FastAPI Backend server on port 8000 (or $PORT in cloud environments).
"""

import os
import sys
import uvicorn

# Ensure app package is in Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, "app")
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from main import app
except ImportError:
    from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("=" * 70)
    print(f"🛡️ STARTING PHISHING INVESTIGATION PLATFORM BACKEND (Port: {port})")
    print(f"-> API Docs available at: http://localhost:{port}/docs")
    print("=" * 70)
    uvicorn.run(app, host="0.0.0.0", port=port)
