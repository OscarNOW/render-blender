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
set escapedOutputFilePath=%outputFilePath:\=\\%

cd temp
powershell -Command "(gc temp.py) -replace '_outputFilePath_', '%escapedOutputFilePath%' | Out-File -encoding ASCII temp2.py"
cd ..

@REM %3 -b %2 --python "%cd%\temp\temp2.py" --enable-autoexec
%3 -b %2 --python "%cd%\temp\temp2.py" --enable-autoexec --python-console
