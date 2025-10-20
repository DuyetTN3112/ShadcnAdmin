@echo off
REM ===================================================================
REM CHECK DATABASE AND CREATE TEST PROJECT
REM ===================================================================

REM Set Laragon MySQL path
set MYSQL_PATH=D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin
set PATH=%MYSQL_PATH%;%PATH%

echo.
echo ========================================
echo   DATABASE CHECK AND PROJECT CREATION
echo ========================================
echo.
echo This script will:
echo   1. Check user (superadmin@example.com)
echo   2. Check organizations
echo   3. Check existing projects
echo   4. Check project members
echo   5. Test query logic
echo   6. Create a new test project
echo.
echo ========================================
echo.

pause

echo.
echo Running checks and creating test project...
echo.
mysql -u root -p shadcn_admin < "d:\ShadcnAdmin\check_and_create_project_v2.sql"

if errorlevel 1 (
    echo ERROR: Failed to run script!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   COMPLETED!
echo ========================================
echo.
echo Please check the output above.
echo If you see a new project created, refresh your browser.
echo.
pause
