#!/bin/bash

# AI for Inclusive Learning Platform - Stop Script

echo "🛑 Stopping AI for Inclusive Learning Platform..."

# Kill by PID files if they exist
if [ -f ".pids/backend.pid" ]; then
    BACKEND_PID=$(cat .pids/backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend stopped" || echo "⚠️  Backend not running"
    rm .pids/backend.pid
fi

if [ -f ".pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat .pids/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend stopped" || echo "⚠️  Frontend not running"
    rm .pids/frontend.pid
fi

# Also kill any remaining node processes on ports 3000 and 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
