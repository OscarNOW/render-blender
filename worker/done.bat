@echo off

if not exist stages\done\ (
    mkdir stages\done\
)
if not exist stages\done\%1 (
    move stages\video\%1 stages\done\%1
)