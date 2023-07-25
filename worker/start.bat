@echo off
setlocal ENABLEDELAYEDEXPANSION

set id=%1
set projectPath=%2
set blenderPath=%3

echo Processing !id! at !projectPath!
echo Blender at !blenderPath!

if not exist stages\ mkdir stages\
if not exist output\ mkdir output\

call :stage notStarted analyse
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

if not "z!nextStage!"=="znone" (
    if not exist stages\!nextStage!\ mkdir stages\!nextStage!\
    move stages\!stage!\!id! stages\!nextStage!\!id!
)

exit /b

:error
set stage=%~1
set nextStage=%~2

if "z!stage!"=="zerror" (
    msg "%username%" There has been an error in the error handling of the worker batch script
    echo There has been an error in the error handling of the worker batch script
) else (
    if not exist temp\error.!id!.txt (
        echo|set /p="There has been an unknown error in the stage '!stage!' with nextStage '!nextStage!'">temp\error.!id!.txt
    )
    
    if not exist stages\error\ mkdir stages\error\
    move stages\!stage!\!id! stages\error\!id!
    call :stage error none
)
exit /b