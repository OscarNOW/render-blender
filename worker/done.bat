@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist stages\done\ (
    mkdir stages\done\
)
