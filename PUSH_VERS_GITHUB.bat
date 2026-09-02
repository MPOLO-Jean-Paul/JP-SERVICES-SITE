@echo off
title Envoi du projet JP-SERVICES vers GitHub
color 0B
echo ========================================================
echo   ENVOI DU PROJET JP-SERVICES VERS GITHUB
echo ========================================================
echo.
echo Depot : https://github.com/MPOLO-Jean-Paul/JP-SERVICES-SITE.git
echo Branche : main
echo.
echo Envoi en cours... Veuillez patienter...
echo (Si une fenetre de connexion GitHub s'ouvre, autorisez-la)
echo.

"C:\laragon\bin\git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo ========================================================
    echo   [SUCCES] Le projet a ete envoye avec succes sur GitHub !
    echo ========================================================
) else (
    color 0C
    echo.
    echo ========================================================
    echo   [INFO] L'envoi a necessite une authentification.
    echo ========================================================
)

echo.
pause
