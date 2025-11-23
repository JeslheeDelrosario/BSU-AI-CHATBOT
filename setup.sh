#!/bin/bash

# TISA Labs Setup Script
# This script automates the setup process for TISA Labs

set -e  # Exit on error

echo "================================================"
echo "TISA Labs - Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed."
    echo "Install with: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

print_success "PostgreSQL detected"

# Step 1: Install dependencies
echo ""
print_info "Step 1: Installing dependencies..."
echo ""

npm install
cd server && npm install
cd ../client && npm install
cd ..

print_success "Dependencies installed"

# Step 2: Setup environment file
echo ""
print_info "Step 2: Setting up environment configuration..."
echo ""

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    print_info "Created server/.env file. Please edit it with your database credentials."
    print_info "Default database URL: postgresql://tisa_user:your_password@localhost:5432/tisa_labs"
else
    print_info "server/.env already exists"
fi

# Step 3: Database setup prompt
echo ""
print_info "Step 3: Database setup"
echo ""

read -p "Do you want to create the database now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter PostgreSQL password for user 'postgres': " -s POSTGRES_PASS
    echo ""
    
    # Create database and user
    PGPASSWORD=$POSTGRES_PASS psql -U postgres -c "CREATE DATABASE tisa_labs;" 2>/dev/null || print_info "Database might already exist"
    PGPASSWORD=$POSTGRES_PASS psql -U postgres -c "CREATE USER tisa_user WITH ENCRYPTED PASSWORD 'tisa_password_123';" 2>/dev/null || print_info "User might already exist"
    PGPASSWORD=$POSTGRES_PASS psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE tisa_labs TO tisa_user;"
    PGPASSWORD=$POSTGRES_PASS psql -U postgres -c "ALTER DATABASE tisa_labs OWNER TO tisa_user;"
    
    print_success "Database created successfully"
    
    # Update .env file with default credentials
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://tisa_user:tisa_password_123@localhost:5432/tisa_labs?schema=public"|' server/.env
    print_success "Updated server/.env with database credentials"
fi

# Step 4: Run Prisma migrations
echo ""
print_info "Step 4: Setting up database schema..."
echo ""

cd server
npx prisma generate
npx prisma migrate dev --name init
print_success "Database schema created"

# Step 5: Seed database
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db seed
    print_success "Database seeded with initial data"
    echo ""
    print_info "Default admin credentials:"
    echo "  Email: admin@tisalabs.com"
    echo "  Password: admin123"
fi

cd ..

# Step 6: Final instructions
echo ""
echo "================================================"
print_success "Setup completed successfully!"
echo "================================================"
echo ""
echo "To start the application:"
echo ""
echo "  Development mode:"
echo "    npm run dev"
echo ""
echo "  Or run separately:"
echo "    Terminal 1: cd server && npm run dev"
echo "    Terminal 2: cd client && npm run dev"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo ""
echo "Default login credentials:"
echo "  Email: admin@tisalabs.com"
echo "  Password: admin123"
echo ""
print_info "For production deployment, see PRODUCTION.md"
echo ""
