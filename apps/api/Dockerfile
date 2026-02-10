# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ جذر الـ monorepo بحيث يكون apps/api تحت /app (ليتعرف npm على الـ workspaces)
COPY package-lock.json ./
COPY package.json ./
COPY packages ./packages
COPY apps ./apps

# تثبيت كل الاعتماديات (بدون postinstall مؤقتاً)
RUN npm install --legacy-peer-deps --ignore-scripts

# الآن نشغل prisma generate بشكل آمن
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# بناء التطبيق
RUN npm run build --workspace=apps/api

# إزالة devDependencies لتقليل حجم الصورة
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# نسخ الاعتماديات والمخرجات فقط
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
