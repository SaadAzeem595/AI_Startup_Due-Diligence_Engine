@echo off
cd /d "D:\AI_Startup_Due-Diligence_Engine"
"D:\AI_Startup_Due-Diligence_Engine\apps\api\.venv\Scripts\python.exe" -m uvicorn apps.api.main:app --reload --port 8000 < nul > "D:\AI_Startup_Due-Diligence_Engine\logs\backend.log" 2>&1
