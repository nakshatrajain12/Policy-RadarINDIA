@echo off
title Policy-Radar Frontend (Next.js)
echo ========================================================
echo Starting Policy-RadarINDIA Frontend (Next.js)
echo Live at: http://localhost:3000
echo IMPORTANT: KEEP THIS WINDOW OPEN!
echo ========================================================
cd /d "%~dp0frontend"
call npm.cmd run dev
pause
