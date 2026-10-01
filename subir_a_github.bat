@echo off
title Subir Proyecto a GitHub (Panecitos)
color 0a

echo ===================================================================
echo       SUBIR SISTEMA DE VENTAS WEB A GITHUB (PANECITOS)
echo       Repositorio: https://github.com/Emperador-Panecitos/Panecitos
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando archivos...
git add .
git status -s

echo.
echo [2/3] Creando commit...
git commit -m "feat: Sistema de Ventas Web JavaScript + Vite listo para Vercel y TiDB Cloud"

echo.
echo [3/3] Enviando cambios a GitHub (git push origin main)...
echo.
echo *******************************************************************
echo NOTA: Si se abre una ventana emergente de GitHub en tu pantalla,
echo haz clic en "Sign in with your browser" para autorizar el envio.
echo *******************************************************************
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================================
    echo   EXITO: Proyecto subido correctamente a GitHub!
    echo   Verifica tus archivos en:
    echo   https://github.com/Emperador-Panecitos/Panecitos
    echo ===================================================================
) else (
    echo.
    echo ===================================================================
    echo   Se requiere autenticacion con tu cuenta de GitHub.
    echo   Puedes autenticarte rapido ejecutando en tu terminal:
    echo   gh auth login
    echo   O ingresando tu Personal Access Token (PAT) de GitHub.
    echo ===================================================================
)

echo.
pause
