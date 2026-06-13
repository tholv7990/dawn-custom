#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const allowlistPath = path.join(root, 'qa', 'ct-brand-audit-allowlist.json');
const args = new Set(process.argv.slice(2));

const scanRoots = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const textExtensions = new Set(['.css', '.js', '.json', '.liquid', '.svg']);
const brandTerms = [
  { name: 'pollinook', pattern: /\bpollinook\b/i },
  { name: 'gardenstudio', pattern: /\bgardenstudio\b/i },
  { name: 'cozyclaw', pattern: /\bcozyclaw\b/i },
  { name: 'gainssteel', pattern: /\bgainssteel\b/i },
  { name: 'gma', pattern: /\bgma\b/i },
  { name: 'good morning', pattern: /\bgood morning\b/i },
  { name: 'wired', pattern: /\bwired\b/i },
  { name: 'bbc', pattern: /\bbbc\b/i },
  { name: 'usa today', pattern: /\busa today\b/i },
  { name: 'usatoday', pattern: /\busatoday\b/i },
];
const normalizedBrandTerms = [
  { name: 'pollinook', needle: 'pollinook' },
  { name: 'cozyclaw', needle: 'cozyclaw' },
  { name: 'gainssteel', needle: 'gainssteel' },
];

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(fullPath);
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) return [];

    return [fullPath];
  });
}

function scanFile(absPath) {
  const file = normalizePath(path.relative(root, absPath));
  const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/);
  const findings = [];

  lines.forEach((line, index) => {
    for (const term of brandTerms) {
      if (term.pattern.test(line)) {
        findings.push({
          term: term.name,
          file,
          line: index + 1,
          source: line.trim(),
        });
      }
    }

    const normalizedLine = line.toLowerCase().replace(/[^a-z0-9]+/g, '');
    for (const term of normalizedBrandTerms) {
      if (normalizedLine.includes(term.needle) && !findings.some((finding) => finding.term === term.name && finding.line === index + 1)) {
        findings.push({
          term: term.name,
          file,
          line: index + 1,
          source: line.trim(),
        });
      }
    }
  });

  return findings;
}

function summarize(findings) {
  const summary = {};

  for (const finding of findings) {
    summary[finding.term] ??= { count: 0, files: {} };
    summary[finding.term].count += 1;
    summary[finding.term].files[finding.file] ??= 0;
    summary[finding.term].files[finding.file] += 1;
  }

  return summary;
}

function toAllowlist(summary) {
  return Object.fromEntries(
    Object.entries(summary)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([term, data]) => [
        term,
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
  const terms = new Set([...Object.keys(current), ...Object.keys(allowlist)]);

  for (const term of [...terms].sort()) {
    const currentFiles = current[term] || {};
    const allowedFiles = allowlist[term] || {};
    const files = new Set([...Object.keys(currentFiles), ...Object.keys(allowedFiles)]);

    for (const file of [...files].sort()) {
      const actual = currentFiles[file] || 0;
      const allowed = allowedFiles[file] || 0;

      if (actual > allowed) {
        failures.push({ term, file, actual, allowed, added: actual - allowed });
      }
    }
  }

  return failures;
}

function printReport(findings, summary) {
  console.log(`CT brand audit scanned ${scanRoots.join(', ')} and found ${findings.length} tracked mentions.`);

  for (const [term, data] of Object.entries(summary).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`\n${term}: ${data.count}`);

    for (const [file, count] of Object.entries(data.files).sort(([a], [b]) => b - a || a.localeCompare(b))) {
      console.log(`  ${String(count).padStart(4, ' ')}  ${file}`);
    }
  }
}

const findings = scanRoots.flatMap((dir) => walk(path.join(root, dir))).flatMap(scanFile);
const summary = summarize(findings);

printReport(findings, summary);

if (args.has('--update-allowlist')) {
  fs.writeFileSync(allowlistPath, `${JSON.stringify(toAllowlist(summary), null, 2)}\n`);
  console.log(`\nUpdated ${normalizePath(path.relative(root, allowlistPath))}`);
}

if (args.has('--ci')) {
  const failures = compareToAllowlist(summary, loadAllowlist());

  if (failures.length) {
    console.error('\nCT brand audit failed. New tracked mentions:');
    for (const failure of failures) {
      console.error(
        `  ${failure.term}: ${failure.file} has ${failure.actual}, allowlist permits ${failure.allowed} (+${failure.added})`,
      );
    }
    process.exitCode = 1;
  }
}
