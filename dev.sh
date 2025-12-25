#!/bin/bash

# Ecom Chat Development Startup Script

echo "🚀 Starting Ecom Chat Development Environment..."

# Start API server in background
echo "📡 Starting API server on port 4000..."
cd services/api && pnpm run dev &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start User Web App in background
echo "🛒 Starting User Web App on port 3000..."
cd ../web && pnpm run dev &
WEB_PID=$!

# Start Admin Web App in background
echo "👑 Starting Admin Web App on port 3001..."
cd ../admin && pnpm run dev &
ADMIN_PID=$!

echo ""
echo "✅ All services started!"
echo "📱 User Portal: http://localhost:3000"
echo "👑 Admin Portal: http://localhost:3001/admin-login"
echo "🔌 API Server: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "echo '🛑 Stopping all services...'; kill $API_PID $WEB_PID $ADMIN_PID; exit" INT
wait