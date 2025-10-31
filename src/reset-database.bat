@echo off
echo ========================================
echo   TimeTracker - Resetear Base de Datos
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminara todos los datos
echo y restaurara la base de datos con datos de ejemplo
echo.
set /p CONFIRM="Estas seguro? (S/N): "

if /i "%CONFIRM%" NEQ "S" (
    echo Operacion cancelada
    pause
    exit /b 0
)

echo.
echo Reseteando base de datos...
cd server
call npm run db:reset

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Base de datos reseteada exitosamente!
) else (
    echo.
    echo ERROR al resetear la base de datos
)

echo.
pause
