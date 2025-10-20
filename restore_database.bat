@echo off
REM ===================================================================
REM RESTORE DATABASE FROM BACKUP
REM File: shadcn_admin.sql
REM Risk: VERY LOW (backup verified to be complete with real data)
REM Using: Laragon MySQL 8.0.30 on port 3306 (D: drive)
REM ===================================================================

REM Set Laragon MySQL path
set MYSQL_PATH=D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin
set PATH=%MYSQL_PATH%;%PATH%

echo.
echo ========================================
echo   DATABASE RESTORE SCRIPT (Laragon)
echo ========================================
echo.
echo This script will:
echo   1. DROP current database (if exists)
echo   2. CREATE fresh database
echo   3. RESTORE from shadcn_admin.sql
echo   4. VERIFY restoration
echo.
echo BACKUP CONTAINS:
echo   - 32 tables (all verified)
echo   - 32 procedures
echo   - 19 triggers
echo   - 2 views
echo   - REAL DATA: 6 users, 6 organizations, tasks, conversations
echo.
echo ========================================
echo.

pause

echo.
echo [1/4] Dropping old database...
mysql -u root -p -e "DROP DATABASE IF EXISTS shadcn_admin;"
if errorlevel 1 (
    echo ERROR: Failed to drop database!
    pause
    exit /b 1
)
echo      SUCCESS!

echo.
echo [2/4] Creating fresh database...
mysql -u root -p -e "CREATE DATABASE shadcn_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
    echo ERROR: Failed to create database!
    pause
    exit /b 1
)
echo      SUCCESS!

echo.
echo [3/4] Restoring from backup (this may take 1-2 minutes)...
mysql -u root -p shadcn_admin < "d:\ShadcnAdmin\shadcn_admin.sql"
if errorlevel 1 (
    echo ERROR: Failed to restore backup!
    pause
    exit /b 1
)
echo      SUCCESS!

echo.
echo [4/4] Verifying restoration...
echo.
mysql -u root -p shadcn_admin -e "SHOW TABLES; SELECT 'Users:' as Info, COUNT(*) as Count FROM users UNION SELECT 'Organizations:', COUNT(*) FROM organizations UNION SELECT 'Tasks:', COUNT(*) FROM tasks UNION SELECT 'Procedures:', COUNT(*) FROM information_schema.routines WHERE routine_schema='shadcn_admin' AND routine_type='PROCEDURE';"

echo.
echo ========================================
echo   RESTORE COMPLETED!
echo ========================================
echo.
echo Next steps:
echo   1. Check the counts above
echo   2. Test login: npm run dev
echo   3. Verify app functionality
echo.
pause
