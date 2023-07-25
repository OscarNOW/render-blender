@echo off
setlocal ENABLEDELAYEDEXPANSION

@REM %1     id
@REM %2     project path
@REM %3     blender path

if exist output\error\%1.txt exit /b 0

set errorMessage=There has been an unknown error
if exist temp\error.%1.txt set /p errorMessage=< temp\error.%1.txt

echo Error:
echo !errorMessage!

if not exist output\error\ mkdir output\error\
echo|set /p="!errorMessage!">output\error\%1.txt
exit /b 0
