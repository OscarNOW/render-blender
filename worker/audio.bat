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

@REM todo-imp: fix command
%3 -b %2 --python "%cd%\renderAudio.py"