@echo off

@REM %1     id
@REM %2     project path
@REM %3     blender path

if not exist output\analyse\ (
    mkdir output\analyse\
)

@REM todo