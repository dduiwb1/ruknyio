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

# Prisma: use path relative to /app (works when context is apps/api)
RUN npx prisma generate --schema=prisma/schema.prisma

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
CMD ["sh", "-c", "npm run migrate 2>&1 && npm run start:prod"]
