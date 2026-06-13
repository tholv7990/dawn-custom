#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));

const scanRoots = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const textExtensions = new Set(['.css', '.js', '.json', '.liquid', '.svg']);
const ignoredLinePatterns = [
  /"product":\s*"metal-flower-garden-stake"/i,
];
const nicheTerms = [
  { name: 'flower', pattern: /\bflowers?\b/i },
  { name: 'garden', pattern: /\bgardens?\b|\bgardeners?\b/i },
  { name: 'stake', pattern: /\bstakes?\b/i },
  { name: 'soil', pattern: /\bsoil\b/i },
  { name: 'planter', pattern: /\bplanters?\b/i },
  { name: 'bird', pattern: /\bbirds?\b|\bhummingbirds?\b/i },
  { name: 'bee', pattern: /\bbees?\b/i },
  { name: 'pollinator', pattern: /\bpollinators?\b/i },
  { name: 'bowl', pattern: /\bbowls?\b/i },
  { name: 'butterfly', pattern: /\bbutterflies\b|\bbutterfly\b/i },
  { name: 'patio', pattern: /\bpatios?\b/i },
  { name: 'backyard', pattern: /\bbackyards?\b/i },
  { name: 'porch', pattern: /\bporches?\b/i },
  { name: 'petal', pattern: /\bpetals?\b/i },
  { name: 'weather-resistant', pattern: /\bweather-resistant\b/i },
];
const unverifiedProofTerms = [
  { name: 'save-today', pattern: /\bSAVE TODAY\b/i },
  { name: 'most-popular', pattern: /\bMOST POPULAR\b/i },
  { name: 'flash-sale', pattern: /\bFLASH SALE\b/i },
  { name: 'best-value-offer', pattern: /\bBEST VALUE OFFER\b/i },
  { name: 'fake-rating-count', pattern: /\b1\.8K\b/i },
  { name: 'fake-rating-summary', pattern: /\b92%\s*5-star\b/i },
  { name: 'fake-sold-count', pattern: /\b3\.2K\b/i },
  { name: 'discount-signup', pattern: /\b15%\s*(?:off|code)\b/i },
  { name: 'free-shipping-threshold', pattern: /\bfree shipping over \$40\b/i },
  { name: 'seed-reward-threshold-map', pattern: /"ct_reward_thresholds_by_currency":\s*"USD:5000,10000"/i },
  { name: 'seed-free-shipping-threshold-setting', pattern: /"ct_free_shipping_threshold_cents":\s*"5000"/i },
  { name: 'seed-discount-threshold-setting', pattern: /"ct_discount_threshold_cents":\s*"10000"/i },
  { name: 'money-back', pattern: /\bmoney-back\b/i },
  { name: 'fixed-return-window', pattern: /\b30-day (?:returns?|money-back|easy returns?)\b/i },
  { name: 'fixed-return-jsonld', pattern: /"merchantReturnDays":\s*30/i },
  { name: 'fixed-warranty', pattern: /\b(?:12-month|1-year) warranty\b/i },
  { name: 'fake-warehouse', pattern: /\bDallas,\s*TX\b/i },
  { name: 'seed-phone-number', pattern: /\(214\)\s*555-5937\b/i },
  { name: 'seed-support-email', pattern: /\bsupport@example\.com\b/i },
  { name: 'fake-payment-fallbacks', pattern: /\bVISA\b.*\bPAYPAL\b.*\bSHOP PAY\b/i },
  { name: 'trusted-warehouses', pattern: /\btrusted warehouses\b/i },
  { name: 'always-on-support', pattern: /\b24\/7 online support\b/i },
  { name: 'loved-by-customers', pattern: /\bloved by customers\b/i },
  { name: 'fast-shipping', pattern: /\bFast 7-day U\.S\. shipping\b/i },
  { name: 'bundle-save-default', pattern: /\bBUNDLE & SAVE\b/i },
  { name: 'value-package-default', pattern: /\bGreat Value Package\b/i },
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
    if (ignoredLinePatterns.some((pattern) => pattern.test(line))) return;

    for (const term of [...nicheTerms, ...unverifiedProofTerms]) {
      if (term.pattern.test(line)) {
        findings.push({
          term: term.name,
          file,
          line: index + 1,
          source: line.trim(),
        });
      }
    }
  });

  lines.forEach((line, index) => {
    if (!/"id":\s*"automatic_discount_percent"/i.test(line)) return;

    const settingBlock = lines.slice(index, index + 10).join('\n');
    if (/"default":\s*15/i.test(settingBlock)) {
      findings.push({
        term: 'seed-automatic-discount-default',
        file,
        line: index + 1,
        source: line.trim(),
      });
    }
  });

  return findings;
}

const findings = scanRoots.flatMap((dir) => walk(path.join(root, dir))).flatMap(scanFile);

if (findings.length === 0) {
  console.log('CT content audit scanned live theme code and found 0 niche seed-copy or unverified proof mentions.');
  process.exit(0);
}

console.log(`CT content audit found ${findings.length} niche seed-copy or unverified proof mention(s).`);
for (const finding of findings) {
  console.log(`${finding.file}:${finding.line} [${finding.term}] ${finding.source}`);
}

if (args.has('--ci')) {
  process.exitCode = 1;
}
