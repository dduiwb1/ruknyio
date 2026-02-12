# ============================================
# Next.js Web (Frontend) - Railway
# Build context: apps/web (Root Directory = apps/web in Railway)
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build 2>&1

# Stage 2: Run (standalone)
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENTRYPOINT ["/sbin/dumb-init", "--"]
# Railway injects PORT via process.env.PORT
CMD ["node", "server.js"]
