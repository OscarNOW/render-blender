@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\render\ (
    mkdir stages\render\
)
if not exist stages\render\%1 (
    echo.|set /p="%2">stages\render\%1
)

if not exist output\render\ (
    mkdir output\render\
)
if not exist output\render\%1\ (
    mkdir output\render\%1\
)

@REM %3 -b %2 -F PNG -o %cd%\output\render\%1\####.png -a