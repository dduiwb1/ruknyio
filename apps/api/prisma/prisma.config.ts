import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
    // للمنصات التي تستخدم connection pooling (مثل Neon) استخدم DIRECT_URL للـ migrations
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
