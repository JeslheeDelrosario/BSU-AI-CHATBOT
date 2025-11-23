#!/bin/bash

# AI for Inclusive Learning Platform - Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
  echo -e "${RED}❌ Please do not run as root${NC}"
  exit 1
fi

# Step 1: Pull latest code (if using git)
echo -e "${BLUE}📥 Pulling latest code...${NC}"
# git pull origin main

# Step 2: Install dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd server
npm ci --production
cd ..

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd client
npm ci
cd ..

# Step 3: Build frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd client
npm run build
cd ..

# Step 4: Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
cd server
npx prisma migrate deploy
npx prisma generate
cd ..

# Step 5: Restart services
echo -e "${BLUE}🔄 Restarting services...${NC}"

# Stop existing processes
pm2 stop tisa-labs-api 2>/dev/null || true
pm2 stop tisa-labs-frontend 2>/dev/null || true

# Start backend
cd server
pm2 start npm --name "tisa-labs-api" -- start
cd ..

# Start frontend (using serve)
pm2 start npx --name "tisa-labs-frontend" -- serve -s client/dist -l 3000

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Services:"
echo "  Backend API: http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "To view logs:"
echo "  pm2 logs tisa-labs-api"
echo "  pm2 logs tisa-labs-frontend"
echo ""
echo "To monitor:"
echo "  pm2 monit"
