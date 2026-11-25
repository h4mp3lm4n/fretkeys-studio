@echo off
title FretKeys Studio – Server
cd /d "%~dp0"
echo Starte FretKeys Studio...
echo Die App oeffnet sich gleich automatisch im Browser unter http://localhost:5173/
echo Dieses Fenster einfach offen lassen, solange du die App nutzt.
echo.
start "" http://localhost:5173/
npm run dev
pause
