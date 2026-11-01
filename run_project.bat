@echo off
:menu
cls
echo ==========================================
echo       CampusShare Management Menu
echo ==========================================
echo 1. Start Website (npm run dev)
echo 2. Open Database Studio (prisma studio)
echo 3. Push DB Schema (prisma db push)
echo 4. Reset & Seed DB (db:reset)
echo 5. Exit
echo ==========================================
set /p choice="Choose an option (1-5): "

if "%choice%"=="1" (
    echo Starting Development Server...
    npm run dev
    pause
    goto menu
)
if "%choice%"=="2" (
    echo Opening Prisma Studio...
    npm run db:studio
    pause
    goto menu
)
if "%choice%"=="3" (
    echo Pushing schema to database...
    npm run db:push
    pause
    goto menu
)
if "%choice%"=="4" (
    echo Resetting and seeding database...
    npm run db:reset
    pause
    goto menu
)
if "%choice%"=="5" (
    exit
)

echo Invalid choice, please try again.
pause
goto menu