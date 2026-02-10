# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (from Railway root context)
COPY package-lock.json ./
COPY package.json ./

# Copy workspace packages
COPY packages ./packages
COPY ./ ./api/

# Install dependencies
RUN npm ci --omit=dev

# Generate Prisma client and build API (workspace apps/api only)
WORKDIR /app/api
RUN npx prisma generate
RUN npm run build --workspace=apps/api

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Copy only production dependencies and built API (NestJS في apps/api)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/api/node_modules ./api/node_modules
COPY --from=builder /app/api/apps/api/dist ./api/dist
COPY --from=builder /app/api/apps/api/package.json ./api/package.json

# Copy Prisma files (needed for migrations)
COPY --from=builder /app/api/apps/api/prisma ./api/prisma

WORKDIR /app/api

ENV NODE_ENV=production
ENV PORT=4000

# Health check - simple HTTP check every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
