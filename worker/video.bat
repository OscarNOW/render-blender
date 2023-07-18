@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\video\ (
    mkdir stages\video\
)
if not exist stages\video\%1 (
    move stages\render\%1 stages\video\%1
)

if not exist output\video\ (
    mkdir output\video\
)

cd ouput
cd render
set filePath=%cd%
cd ..
cd ..

@REM todo: get fps, amount frames

cd ffmpeg
ffmpeg -framerate 60 -f image2 -i "%filePath%\%04d.png" -vcodec libx264 -crf 25 -pix_fmt yuv420p -vframes 1069 %1.mp4
move %1.mp4 ..\output\video\%1.mp4
cd ..