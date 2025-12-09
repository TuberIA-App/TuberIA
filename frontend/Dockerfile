# ============================================
# Multi-Stage Dockerfile for Frontend (Vite/React)
# Supports both Development and Production
# ============================================

# --------------------------------------------
# Stage 1: Base - Common dependencies
# --------------------------------------------
FROM node:24-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# --------------------------------------------
# Stage 2: Development
# --------------------------------------------
FROM base AS development

# Install all dependencies
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev"]

# --------------------------------------------
# Stage 3: Build - Create production build
# --------------------------------------------
FROM base AS build

# Accept build arguments for environment variables
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Build for production (environment variables are baked into the bundle)
RUN npm run build

# --------------------------------------------
# Stage 4: Production - Serve with Nginx
# --------------------------------------------
FROM nginx:1.27-alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (internal nginx port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start nginx (runs as root by default, which is safe in Docker containers)
CMD ["nginx", "-g", "daemon off;"]
