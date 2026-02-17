import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import path from 'path';

const baseDir = __dirname;

dotenv.config({ path: path.join(baseDir, '.env') });

export default defineConfig({
  schema: path.join(baseDir, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(baseDir, 'prisma', 'migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
