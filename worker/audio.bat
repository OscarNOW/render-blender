@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\audio\ (
    mkdir stages\audio\
)
if not exist stages\audio\%1 (
    move stages\render\%1 stages\audio\%1
)

if not exist output\audio\ (
    mkdir output\audio\
)

if not exist temp\ (
    mkdir temp\
)
if exist temp\temp.py (
    del temp\temp.py
)
if exist temp\temp2.py del temp\temp2.py
copy renderAudio.py temp\temp.py

set outputFilePath=%cd%\output\audio\%1.wav

cd temp
powershell -Command "(gc temp.py) -replace '|outputFilePath|', '%outputFilePath%' | Out-File -encoding ASCII temp2.py"
cd ..

%3 -b %2 --python "%cd%\temp\temp2.py"