@echo off
echo ========================================
echo   TimeTracker - Detener Sistema
echo ========================================
echo.

:: Matar proceso de Node.js
echo Deteniendo procesos de Node.js...
taskkill /F /IM node.exe >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Procesos detenidos exitosamente
) else (
    echo No hay procesos de Node.js ejecutandose
)

echo.
echo Sistema detenido
pause
