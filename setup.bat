@echo off
REM Domestic Connect - Development Setup Script (Windows)
REM This script sets up the development environment for Domestic Connect

echo 🚀 Setting up Domestic Connect Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.9+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Installing frontend dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed successfully

echo [INFO] Setting up backend environment...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating backend environment file...
    copy env.example .env
    echo [WARNING] Please update backend\.env with your actual configuration values
)

REM Initialize database
echo [INFO] Initializing database...
python cli.py init
if errorlevel 1 (
    echo [ERROR] Failed to initialize database
    pause
    exit /b 1
)
echo [SUCCESS] Database initialized successfully

cd ..

REM Create frontend .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating frontend environment file...
    copy env.example .env
    echo [WARNING] Please update .env with your actual configuration values
)

echo [SUCCESS] Development environment setup complete!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your M-Pesa credentials (optional for development)
echo 2. Update .env with your Firebase credentials (optional for development)
echo 3. Start the backend: npm run start:backend
echo 4. Start the frontend: npm run dev
echo.
echo 🌐 Access points:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5000
echo - API Documentation: http://localhost:5000/api
echo.
echo [SUCCESS] Happy coding! 🎉
pause
