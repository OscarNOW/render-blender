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

start /wait "" cmd /c render.bat %*
start /wait "" cmd /c  video.bat %*
start /wait "" cmd /k  done.bat %*

echo pausinig
pause