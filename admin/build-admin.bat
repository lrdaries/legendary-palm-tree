@echo off
echo Building React Admin Dashboard...

cd /d "%~dp0"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the React app
echo Building admin dashboard...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Admin dashboard built successfully!
    echo 📁 Build output: admin/dist/
    echo 🌐 Admin will be available at: http://localhost:3000/admin
    echo.
    echo To start the server, run: npm start
) else (
    echo.
    echo ❌ Build failed!
    echo Please check the error messages above.
    echo.
)

pause
