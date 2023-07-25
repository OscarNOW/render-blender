@echo off
setlocal ENABLEDELAYEDEXPANSION

set id=%1
set projectPath=%2
set blenderPath=%3

echo Creating !id! at !projectPath!
echo Blender at !blenderPath!

if not exist stages\ mkdir stages\

if not exist stages\notStarted\ mkdir stages\notStarted
echo.|set /p="!projectPath!">stages\notStarted\!id!

exit /b