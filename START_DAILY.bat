@echo off
echo.
echo ====================================
echo    AI LEARNING PLATFORM - DAILY START
echo ====================================
echo.

echo [1/3] Starting PostgreSQL Database...
cd /d "C:\Users\John Jeslhee\bulsu ai\BSU-AI-Tutor"
docker-compose up -d

echo.
echo [2/3] Starting Backend Server...
start "" cmd /c "cd server && npm run dev"

echo.
echo [3/3] Starting Frontend (Vite)...
start "" cmd /c "cd client && npm run dev"

echo.
echo ALL SERVICES STARTED!
echo    → Frontend: http://localhost:3000
echo    → Backend:  http://localhost:5000
echo    → Login: student1@ailearning.com / student123
echo.
echo Close this window anytime. Services keep running.
pause