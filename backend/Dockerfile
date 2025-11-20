# ============================================
# Multi-Stage Dockerfile for Backend
# Supports both Development and Production
# ============================================

# --------------------------------------------
# Stage 1: Base - Common dependencies
# --------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# --------------------------------------------
# Stage 2: Development
# --------------------------------------------
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run with nodemon for hot reload
CMD ["npm", "run", "dev"]

# --------------------------------------------
# Stage 3: Production Dependencies
# --------------------------------------------
FROM base AS production-deps

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# --------------------------------------------
# Stage 4: Production
# --------------------------------------------
FROM node:20-alpine AS production

# Set to production environment
ENV NODE_ENV=production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies from production-deps stage
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with node (not nodemon)
CMD ["node", "src/index.js"]
