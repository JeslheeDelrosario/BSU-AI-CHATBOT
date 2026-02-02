# BSU AI Chatbot - TISA Labs Platform

> **AI-powered learning platform with SSO, calendar management, weather integration, and task tracking**

[![Status](https://img.shields.io/badge/status-operational-success)](http://localhost:5173)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Manual Setup](#-manual-setup)
- [Environment Configuration](#-environment-configuration)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Development](#-development)
- [Production Deployment](#-production-deployment)

---

## 🔧 Prerequisites

Before installation, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Docker** 20.x or higher
- **Docker Compose** 2.x or higher
- **PostgreSQL** 15.x (or use Docker)
- **Redis** (cloud or local - Upstash recommended)

---

## 🚀 Quick Start

### Automated Installation

Run the installation script:

```bash
chmod +x INSTALL.sh
./INSTALL.sh
```

This will:
- Install all dependencies
- Start Docker services (Keycloak & PostgreSQL)
- Generate Prisma client
- Run database migrations
- Seed initial data

### Access the Platform

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:5000  
**Keycloak Admin:** http://localhost:8080

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ailearning.com | admin123 |
| **Keycloak Admin** | admin | admin123 |

---

## 📦 Manual Setup

If you prefer manual installation:

### 1. Clone the Repository

```bash
git clone https://github.com/JeslheeDelrosario/BSU-AI-CHATBOT.git
cd BSU-AI-CHATBOT
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

cd ..
```

### 3. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5433
- **Keycloak** on port 8080

### 4. Configure Environment Variables

Create `server/.env` file (see [Environment Configuration](#-environment-configuration))

### 5. Setup Database

```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

### 6. Configure Keycloak

1. Open http://localhost:8080
2. Login with `admin` / `admin123`
3. Create a new realm: `bsu-chatbot`
4. Create a client:
   - **Client ID:** `bsu-web-app`
   - **Client Protocol:** openid-connect
   - **Access Type:** confidential
   - **Valid Redirect URIs:** `http://localhost:5173/*`
   - **Web Origins:** `http://localhost:5173`
5. Copy the **Client Secret** from the Credentials tab
6. Add it to `server/.env` as `KEYCLOAK_CLIENT_SECRET`

### 7. Start the Application

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

---

## 🔐 Environment Configuration

Create `server/.env` with the following variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://tisa_admin:TisaLabs2025!Secure@localhost:5433/tisa_labs?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Keycloak SSO
KEYCLOAK_URL="http://localhost:8080"
KEYCLOAK_REALM="bsu-chatbot"
KEYCLOAK_CLIENT_ID="bsu-web-app"
KEYCLOAK_CLIENT_SECRET="your-keycloak-client-secret"

# Redis Cache (Upstash or local)
REDIS_URL="redis://localhost:6379"
# Or for Upstash:
# REDIS_URL="rediss://default:your-password@your-endpoint.upstash.io:6379"

# Weather API
OPENWEATHER_API_KEY="your-openweather-api-key"
WEATHER_CACHE_TTL=10800
```

### Optional Variables

```env
# AI Services
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Google Calendar Integration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"

# GCP Storage
GCP_PROJECT_ID="your-gcp-project-id"
GCS_BUCKET_NAME="bsu-ai-chatbot-images"
GCS_KEY_FILE="./gcp-service-account-key.json"
```

### Getting API Keys

- **OpenWeather API:** https://openweathermap.org/api
- **Upstash Redis:** https://upstash.com/
- **OpenAI:** https://platform.openai.com/api-keys
- **Google Cloud:** https://console.cloud.google.com/

---

## 🚀 Features

### 🔐 Authentication & SSO
- JWT-based authentication
- Keycloak SSO integration
- Role-based access control (Student, Teacher, Admin)
- Secure session management

### 📅 Calendar Management
- Classroom scheduling and booking
- Holiday calendar integration
- Event management
- Calendar view selector (day, week, month)
- Google Calendar integration (optional)

### 🌤️ Weather Integration
- Real-time weather data for Bulacan
- 7-day weather forecast
- Weather-based calendar recommendations
- Redis caching for performance

### ✅ Task Management
- Create and manage tasks
- Task prioritization
- Due date tracking
- Task completion status

### 🤖 AI Tutor (TISA)
- Context-aware AI assistant
- Conversation continuity
- Curriculum and program knowledge
- Faculty information lookup
- Multi-provider support (OpenAI, Anthropic, Gemini)

### 📚 Learning Management
- Course browsing and enrollment
- Lesson viewer
- Progress tracking
- Personalized dashboard
- Achievement system

### 🛠️ Admin Features
- Room and classroom management
- Faculty management
- Curriculum management
- User management
- System analytics

### 🔔 Notifications
- Real-time notification system
- Bell icon with unread count
- Notification history

### ⚡ Performance
- Redis caching layer
- Optimized database queries
- Rate limiting
- Compression middleware

---

## 📚 Additional Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[CALENDAR_SETUP_COMPLETE.md](CALENDAR_SETUP_COMPLETE.md)** - Calendar feature documentation
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API endpoints reference
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Production deployment

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5.x
- **Styling:** TailwindCSS + Radix UI
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Date Handling:** date-fns, date-fns-tz
- **Icons:** Lucide React
- **Charts:** Recharts
- **Markdown:** react-markdown, remark-gfm

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express + TypeScript
- **ORM:** Prisma 5.22.x
- **Database:** PostgreSQL 15
- **Cache:** Redis (ioredis)
- **Authentication:** JWT + Keycloak
- **Security:** Helmet, bcryptjs, express-rate-limit
- **Validation:** express-validator, Zod
- **AI Services:** OpenAI, Anthropic, Google Gemini

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **SSO:** Keycloak 23.0
- **Cache:** Redis 7 / Upstash
- **Weather API:** OpenWeatherMap
- **Storage:** Google Cloud Storage (optional)

---

## 🔧 Development

### Start Development Servers

```bash
# Option 1: Start both servers separately
cd server && npm run dev  # Terminal 1
cd client && npm run dev  # Terminal 2

# Option 2: Use concurrently (from root)
npm run dev
```

### Database Management

```bash
cd server

# Open Prisma Studio (GUI)
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset

# Seed database
npm run prisma:seed

# Generate Prisma client
npm run prisma:generate
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove volumes (clean slate)
docker-compose down -v
```

### API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ailearning.com","password":"admin123"}'

# Get weather forecast
curl http://localhost:5000/api/weather/forecast

# Get calendar events
curl http://localhost:5000/api/calendar/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Useful Scripts

```bash
# Server scripts
cd server
npm run dev          # Start dev server with nodemon
npm run build        # Build for production
npm start            # Start production server

# Client scripts
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 📁 Project Structure

```
BSU-AI-CHATBOT/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── CalendarViewSelector.tsx
│   │   │   ├── EnhancedClassroomCalendar.tsx
│   │   │   ├── HolidayCalendar.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   ├── WeatherCalendar.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── pages/                  # Page components
│   │   ├── contexts/               # React contexts
│   │   └── lib/                    # Utilities
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── controllers/            # Route controllers
│   │   │   ├── calendar.controller.ts
│   │   │   ├── holiday.controller.ts
│   │   │   ├── sso.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   └── weather.controller.ts
│   │   ├── routes/                 # API routes
│   │   ├── services/               # Business logic
│   │   │   ├── cache.service.ts
│   │   │   ├── keycloak.service.ts
│   │   │   └── weather.service.ts
│   │   ├── config/                 # Configuration
│   │   │   └── redis.config.ts
│   │   └── index.ts                # Server entry
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/             # DB migrations
│   │   ├── seed.ts                 # Seed script
│   │   └── seeds/                  # Seed data
│   └── package.json
│
├── docker-compose.yml               # Docker services
├── INSTALL.sh                       # Installation script
└── README.md                        # This file
```

---

## 🚢 Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database URL
4. Use production Redis (Upstash recommended)
5. Set up proper CORS origins
6. Enable HTTPS
7. Configure Keycloak for production domain

### Build Commands

```bash
# Build server
cd server
npm run build

# Build client
cd client
npm run build
```

### Deployment Platforms

- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Railway, Render, Heroku, DigitalOcean
- **Database:** Supabase, Neon, Railway
- **Redis:** Upstash, Redis Cloud
- **Keycloak:** Self-hosted or Keycloak Cloud

See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Database connection failed:**
- Check PostgreSQL is running: `docker-compose ps`
- Verify DATABASE_URL in `.env`
- Check port 5433 is not in use

**Keycloak not accessible:**
- Wait 30-60 seconds after `docker-compose up`
- Check logs: `docker-compose logs keycloak`
- Verify port 8080 is available

**Redis connection failed:**
- Check REDIS_URL in `.env`
- For Upstash, ensure URL includes `rediss://` (with double 's')
- Test connection: `redis-cli -u "$REDIS_URL" ping`

**Weather API not working:**
- Verify OPENWEATHER_API_KEY is valid
- Check API quota at https://openweathermap.org/
- Free tier allows 1000 calls/day

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📧 Support

For issues and questions:
- **GitHub Issues:** https://github.com/JeslheeDelrosario/BSU-AI-CHATBOT/issues
- **Documentation:** See additional .md files in the repository

---

**Version:** 2.0.0 | **Last Updated:** February 2, 2026
