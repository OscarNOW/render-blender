@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist output\render\ (
    mkdir output\render\
)
if not exist output\render\%1\ (
    mkdir output\render\%1\
)

start /wait /min /high "%1" %3 -b %2 -F PNG -o "%cd%\output\render\%1\####.png" -a