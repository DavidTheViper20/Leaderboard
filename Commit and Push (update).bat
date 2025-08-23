@echo off
REM Change to your repo directory
cd "C:\Users\David\Desktop\Leaderboard Webpage\Leaderboard"

REM Add all changes
git add .

REM Commit with a message (you can edit this or pass as argument)
set /p COMMITMSG=Enter commit message: 
git commit -m "%COMMITMSG%"

REM Push to main branch
git push origin main

echo.
echo Done! Press any key to exit.
pause >nul
