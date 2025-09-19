#!/bin/bash

# Domestic Connect - Development Setup Script
# This script sets up the development environment for Domestic Connect

echo "🚀 Setting up Domestic Connect Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

print_status "Setting up backend environment..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

print_status "Installing minimal backend dependencies..."
pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-CORS bcrypt requests
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating backend environment file..."
    cp env.example .env
    print_warning "Environment variables are optional - defaults are set in config.py"
fi

# Initialize database
print_status "Initializing database..."
python cli.py init
if [ $? -eq 0 ]; then
    print_success "Database initialized successfully"
else
    print_error "Failed to initialize database"
    exit 1
fi

cd ..

# Create frontend .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating frontend environment file..."
    cp env.example .env
    print_warning "Please update .env with your actual configuration values"
fi

print_success "Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Environment variables are optional - defaults are set in config.py"
echo "2. For M-Pesa integration, set environment variables (optional)"
echo "3. Start the backend: npm run start:backend"
echo "4. Start the frontend: npm run dev"
echo ""
echo "🌐 Access points:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:5000"
echo "- API Documentation: http://localhost:5000/api"
echo ""
print_success "Happy coding! 🎉"
