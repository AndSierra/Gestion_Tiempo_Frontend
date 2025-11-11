@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: RUTAS DE LOS PROYECTOS
set FRONTEND_PATH=C:\Users\andsi\Documents\Desarrollo\Gestion_Tiempo_Frontend
set BACKEND_PATH=C:\Users\andsi\Documents\Desarrollo\Gestion_Tiempo_Backend

echo ========================================
echo   TimeTracker - Iniciar Sistema
echo ========================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado.
    echo Instálalo desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detectado:
node --version
echo npm version:
npm --version
echo.

:: ===== FRONTEND =====
echo --- Verificando entorno FRONTEND ---
cd /d "%FRONTEND_PATH%"
if not exist ".env" (
    echo [ADVERTENCIA] No se encontro .env
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] .env creado desde .env.example
    ) else (
        echo VITE_API_URL=http://localhost:3001/api > .env
        echo [OK] .env creado manualmente
    )
)
echo.

:: ===== BACKEND =====
echo --- Verificando entorno BACKEND ---
cd /d "%BACKEND_PATH%"
if not exist ".env" (
    echo [ADVERTENCIA] No se encontro server\.env
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] .env creado desde .env.example
    ) else (
        (
            echo PORT=3001
            echo DB_PATH=../database/timetracker.db
            echo NODE_ENV=development
            echo CORS_ORIGIN=http://localhost:5173
        ) > .env
        echo [OK] .env creado manualmente
    )
)
echo.

:: ===== INSTALACIÓN OPCIONAL =====
echo Es esta la primera vez que ejecutas el proyecto?
echo 1. Si - Instalar dependencias
echo 2. No - Solo iniciar
set /p FIRST_TIME="Selecciona opcion (1 o 2): "

if "%FIRST_TIME%"=="1" (
    echo.
    echo [1/2] Instalando dependencias FRONTEND...
    cd /d "%FRONTEND_PATH%"
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Fallo la instalación del frontend
        pause
        exit /b 1
    )

    echo.
    echo [2/2] Instalando dependencias BACKEND...
    cd /d "%BACKEND_PATH%"
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Fallo la instalación del backend
        pause
        exit /b 1
    )

    echo.
    echo [OK] Instalación completada exitosamente!
    echo.
)

:: ===== INICIO DE SISTEMA =====
echo ========================================
echo   Iniciando Sistema TimeTracker
echo ========================================
echo.
echo Se abrirán dos ventanas:
echo   1. Backend (API)
echo   2. Frontend (cliente web)
echo.
pause

:: Iniciar backend
echo Iniciando BACKEND...
start "TimeTracker - Backend API" cmd /k "cd /d %BACKEND_PATH% && npm run dev"

:: Esperar unos segundos
ping 127.0.0.1 -n 4 >nul

:: Iniciar frontend
echo Iniciando FRONTEND...
start "TimeTracker - Frontend" cmd /k "cd /d %FRONTEND_PATH% && npm run dev"

echo.   
echo ========================================
echo  ✅ TimeTracker iniciado correctamente
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Credenciales de prueba:
echo   Email: admin@timetracker.com
echo   Password: admin123
echo.
pause
endlocal