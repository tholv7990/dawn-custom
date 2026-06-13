#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const checks = [
  ['CT token audit', ['qa/ct-token-audit.mjs', '--ci']],
  ['CT settings sync', ['qa/ct-settings-sync.mjs']],
  ['CT brand audit', ['qa/ct-brand-audit.mjs', '--ci']],
  ['CT content audit', ['qa/ct-content-audit.mjs', '--ci']],
  ['CT section schema audit', ['qa/ct-section-schema-audit.mjs']],
  ['CT CRLF audit', ['qa/ct-crlf-audit.mjs', '--ci']],
];

let failed = false;

for (const [name, args] of checks) {
  console.log(`\n=== ${name} ===`);

  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    failed = true;
    console.error(`\n${name} failed with exit code ${result.status}.`);
    break;
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('\nAll CT QA checks passed.');
}
