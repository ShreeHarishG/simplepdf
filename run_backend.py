# run_backend.py
import uvicorn
import sys
import os

if __name__ == "__main__":
    print("==================================================")
    print("  TFRENZY Simple PDF - Python Backend Suite")
    print("  Host: http://localhost:8000")
    print("  API Docs: http://localhost:8000/docs")
    print("==================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
