@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist output\video\ (
    mkdir output\video\
)

cd output
cd audio
set audioPath=%cd%\%1.wav
cd ..
cd ..

cd output
cd render
cd %1
set filePath=%cd%\

set frameAmount=0
for %%A in (*) do set /a frameAmount+=1

cd ..
cd ..
cd ..

cd output
cd analyse
cd %1
set /p fps= < framerate.txt
cd ..
cd ..
cd ..

if not exist ffmpeg\bin\ (
    echo|set /p="'ffmpeg\bin\' doesn't exist in '%cd%'">output\error\%1.txt
    exit /b 1
)

cd ffmpeg
cd bin

start /wait /min /high "%1" ffmpeg -framerate %fps% -f image2 -i "%filePath%%%04d.png" -i "%audioPath%" -vcodec libx264 -crf 25 -pix_fmt yuv420p -vframes %frameAmount% %1.mp4

move %1.mp4 ..\..\output\video\%1.mp4

cd ..
cd ..