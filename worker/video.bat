@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\video\ (
    mkdir stages\video\
)
if not exist stages\video\%1 (
    move stages\audio\%1 stages\video\%1
)

if not exist output\video\ (
    mkdir output\video\
)

cd output
cd render

if not exist %1\ (
    msg "%username%" %1 doesn't exist in %cd%
    pause
    exit
)

cd %1
set filePath=%cd%\

cd ..
cd ..
cd ..

if not exist ffmpeg\bin\ (
    msg "%username%" ffmpeg\bin\ doesn't exist in %cd%
    pause
    exit
)

cd ffmpeg
cd bin

@REM @REM todo-imp: get fps, amount frames
ffmpeg -framerate 60 -f image2 -i "%filePath%%%04d.png" -vcodec libx264 -crf 25 -pix_fmt yuv420p -vframes 5 %1.mp4
move %1.mp4 ..\..\output\video\%1.mp4

cd ..
cd ..