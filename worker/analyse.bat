@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist output\analyse\ mkdir output\analyse\
if not exist output\analyse\%1 mkdir output\analyse\%1

cd output
cd analyse
cd %1

set outputPath=%cd%\
set escapedOutputPath=%outputPath:\=\\%

cd ..
cd ..
cd ..

if not exist temp\ mkdir temp\
if exist temp\temp.%1.py del temp\temp.%1.py
if exist temp\temp2.%1.py del temp\temp2.%1.py

copy analyse.py temp\temp.py

cd temp
powershell -Command "(gc temp.py) -replace '_outputPath_', '%escapedOutputPath%' | Out-File -encoding ASCII temp2.py"
cd ..

%3 -b %2 --python "%cd%\temp\temp2.py" --enable-autoexec

del temp\temp.%1.py
del temp\temp2.%1.py