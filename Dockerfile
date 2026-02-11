# ============================================
# MULTI-STAGE BUILD FOR NESTJS API
# Optimized for production deployment on Railway
# ============================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for the entire monorepo
COPY package*.json ./

# Install all dependencies (production and dev)
RUN npm ci

# Copy the entire workspace
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build ONLY the API (not web, packages, etc.)
RUN npm run build --workspace=apps/api

# ============================================
# Stage 2: Runtime (Production)
FROM node:20-alpine

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create upload directories
RUN mkdir -p /app/uploads/avatars /app/temp/videos && \
    chmod -R 755 /app/uploads /app/temp

# Set environment to production
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var if needed)
EXPOSE 3001

# Use dumb-init to properly handle signals
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Run migrations and start the app
CMD ["sh", "-c", "npm run migrate 2>&1 && npm run start:prod"]
