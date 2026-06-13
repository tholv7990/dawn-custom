#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const allowlistPath = path.join(root, 'qa', 'ct-token-audit-allowlist.json');
const args = new Set(process.argv.slice(2));

const scanRoots = ['assets', 'sections', 'snippets'];
const scanExtensions = new Set(['.css', '.liquid']);

const ignoredColorFiles = new Set([
  normalizePath('snippets/css-variables.liquid'),
]);

const ignoredColorLinePatterns = [
  /rgb\(var\(--color-/,
  /rgba\(var\(--color-/,
  /value\.swatch\.color\.rgb/,
  /swatch\.color\.rgb/,
  /settings\.[a-z0-9_]+\.red/i,
];

const tokenLiteralPattern = /(?<!&)#[0-9a-fA-F]{3,8}\b(?!;)|rgba?\((?!\s*var\()[^)]+\)/g;
const gsTokenPattern = /--gs-[a-z0-9-]+/gi;
const importantPattern = /!important\b/g;
const pxPropertyPattern =
  /\b(?:font-size|padding(?:-(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?|margin(?:-(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?)\s*:\s*[^;{}]*\b-?\d*\.?\d+px\b/gi;

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(fullPath);
    if (!scanExtensions.has(path.extname(entry.name))) return [];

    return [fullPath];
  });
}

function matchAll(pattern, value) {
  pattern.lastIndex = 0;
  return [...value.matchAll(pattern)].map((match) => match[0]);
}

function addFinding(findings, type, file, lineNumber, value, line) {
  findings.push({
    type,
    file,
    line: lineNumber,
    value,
    source: line.trim(),
  });
}

function scanFile(absPath) {
  const file = normalizePath(path.relative(root, absPath));
  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (!ignoredColorFiles.has(file) && !ignoredColorLinePatterns.some((pattern) => pattern.test(line))) {
      for (const value of matchAll(tokenLiteralPattern, line)) {
        addFinding(findings, 'color-literal', file, lineNumber, value, line);
      }
    }

    for (const value of matchAll(pxPropertyPattern, line)) {
      addFinding(findings, 'px-spacing-type-literal', file, lineNumber, value, line);
    }

    for (const value of matchAll(gsTokenPattern, line)) {
      addFinding(findings, 'gs-token', file, lineNumber, value, line);
    }

    for (const value of matchAll(importantPattern, line)) {
      addFinding(findings, 'important', file, lineNumber, value, line);
    }
  });

  return findings;
}

function summarize(findings) {
  const summary = {};

  for (const finding of findings) {
    summary[finding.type] ??= { count: 0, files: {} };
    summary[finding.type].count += 1;
    summary[finding.type].files[finding.file] ??= 0;
    summary[finding.type].files[finding.file] += 1;
  }

  return summary;
}

function toAllowlist(summary) {
  return Object.fromEntries(
    Object.entries(summary)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([type, data]) => [
        type,
        Object.fromEntries(Object.entries(data.files).sort(([a], [b]) => a.localeCompare(b))),
      ]),
  );
}

function loadAllowlist() {
  if (!fs.existsSync(allowlistPath)) return {};
  return JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
}

function compareToAllowlist(summary, allowlist) {
  const failures = [];
  const current = toAllowlist(summary);
  const types = new Set([...Object.keys(current), ...Object.keys(allowlist)]);

  for (const type of [...types].sort()) {
    const currentFiles = current[type] || {};
    const allowedFiles = allowlist[type] || {};
    const files = new Set([...Object.keys(currentFiles), ...Object.keys(allowedFiles)]);

    for (const file of [...files].sort()) {
      const actual = currentFiles[file] || 0;
      const allowed = allowedFiles[file] || 0;

      if (actual > allowed) {
        failures.push({ type, file, actual, allowed, added: actual - allowed });
      }
    }
  }

  return failures;
}

function printReport(findings, summary) {
  const total = findings.length;
  console.log(`Token audit scanned ${scanRoots.join(', ')} and found ${total} tracked findings.`);

  for (const [type, data] of Object.entries(summary).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`\n${type}: ${data.count}`);

    for (const [file, count] of Object.entries(data.files).sort(([a], [b]) => b - a || a.localeCompare(b))) {
      console.log(`  ${String(count).padStart(4, ' ')}  ${file}`);
    }
  }
}

const files = scanRoots.flatMap((dir) => walk(path.join(root, dir)));
const findings = files.flatMap(scanFile);
const summary = summarize(findings);

if (args.has('--json')) {
  console.log(JSON.stringify({ summary, findings }, null, 2));
} else {
  printReport(findings, summary);
}

if (args.has('--update-allowlist')) {
  fs.writeFileSync(allowlistPath, `${JSON.stringify(toAllowlist(summary), null, 2)}\n`);
  console.log(`\nUpdated ${normalizePath(path.relative(root, allowlistPath))}`);
}

if (args.has('--ci')) {
  const failures = compareToAllowlist(summary, loadAllowlist());

  if (failures.length) {
    console.error('\nToken audit failed. New tracked findings:');
    for (const failure of failures) {
      console.error(
        `  ${failure.type}: ${failure.file} has ${failure.actual}, allowlist permits ${failure.allowed} (+${failure.added})`,
      );
    }
    process.exitCode = 1;
  }
}
