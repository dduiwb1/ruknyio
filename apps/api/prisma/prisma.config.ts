import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import path from 'path';

const baseDir = __dirname;

export default defineConfig({
  schema: path.join(baseDir, 'schema.prisma'),
  migrations: {
    path: path.join(baseDir, 'migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
});
