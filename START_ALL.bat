@echo off
title Policy-Radar Launcher
echo ========================================================
echo Starting Policy-RadarINDIA (Backend + Frontend)
echo ========================================================
cd /d "%~dp0"

echo [1/3] Starting Backend API on http://127.0.0.1:8000...
start "Policy-Radar Backend" cmd /k "title Policy-Radar Backend (FastAPI) && .\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo [2/3] Waiting for Backend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend UI on http://localhost:3000...
start "Policy-Radar Frontend" cmd /k "title Policy-Radar Frontend (Next.js) && cd frontend && npm.cmd run dev"

echo Opening browser in 4 seconds...
timeout /t 4 /nobreak >nul

start http://localhost:3000

echo ========================================================
echo Done! Please DO NOT CLOSE the two black command windows
echo while using the website.
echo ========================================================
pause

