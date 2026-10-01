@echo off
title Sistema de Ventas Web - JavaScript + Vite (MySQL mi_base)
color 0b

echo ========================================================
echo   SISTEMA DE VENTAS WEB SOLER - JAVASCRIPT + VITE PURO
echo   Base de datos: MySQL mi_base (XAMPP Puerto 3306)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Servidor Backend MySQL (puerto 3001)...
start "Backend MySQL mi_base (Puerto 3001)" cmd /k "node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Iniciando Servidor Vite Frontend...
start "Frontend Vite (http://localhost:5173)" cmd /k "npm run dev"

echo.
echo ========================================================
echo   Los dos servidores han sido iniciados correctamente.
echo   - Backend API: http://localhost:3001/api/productos
echo   - Frontend:    http://localhost:5173
echo ========================================================
echo.
pause
