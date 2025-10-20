@echo off
REM ===================================================================
REM FIX PROJECT MEMBERS - Add superadmin to project_members table
REM Issue: Superadmin (user_id=1) owns 4 projects but not in project_members
REM Using: Laragon MySQL 8.0.30 on port 3306 (D: drive)
REM ===================================================================

REM Set Laragon MySQL path (same as restore_database.bat)
set MYSQL_PATH=D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin
set PATH=%MYSQL_PATH%;%PATH%

echo.
echo ========================================
echo   FIX PROJECT MEMBERS
echo ========================================
echo.
echo This script will:
echo   1. Add superadmin (user_id=1) to project_members
echo   2. Set role as 'owner' for projects 1-4
echo   3. Verify the fix
echo.
echo ========================================
echo.

pause

echo.
echo [1/2] Fixing project_members table...
mysql -u root -p shadcn_admin < "d:\ShadcnAdmin\fix_project_members.sql"
if errorlevel 1 (
    echo ERROR: Failed to fix project_members!
    pause
    exit /b 1
)
echo      SUCCESS!

echo.
echo ========================================
echo   FIX COMPLETED!
echo ========================================
echo.
echo Superadmin has been added to all 4 projects.
echo Please refresh the Projects page in your browser.
echo.
pause
