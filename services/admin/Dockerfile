# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY src ./src/
COPY pages ./pages/
COPY next-env.d.ts ./
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]