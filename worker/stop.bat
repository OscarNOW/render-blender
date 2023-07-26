@echo off
setlocal ENABLEDELAYEDEXPANSION
set id=%1

taskkill /f /fi "windowtitle eq !id!"

exit /b