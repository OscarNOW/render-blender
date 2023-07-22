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

echo.|set /p="%2">stages\audio\%1
start /wait /min "" cmd /c audio.bat %*

move stages\audio\%1 stages\render\%1
start /wait /min "" cmd /c render.bat %*

move stages\render\%1 stages\video\%1
start /wait /min "" cmd /c video.bat %*

move stages\video\%1 stages\done\%1
start /wait /min "" cmd /c done.bat %*
