#!/usr/bin/env node
/**
 * Run prisma generate with NODE_PATH set to repo root node_modules.
 * Fixes "Cannot find module .../query_compiler_fast_bg.postgresql.wasm-base64.js"
 * when Prisma CLI resolves @prisma/client relative to schema dir in monorepos.
 * Run from repo root: node scripts/run-prisma-generate.js
 */
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const rootNodeModules = path.join(rootDir, 'node_modules');
const prismaCli = path.join(rootNodeModules, 'prisma', 'build', 'index.js');
const schemaPath = path.join(rootDir, 'apps', 'api', 'prisma', 'schema.prisma');

const env = {
  ...process.env,
  NODE_PATH: rootNodeModules,
};

execSync(`node "${prismaCli}" generate --schema="${schemaPath}"`, {
  stdio: 'inherit',
  cwd: rootDir,
  env,
});
