@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist output\audio\ (
    mkdir output\audio\
)

if not exist temp\ mkdir temp\
copy renderAudio.py temp\temp.%1.py

set outputFilePath=%cd%\output\audio\%1.wav
set escapedOutputFilePath=%outputFilePath:\=\\%

cd temp
powershell -Command "(gc temp.%1.py) -replace '_outputFilePath_', '%escapedOutputFilePath%' | Out-File -encoding ASCII temp2.%1.py"
cd ..

%3 -b %2 --python "%cd%\temp\temp2.%1.py" --enable-autoexec

del temp\temp.%1.py
del temp\temp2.%1.py