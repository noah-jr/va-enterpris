# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the AdonisJS app
RUN node ace build --ignore-ts-errors

# Production dependencies Stage
FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Final Stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy from builder
COPY --from=builder /app/build ./build
COPY --from=dependencies /app/node_modules ./node_modules

# Ensure entrypoint is executable
RUN chmod +x build/bin/server.js

# Expose port
EXPOSE 3333

# Start application
CMD ["node", "build/bin/server.js"]
