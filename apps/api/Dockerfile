# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ جذر الـ monorepo بحيث يكون apps/api تحت /app (ليتعرف npm على الـ workspaces)
COPY package-lock.json ./
COPY package.json ./
COPY packages ./packages
COPY apps ./apps

# تثبيت كل الاعتماديات (بما فيها apps/api و@nestjs/cli)
RUN npm ci

# توليد Prisma ثم بناء الـ API (من جذر الـ monorepo /app)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace=apps/api

# إزالة devDependencies لتقليل حجم الصورة
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# نسخ الاعتماديات والمخرجات فقط
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./api/dist
COPY --from=builder /app/apps/api/package.json ./api/package.json
COPY --from=builder /app/apps/api/prisma ./api/prisma

WORKDIR /app/api

ENV NODE_ENV=production
ENV PORT=4000

# Health check - simple HTTP check every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
