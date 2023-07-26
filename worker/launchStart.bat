@echo off
set id=%1

start /min /abovenormal "%id%" cmd /c start.bat %*

exit