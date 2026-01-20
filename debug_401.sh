#!/bin/bash

# Debug script for 401 Unauthorized error

echo "🔍 Debugging 401 Unauthorized Error..."
echo ""

# Check if server is running
echo "1. Checking if server is running on port 5000..."
if lsof -i:5000 > /dev/null 2>&1; then
    echo "✅ Server is running on port 5000"
else
    echo "❌ Server is NOT running on port 5000"
    echo "   Starting server..."
    cd /home/aanthonytomas/Portfolio/BSU-AI-CHATBOT/server && npm run dev &
    sleep 5
fi

echo ""

# Check if client is running
echo "2. Checking if client is running on port 3000..."
if lsof -i:3000 > /dev/null 2>&1; then
    echo "✅ Client is running on port 3000"
else
    echo "❌ Client is NOT running on port 3000"
    echo "   Starting client..."
    cd /home/aanthonytomas/Portfolio/BSU-AI-CHATBOT/client && npm run dev -- --host &
    sleep 5
fi

echo ""

# Test API endpoints
echo "3. Testing API endpoints..."

echo "   Testing health endpoint..."
curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health

echo ""

echo "   Testing login endpoint (with test credentials)..."
echo "   Trying student1@ailearning.com..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@ailearning.com","password":"student123"}' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@ailearning.com","password":"student123"}'

echo ""

# Check environment variables
echo "4. Checking environment variables..."
echo "   JWT_SECRET is set: $(if [ -n "$JWT_SECRET" ]; then echo "✅"; else echo "❌"; fi)"
echo "   DATABASE_URL is set: $(if [ -n "$DATABASE_URL" ]; then echo "✅"; else echo "❌"; fi)"

echo ""

# Check database connection
echo "5. Checking database connection..."
cd /home/aanthonytomas/Portfolio/BSU-AI-CHATBOT/server
npx prisma db pull --force 2>/dev/null && echo "✅ Database connection successful" || echo "❌ Database connection failed"

echo ""
echo "🔧 If you're still getting 401 errors:"
echo "   1. Use these test credentials:"
echo "      - Admin: admin@ailearning.com / admin123"
echo "      - Teacher: teacher@ailearning.com / teacher123"
echo "      - Student: student1@ailearning.com / student123"
echo "   2. Make sure you're registered in the database"
echo "   3. Check your email and password"
echo "   4. Verify the server logs: cd server && npm run dev"
echo "   5. Try clearing browser cookies and localStorage"
