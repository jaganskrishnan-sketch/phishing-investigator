"""
Starts the FastAPI Backend server on port 8000 (or $PORT in cloud environments).
"""

import uvicorn
import os
import sys

# Ensure app package is in Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("=" * 70)
    print(f"🛡️ STARTING PHISHING INVESTIGATION PLATFORM BACKEND (Port: {port})")
    print(f"-> API Docs available at: http://localhost:{port}/docs")
    print("=" * 70)
    uvicorn.run("main:app", host="0.0.0.0", port=port)
