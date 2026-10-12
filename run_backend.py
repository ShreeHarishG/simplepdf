# run_backend.py
import uvicorn
import sys
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("==================================================")
    print(f"  Simple PDF - Python Backend Suite")
    print(f"  Host: http://0.0.0.0:{port}")
    print(f"  API Docs: http://localhost:{port}/docs")
    print("==================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

