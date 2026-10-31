@echo off
title CampusShare Developer Tools

:menu
cls
echo ======================================================
echo           CAMPUSSHARE DEVELOPER TOOLS
echo ======================================================
echo.
echo 1. Run Development Server (npm run dev)
echo 2. Open Prisma Studio (Database GUI)
echo 3. Reset Database & Seed (Danger!)
echo 4. Push Schema Changes (db:push)
echo 5. Generate Prisma Client (db:generate)
echo 6. Exit
echo.
echo ======================================================
set /p choice="Select an option (1-6): "

if "%choice%"=="1" goto run_dev
if "%choice%"=="2" goto open_db
if "%choice%"=="3" goto reset_db
if "%choice%"=="4" goto push_db
if "%choice%"=="5" goto gen_db
if "%choice%"=="6" exit
goto menu

:run_dev
echo Starting development server...
call npm run dev
pause
goto menu

:open_db
echo Opening Prisma Studio...
call npm run db:studio
pause
goto menu

:reset_db
echo WARNING: This will delete all data and re-seed!
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    call npm run db:reset
) else (
    echo Operation cancelled.
)
pause
goto menu

:push_db
echo Pushing schema changes...
call npm run db:push
pause
goto menu

:gen_db
echo Generating Prisma Client...
call npm run db:generate
pause
goto menu