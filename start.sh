#!/bin/bash

# AI for Inclusive Learning Platform - Start Script
# Quick start for development

set -e

echo "🚀 Starting AI for Inclusive Learning Platform..."

# Check if node_modules exist
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env not found. Using default configuration."
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd server
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
cd client
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Access the platform:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  API Health: http://localhost:5000/api/health"
echo ""
echo "📝 Logs:"
echo "  Backend: tail -f logs/backend.log"
echo "  Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  or run: ./stop.sh"
echo ""

# Save PIDs to file
mkdir -p .pids
echo $BACKEND_PID > .pids/backend.pid
echo $FRONTEND_PID > .pids/frontend.pid

echo "PIDs saved to .pids/"
