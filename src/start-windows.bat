@echo off
echo ========================================
echo   TimeTracker - Iniciar Sistema
echo ========================================
echo.

:: Verificar si Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detectado: 
node --version
echo npm version: 
npm --version
echo.

:: Verificar y crear archivos .env
if not exist ".env" (
    echo [ADVERTENCIA] No se encontro el archivo .env
    echo Creando .env desde .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Archivo .env creado
    ) else (
        echo [ERROR] No se encontro .env.example
        echo Creando .env manualmente...
        echo VITE_API_URL=http://localhost:3001/api > .env
        echo [OK] Archivo .env creado
    )
    echo.
)

if not exist "server\.env" (
    echo [ADVERTENCIA] No se encontro server\.env
    echo Creando server\.env desde server\.env.example...
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo [OK] Archivo server\.env creado
    ) else (
        echo [ERROR] No se encontro server\.env.example
        echo Creando server\.env manualmente...
        (
            echo PORT=3001
            echo DB_PATH=../database/timetracker.db
            echo NODE_ENV=development
            echo CORS_ORIGIN=http://localhost:5173
        ) > server\.env
        echo [OK] Archivo server\.env creado
    )
    echo.
)

:: Preguntar si es la primera vez
echo Es esta la primera vez que ejecutas el proyecto?
echo 1. Si - Instalar dependencias
echo 2. No - Solo iniciar
set /p FIRST_TIME="Selecciona opcion (1 o 2): "

if "%FIRST_TIME%"=="1" (
    echo.
    echo [1/3] Instalando dependencias del FRONTEND (raiz)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Fallo la instalacion del frontend
        pause
        exit /b 1
    )
    
    echo.
    echo [2/3] Instalando dependencias del SERVIDOR...
    cd server
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Fallo la instalacion del servidor
        pause
        exit /b 1
    )
    cd ..
    
    echo.
    echo Instalacion completada exitosamente!
    echo.
)

:: Crear carpeta database si no existe
if not exist database mkdir database

echo ========================================
echo   Iniciando Sistema
echo ========================================
echo.
echo Se abriran DOS ventanas de terminal:
echo   1. Backend (servidor API)
echo   2. Frontend (cliente web)
echo.
echo NO CIERRES estas ventanas mientras uses la aplicacion
echo.
pause

:: Iniciar backend en una nueva ventana
echo Iniciando BACKEND...
start "TimeTracker - Backend API" cmd /k "cd server && npm run dev"

:: Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak >nul

:: Iniciar frontend en una nueva ventana
echo Iniciando FRONTEND...
start "TimeTracker - Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Sistema Iniciado
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Abre tu navegador en: http://localhost:5173
echo.
echo Credenciales de prueba:
echo   Email: admin@timetracker.com
echo   Password: admin123
echo.
echo IMPORTANTE: Si ves errores de variables de entorno,
echo lee el archivo ENV_SETUP.md para solucionarlo.
echo.
echo Presiona cualquier tecla para cerrar esta ventana
echo (Las otras 2 ventanas deben permanecer abiertas)
pause >nul
