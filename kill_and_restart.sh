#!/bin/bash

# Kill all processes and restart script for BSU-AI-CHATBOT

echo "🔴 Killing all processes..."

# Kill all node processes related to the project
echo "Killing Node.js processes..."
pkill -f "node.*vite" 2>/dev/null
pkill -f "node.*server" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null
pkill -f "concurrently" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Kill any processes on common ports
echo "Killing processes on ports 3000, 3001, 5000, 5173..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Wait a moment for processes to fully terminate
sleep 3

# Check if any processes are still running
echo "Checking for remaining processes..."
ps aux | grep -E "(node|vite|npm)" | grep -v grep

echo "✅ All processes killed!"
echo ""
echo "🟢 Restarting services..."

# Navigate to project directory
cd /home/aanthonytomas/Portfolio/BSU-AI-CHATBOT

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "Installing dependencies..."
    npm run install:all
fi

# Database migrations (if needed)
echo "Checking database..."
cd server
npx prisma generate 2>/dev/null
cd ..

# Start the development server
echo "Starting development server (client + server)..."
npm run dev

echo "🎉 All services have been restarted!"
echo "📊 Client: http://localhost:3000"
echo "🔧 Server API: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
