#!/bin/bash

# BSU AI Chatbot - Installation Script
# This script installs dependencies, sets up Keycloak, and prepares the database

set -e

echo "🚀 BSU AI Chatbot - Installation Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
echo -e "${GREEN}✅ Server dependencies installed${NC}"
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install
echo -e "${GREEN}✅ Client dependencies installed${NC}"
echo ""

# Go back to root
cd ..

# Start Docker services
echo "🐳 Starting Docker services (Keycloak & PostgreSQL)..."
docker-compose up -d
echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready (this may take 30-60 seconds)..."
sleep 10

MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Keycloak is ready!${NC}"
        break
    fi
    echo "   Still waiting... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠️  Keycloak may still be starting. You can check manually at http://localhost:8080${NC}"
fi
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd server
npm run prisma:generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name add_calendar_weather_task_sso_features
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Seed database (optional)
echo "🌱 Seeding database with initial data..."
npm run prisma:seed || echo -e "${YELLOW}⚠️  Seeding skipped or failed (this is optional)${NC}"
echo ""

# Test Redis connection
echo "🔴 Testing Redis connection..."
if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Redis connection failed. Please check REDIS_URL in .env${NC}"
fi
echo ""

# Test Weather API
echo "🌤️  Testing Weather API..."
WEATHER_API_KEY=$(grep OPENWEATHER_API_KEY .env | cut -d '=' -f2)
if curl -s "https://api.openweathermap.org/data/2.5/forecast?lat=14.7942&lon=120.8794&appid=$WEATHER_API_KEY&cnt=1" | grep -q "cod"; then
    echo -e "${GREEN}✅ Weather API connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Weather API connection failed. Please check OPENWEATHER_API_KEY in .env${NC}"
fi
echo ""

# Print summary
echo "========================================"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "========================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure Keycloak:"
echo "   - Open: http://localhost:8080"
echo "   - Login: admin / admin123"
echo "   - Create realm: 'bsu-chatbot'"
echo "   - Create client: 'bsu-web-app'"
echo "   - Copy client secret to server/.env"
echo ""
echo "2. Start the application:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5000"
echo "   - Keycloak: http://localhost:8080"
echo ""
echo "📖 For detailed setup instructions, see SETUP_GUIDE.md"
echo ""
