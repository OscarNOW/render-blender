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

if not exist ffmpeg\bin\ (
    msg "%username%" ffmpeg\bin\ doesn't exist in %cd%
    pause
    exit
)

cd ffmpeg
cd bin

@REM get duration of audio

ffprobe -i "%audioPath%" -show_entries format=duration -v quiet -of csv="p=0">temp.txt
set /p animationSeconds= < temp.txt
del temp.txt 


@REM calculate fps

powershell -Command "[Math]::Round(%frameAmount%/%animationSeconds%, 0)">temp.txt
set /p fps= < temp.txt
del temp.txt


@REM generate video

@REM todo: add audio to video
ffmpeg -framerate %fps% -f image2 -i "%filePath%%%04d.png" -vcodec libx264 -crf 25 -pix_fmt yuv420p -vframes %frameAmount% %1.mp4

move %1.mp4 ..\..\output\video\%1.mp4

cd ..
cd ..