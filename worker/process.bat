@echo off
setlocal ENABLEDELAYEDEXPANSION

set id=%1
set projectPath=%2
set blenderPath=%3

echo Processing !id! at !projectPath!
echo Blender at !blenderPath!

if not exist stages\ (
    mkdir stages\
)
if not exist output\ (
    mkdir output\
)

@REM todo: make a create batch file that does this
if not exist stages\starting\ mkdir stages\starting
echo.|set /p="!projectPath!">stages\starting\!id!

call :stage starting analyse
call :stage analyse audio
call :stage audio render
call :stage render video
call :stage video done
call :stage done none
exit /b

:stage
set stage=%~1
set nextStage=%~2

call :stageCore !stage! !nextStage!
if errorlevel 1 call :error !stage! !nextStage!
exit /b

:stageCore
set stage=%~1
set nextStage=%~2

if not exist stages\!stage!\!id! exit /b

if not exist stages\!stage!\ mkdir stages\!stage!\

start /wait /min "" cmd /c !stage!.bat !id! !projectPath! !blenderPath!
set el=%errorlevel%
if not "z%el%"=="z0" exit /b %el%

if not "z!nextStage!"=="znone" move stages\!stage!\!id! stages\!nextStage!\!id!

exit /b

:error
set stage=%~1
set nextStage=%~2

@REM todo: change stage to error and output error message in error output
msg "%username%" There has been an error in the worker batch script. Stage: "!stage!", nextStage: "!nextStage!".
echo There has been an error in the worker batch script. Stage: "!stage!", nextStage: "!nextStage!".
exit /b