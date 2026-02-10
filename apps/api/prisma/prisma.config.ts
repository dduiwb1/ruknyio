import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 + Neon:
 * - DATABASE_URL: الاتصال المجمع (pooled) للاستعلامات
 * - DIRECT_URL: الاتصال المباشر للـ migrations (مطلوب في Neon)
 */
export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
    // Neon: استخدم DIRECT_URL للـ migrations؛ إن لم يُضبط يُستخدم DATABASE_URL
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
