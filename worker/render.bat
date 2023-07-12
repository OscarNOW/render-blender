@echo off
echo Rendering %1 at %2
echo Blender at %3

if not exist render\ (
    mkdir render\
)
echo %2>render\%1

if not exist output\ (
    mkdir output\
)

if not exist output\%1\ (
    mkdir output\%1\
)

%3 -b %2 -F PNG -o %cd%\output\%1\####.png -a

if not exist renderDone\ (
    mkdir renderDone
)
move render\%1 renderDone\%1