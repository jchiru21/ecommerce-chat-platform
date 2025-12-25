# 🛒 Ecom Chat - Full-Stack E-Commerce with Real-Time Chat

A modern e-commerce platform with real-time messaging, admin dashboard, and animated UI.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

## ✨ Features

- **🛍️ E-Commerce**: Product catalog, shopping cart, order management
- **💬 Real-Time Chat**: Live messaging between users via Socket.io
- **👑 Admin Dashboard**: User management, order oversight, product CRUD
- **🎨 Modern UI**: Framer Motion animations, responsive design
- **🔐 Authentication**: JWT-based login/registration system

## 🏗️ Tech Stack

**Backend**: Node.js + Express + PostgreSQL + Prisma + Socket.io  
**Frontend**: Next.js + React + TypeScript + Framer Motion  
**Database**: PostgreSQL with Prisma ORM

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- pnpm
- PostgreSQL

### 🐳 Docker Setup (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd ecom-chat

# Start all services with Docker
docker-compose up --build

# Or for development with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### Manual Setup (Alternative)
```bash
# Clone repository
git clone <repository-url>
cd ecom-chat

# Setup database
createdb ecomdb

# Backend setup
cd services/api
pnpm install
pnpm prisma migrate dev
pnpm run dev

# User Frontend setup (new terminal)
cd services/web
pnpm install
pnpm run dev

# Admin Frontend setup (new terminal)
cd services/admin
pnpm install
pnpm run dev
```

### Access
- **User Portal**: http://localhost:3000
- **Admin Portal**: http://localhost:3001/admin-login
- **API Server**: http://localhost:4000

## � Docker Deployment

### Production Setup
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Setup
```bash
# Start with hot reload for development
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Run specific service
docker-compose up api --build
```

### Docker Services
- **PostgreSQL**: Database (Port 5432) ✅
- **API**: Backend server (Port 4000) ✅
- **Web**: User frontend (Port 3000) ✅
- **Admin**: Admin dashboard (Port 3001) ✅

### Environment Variables
Copy `.env.docker` to configure container environment:
```bash
cp .env.docker .env
```

### Database Management
```bash
# Access database
docker-compose exec postgres psql -U postgres -d ecomdb

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Reset database
docker-compose exec api npx prisma migrate reset --force
```

## �📖 Usage

### For Users
1. Register/Login account
2. Browse products and add to cart
3. Checkout and track orders
4. Chat with other users in real-time

### For Admins
1. Access admin panel (admin users only)
2. View dashboard statistics
3. Manage users, orders, and products
4. Update order statuses

## 🔌 API Endpoints

### Authentication
```
POST /auth/register  - User registration
POST /auth/login     - User login
```

### Products & Shopping
```
GET  /products       - Get all products
POST /cart           - Add to cart
POST /orders         - Create order
GET  /orders         - Get user orders
```

### Admin (Admin only)
```
GET /admin/users     - All users
GET /admin/orders    - All orders
GET /admin/stats     - System statistics
PUT /admin/products/:id - Update product
```

### Real-Time Chat
```
WebSocket: /socket.io - Live messaging
```

## 📁 Project Structure

```
ecom-chat/
├── services/
│   ├── api/                 # Backend API (Port 4000)
│   │   ├── src/server.ts    # Express server
│   │   └── prisma/schema.prisma # Database schema
│   ├── web/                 # User Frontend (Port 3000)
│   │   └── src/pages/index.tsx  # User e-commerce app
│   └── admin/               # Admin Frontend (Port 3001)
│       ├── src/pages/admin-login.tsx # Admin login
│       └── src/pages/admin.tsx       # Admin dashboard
└── README.md
```

## 🔧 Development Scripts

```bash
# Quick start all services
./dev.sh

# Or run individually:

# API
cd services/api
pnpm install          # Install deps
pnpm prisma migrate dev # DB migrations
pnpm run dev          # Start API server

# User Web App
cd services/web
pnpm install          # Install deps
pnpm run dev          # Start user web server (Port 3000)

# Admin Web App
cd services/admin
pnpm install          # Install deps
pnpm run dev          # Start admin web server (Port 3001)
```

## 🔒 Environment Setup

Create `.env` files:

**services/api/.env**:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/ecomdb"
JWT_SECRET="your-secret-key"
```

**services/web/.env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

## 🆘 Troubleshooting

**Port conflicts**: Kill processes on ports 3000, 3001, 4000, 4001
```bash
lsof -ti:3000,3001,4000,4001 | xargs kill -9
```

**Database issues**: Reset and migrate
```bash
cd services/api
npx prisma migrate reset --force
```

---

**Happy coding! 🎉**
