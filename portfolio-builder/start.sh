#!/bin/bash

# Portfolio Builder Startup Script
echo "🚀 Starting Portfolio Builder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
sleep 2

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client
    npm install --legacy-peer-deps
    cd ..
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start backend server
echo "🔧 Starting backend server on port 12002..."
PORT=12002 node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Failed to start backend server"
    exit 1
fi

# Start frontend server
echo "🎨 Starting frontend server on port 12001..."
cd client
PORT=12001 HOST=0.0.0.0 GENERATE_SOURCEMAP=false npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

echo ""
echo "✅ Portfolio Builder is starting up!"
echo ""
echo "📊 Admin Panel: http://localhost:12001/admin"
echo "🌐 Portfolio Site: http://localhost:12001/"
echo "🔧 Backend API: http://localhost:12002/api"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the default password after first login!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "node server.js" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait