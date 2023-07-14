@echo off

if not exist stages\render\ (
    mkdir stages\render\
)
if not exist stages\render\%1\ (
    echo %2>render\%1\
)

if not exist output\render\ (
    mkdir output\render\
)
if not exist output\render\%1\ (
    mkdir output\render\%1\
)

%3 -b %2 -F PNG -o %cd%\output\render\%1\####.png -a