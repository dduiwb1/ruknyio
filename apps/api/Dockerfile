# ============================================
# MULTI-STAGE BUILD FOR NESTJS API
# Optimized for production deployment on Railway
# ============================================
#
# Build context: EITHER repo root OR apps/api (Railway may use apps/api).
# Paths below work when context is apps/api (COPY . . then paths are under /app).
# ============================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (from build context: root or apps/api)
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy the rest of the app (context = apps/api → we get prisma/, src/, etc.)
COPY . .

# Prisma generate: dummy URLs (no DB connection; only validates config and generates client)
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    DIRECT_URL="postgresql://build:build@localhost:5432/build" \
    npx prisma generate --config=prisma/prisma.config.ts

# Build the API (nest build or tsc from /app)
RUN npm run build

# ============================================
# Stage 2: Runtime (Production)
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

# Built app and Prisma (paths relative to builder /app)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Prisma CLI for migrations at runtime
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

RUN mkdir -p /app/uploads/avatars /app/temp/videos && \
    chmod -R 755 /app/uploads /app/temp

ENV NODE_ENV=production
EXPOSE 3001

ENTRYPOINT ["/sbin/dumb-init", "--"]
# Run migrate then start; echo so we see in logs if we reach start (if crash, error appears after "Starting API...")
CMD ["sh", "-c", "npm run migrate 2>&1 && echo 'Starting API...' && exec node dist/main.js"]
