@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\done\ (
    mkdir stages\done\
)
if not exist stages\done\%1 (
    move stages\video\%1 stages\done\%1
)