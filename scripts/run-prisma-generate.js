#!/usr/bin/env node
/**
 * Run prisma generate. Creates a symlink so Prisma CLI finds @prisma/client
 * at apps/api/node_modules (it resolves relative to schema dir, ignoring NODE_PATH).
 * Fixes "Cannot find module .../query_compiler_fast_bg.postgresql.wasm-base64.js"
 * Run from repo root: node scripts/run-prisma-generate.js
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const rootNodeModules = path.join(rootDir, 'node_modules');
const apiNodeModules = path.join(rootDir, 'apps', 'api', 'node_modules');
const apiPrismaPkg = path.join(apiNodeModules, '@prisma');
const rootPrismaPkg = path.join(rootNodeModules, '@prisma');
const prismaCli = path.join(rootNodeModules, 'prisma', 'build', 'index.js');
const schemaPath = path.join(rootDir, 'apps', 'api', 'prisma', 'schema.prisma');

// Prisma CLI resolves @prisma/client from schema dir (apps/api). Ensure
// apps/api/node_modules/@prisma points to root so the full package (incl. WASM) is found.
if (!fs.existsSync(apiNodeModules)) {
  fs.mkdirSync(apiNodeModules, { recursive: true });
}
const target = path.relative(apiNodeModules, rootPrismaPkg);
try {
  if (fs.existsSync(apiPrismaPkg)) {
    const stat = fs.lstatSync(apiPrismaPkg);
    if (!stat.isSymbolicLink()) fs.rmSync(apiPrismaPkg, { recursive: true });
  }
  if (!fs.existsSync(apiPrismaPkg)) {
    fs.symlinkSync(target, apiPrismaPkg);
  }
} catch (e) {
  console.warn('Symlink @prisma skipped:', e.message);
}

execSync(`node "${prismaCli}" generate --schema="${schemaPath}"`, {
  stdio: 'inherit',
  cwd: rootDir,
  env: { ...process.env, NODE_PATH: rootNodeModules },
});
