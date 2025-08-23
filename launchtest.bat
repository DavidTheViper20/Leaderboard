@echo off
REM Change directory to your project folder
cd /d "C:\Users\David\Desktop\Leaderboard Webpage\Leaderboard"

REM Start the Node.js server
start cmd /k "node server.js"

REM Wait a second for the server to start, then open browser
timeout /t 2
start http://localhost:3000
