@echo off
echo Rendering %1 at %2
echo Blender at %3

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\ (
    mkdir stages\
)
if not exist output\ (
    mkdir output\
)

call :stage "analyse"
exit /b

@REM todo: make a create batch file that does this line
echo.|set /p="%2">stages\analyse\%1

call :stage analyse audio
call :stage audio render
call :stage render video
call :stage video done
call :stage done none

:stage
@REM %~1    stage (stage)
@REM %~2    nextStage (stage/none)

call :stageCore %~1 %~2
if errorlevel 1 call :error
exit /b

:stageCore
@REM %~1    stage (stage)
@REM %~2    nextStage (stage/none)

if not exist stages\%~1\%1 exit /b

if not exist stages\%~1\ mkdir stages\%~1\
start /wait /min "" cmd /c %~1.bat %*
if not "z%~2"=="znone" move stages\%~1\%1 stages\%~2\%1

exit /b

:error
@REM todo: change stage to error and output error message in error output
msg "%username%" There has been an error in the worker batch script. Pausing...
echo There has been an error in the worker batch script. Pausing...
pause
exit /b