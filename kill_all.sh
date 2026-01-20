#!/bin/bash

# Kill all processes script for BSU-AI-CHATBOT

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
