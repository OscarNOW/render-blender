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
copy analyse.py temp\temp.%1.py

cd temp
powershell -Command "(gc temp.%1.py) -replace '_outputPath_', '%escapedOutputPath%' | Out-File -encoding ASCII temp2.%1.py" < nul
cd ..

start /wait /min /high "%1" %3 -b %2 --python "%cd%\temp\temp2.%1.py" --enable-autoexec

del temp\temp.%1.py
del temp\temp2.%1.py
