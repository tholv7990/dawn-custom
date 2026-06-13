#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const allowlistPath = path.join(root, 'qa', 'ct-crlf-audit-allowlist.json');
const args = new Set(process.argv.slice(2));

const ignoredDirs = new Set(['.git', 'node_modules']);
const ignoredExtensions = new Set([
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
]);

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) return [];
      return walk(fullPath);
    }

    if (ignoredExtensions.has(path.extname(entry.name).toLowerCase())) return [];

    return [fullPath];
  });
}

function countCrlf(absPath) {
  const buffer = fs.readFileSync(absPath);
  let count = 0;

  for (let index = 0; index < buffer.length - 1; index += 1) {
    if (buffer[index] === 13 && buffer[index + 1] === 10) count += 1;
  }

  return count;
}

function scan() {
  return Object.fromEntries(
    walk(root)
      .map((absPath) => [normalizePath(path.relative(root, absPath)), countCrlf(absPath)])
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function loadAllowlist() {
  if (!fs.existsSync(allowlistPath)) return {};
  return JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
}

function compare(current, allowlist) {
  const failures = [];
  const files = new Set([...Object.keys(current), ...Object.keys(allowlist)]);

  for (const file of [...files].sort()) {
    const actual = current[file] || 0;
    const allowed = allowlist[file] || 0;

    if (actual > allowed) failures.push({ file, actual, allowed, added: actual - allowed });
  }

  return failures;
}

function total(map) {
  return Object.values(map).reduce((sum, count) => sum + count, 0);
}

function printReport(current, verbose) {
  const entries = Object.entries(current);

  console.log(`CT CRLF audit found ${total(current)} CRLF line ending(s) across ${entries.length} file(s).`);

  const shownEntries = verbose ? entries : entries.slice(0, 10);

  for (const [file, count] of shownEntries) {
    console.log(`  ${String(count).padStart(4, ' ')}  ${file}`);
  }

  if (!verbose && entries.length > shownEntries.length) {
    console.log(`  ... ${entries.length - shownEntries.length} more file(s). Run with --verbose for the full list.`);
  }
}

const current = scan();
printReport(current, args.has('--verbose') || args.has('--update-allowlist'));

if (args.has('--update-allowlist')) {
  fs.writeFileSync(allowlistPath, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`\nUpdated ${normalizePath(path.relative(root, allowlistPath))}`);
}

if (args.has('--ci')) {
  const failures = compare(current, loadAllowlist());

  if (failures.length) {
    console.error('\nCT CRLF audit failed. New CRLF line endings:');
    for (const failure of failures) {
      console.error(`  ${failure.file} has ${failure.actual}, allowlist permits ${failure.allowed} (+${failure.added})`);
    }
    process.exitCode = 1;
  }
}
