@echo off
echo Building React Admin Dashboard...

cd /d "%~dp0"

echo Installing dependencies...
call npm install

echo Building admin dashboard...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Admin dashboard built successfully!
    echo 📁 Build output: admin\dist\
    echo 🌐 Admin will be available at: http://localhost:3000/admin
    echo.
    echo To start the server, run: npm start
) else (
    echo.
    echo ❌ Build failed!
    echo Check the error messages above.
    echo.
)

pause
