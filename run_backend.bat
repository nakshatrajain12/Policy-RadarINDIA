@echo off
title Policy-Radar Backend (FastAPI)
echo ========================================================
echo Starting Policy-RadarINDIA Backend API (FastAPI)
echo Live at: http://127.0.0.1:8000
echo Docs at: http://127.0.0.1:8000/docs
echo IMPORTANT: KEEP THIS WINDOW OPEN!
echo ========================================================
cd /d "%~dp0"
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
