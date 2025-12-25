# Use Node.js 20 Debian for better Prisma compatibility
FROM node:20-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy Prisma schema
COPY prisma ./prisma/

# Copy environment file
RUN echo "DATABASE_URL=postgresql://chiranjeevi:devpassword@postgres:5432/ecomdb" > .env && \
    echo "JWT_SECRET=devsecret" >> .env && \
    echo "NODE_ENV=development" >> .env

# Copy source code
COPY src ./src/
COPY tsconfig.json ./

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "dev"]