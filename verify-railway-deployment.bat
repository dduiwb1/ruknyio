@echo off
REM Railway Deployment Verification Script (Windows)
REM This script verifies that all necessary files are in place for Railway deployment

setlocal enabledelayedexpansion

echo.
echo 🚀 Railway Deployment Verification Script (Windows)
echo ==========================================
echo.

set ERRORS=0

REM Check if file exists
call :check_file "Dockerfile"
call :check_file ".dockerignore"
call :check_file "railway.json"
call :check_file "apps\api\.env.production"
call :check_file "RAILWAY_DEPLOYMENT_GUIDE.md"

echo.
echo 📁 Checking Project Structure...
echo.

call :check_dir "apps\api"
call :check_dir "apps\api\src"
call :check_dir "apps\api\prisma"
call :check_dir "packages"

echo.
echo 🔧 Checking Configuration Files...
echo.

call :check_file "apps\api\package.json"
call :check_file "apps\api\tsconfig.json"
call :check_file "apps\api\nest-cli.json"
call :check_file "apps\api\prisma\schema.prisma"
call :check_file "package.json"

echo.
echo 🔑 Checking Environment...
echo.

where npm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm is installed - !NPM_VERSION!
) else (
    echo [ERROR] npm not found
    set /a ERRORS=!ERRORS!+1
)

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js is installed - !NODE_VERSION!
) else (
    echo [ERROR] Node.js not found
    set /a ERRORS=!ERRORS!+1
)

echo.
echo ==========================================
echo.

if %ERRORS% equ 0 (
    echo All checks passed!
    echo.
    echo Next steps:
    echo 1. Commit files: git add . ^&^& git commit -m "chore: add Railway deployment config"
    echo 2. Push to GitHub: git push
    echo 3. Create Railway project: https://railway.app
    echo 4. Connect GitHub repository
    echo 5. Add PostgreSQL and Redis services
    echo 6. Set environment variables in Railway Dashboard
    echo 7. Deploy!
) else (
    echo %ERRORS% error(s) found
    echo.
    echo Please fix the issues above before deploying to Railway.
)

endlocal
exit /b

:check_file
if exist "%~1" (
    echo [OK] File exists: %~1
) else (
    echo [ERROR] File missing: %~1
    set /a ERRORS=!ERRORS!+1
)
exit /b

:check_dir
if exist "%~1\" (
    echo [OK] Directory exists: %~1
) else (
    echo [ERROR] Directory missing: %~1
    set /a ERRORS=!ERRORS!+1
)
exit /b
