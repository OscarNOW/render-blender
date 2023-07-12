@echo off
echo Rendering %1

if not exist output/ (
    mkdir output
)

if not exist output/%1 (
    mkdir output/%1
)

blender -b render/%1 -F PNG -o output/%1/####.png -a

if not exist renderDone/ (
    mkdir renderDone
)
move render/%1 renderDone/%1