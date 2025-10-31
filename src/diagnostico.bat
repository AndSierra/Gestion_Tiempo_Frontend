@echo off
echo ========================================
echo   DIAGNOSTICO DEL SISTEMA
echo ========================================
echo.

echo [1/5] Verificando Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js NO esta instalado
    echo    Descarga: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js instalado
    node --version
)
echo.

echo [2/5] Verificando archivos .env...
if exist ".env" (
    echo ✅ Archivo .env existe
    type .env
) else (
    echo ❌ Archivo .env NO EXISTE
    echo    Creando...
    echo VITE_API_URL=http://localhost:3001/api > .env
    echo ✅ Creado!
)
echo.

if exist "server\.env" (
    echo ✅ Archivo server\.env existe
    type server\.env
) else (
    echo ❌ Archivo server\.env NO EXISTE
    echo    Creando...
    (
        echo PORT=3001
        echo DB_PATH=../database/timetracker.db
        echo NODE_ENV=development
        echo CORS_ORIGIN=http://localhost:5173
    ) > server\.env
    echo ✅ Creado!
)
echo.

echo [3/5] Verificando dependencias...
if exist "node_modules" (
    echo ✅ Dependencias del frontend instaladas
) else (
    echo ❌ Dependencias del frontend NO INSTALADAS
    echo    Necesitas ejecutar: npm install
)

if exist "server\node_modules" (
    echo ✅ Dependencias del backend instaladas
) else (
    echo ❌ Dependencias del backend NO INSTALADAS
    echo    Necesitas ejecutar: cd server ^&^& npm install
)
echo.

echo [4/5] Verificando carpeta database...
if exist "database" (
    echo ✅ Carpeta database existe
) else (
    echo ⚠️  Carpeta database NO existe
    echo    Creando...
    mkdir database
    echo ✅ Creada!
)
echo.

echo [5/5] Verificando si el backend esta corriendo...
echo    Probando: http://localhost:3001/api/health
curl -s http://localhost:3001/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ BACKEND ESTA CORRIENDO!
    curl -s http://localhost:3001/api/health
) else (
    echo ❌ BACKEND NO ESTA CORRIENDO!
    echo.
    echo    ESTE ES TU PROBLEMA!
    echo.
    echo    Para iniciar el backend:
    echo    1. Abre una nueva terminal
    echo    2. cd server
    echo    3. npm run dev
    echo.
    echo    O simplemente ejecuta: start-windows.bat
)
echo.

echo ========================================
echo   RESUMEN DEL DIAGNOSTICO
echo ========================================
echo.

set ISSUES=0

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no instalado
    set /a ISSUES+=1
)

if not exist ".env" (
    echo ❌ Archivo .env falta
    set /a ISSUES+=1
)

if not exist "server\.env" (
    echo ❌ Archivo server\.env falta
    set /a ISSUES+=1
)

if not exist "node_modules" (
    echo ❌ Dependencias frontend faltan
    set /a ISSUES+=1
)

if not exist "server\node_modules" (
    echo ❌ Dependencias backend faltan
    set /a ISSUES+=1
)

curl -s http://localhost:3001/api/health >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend NO esta corriendo
    set /a ISSUES+=1
)

echo.
if %ISSUES% EQU 0 (
    echo ✅ TODO ESTA BIEN!
    echo    El sistema deberia funcionar correctamente.
) else (
    echo ⚠️  SE ENCONTRARON %ISSUES% PROBLEMAS
    echo.
    echo    SOLUCION RAPIDA:
    echo    1. Ejecuta: start-windows.bat
    echo    2. Selecciona opcion 1 (instalar)
    echo    3. Espera a que abran 2 ventanas
    echo    4. Abre: http://localhost:5173
)

echo.
pause
