"""
Starts the FastAPI Backend server on port 8000.
"""

import uvicorn
import os
import sys

# Ensure app package is in Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

if __name__ == "__main__":
    print("=" * 70)
    print("🛡️ STARTING PHISHING INVESTIGATION PLATFORM BACKEND (FastAPI)")
    print("-> API Docs available at: http://localhost:8000/docs")
    print("-> OpenAPI Schema at:    http://localhost:8000/openapi.json")
    print("=" * 70)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
