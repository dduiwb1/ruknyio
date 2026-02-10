# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies (including dev for build)
RUN npm ci

# Navigate to API and build
WORKDIR /app/apps/api

# Prisma generation happens via postinstall, but ensure it's done
RUN npx prisma generate

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install only what we need for runtime
RUN apk add --no-cache dumb-init

# Copy minimal files needed for runtime
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and prisma schema
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

CMD ["npm", "run", "start:prod"]
