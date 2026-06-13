#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sectionsDir = path.join(root, 'sections');

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function extractSchema(content) {
  const match = content.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  return match?.[1]?.trim();
}

const sectionFiles = fs
  .readdirSync(sectionsDir)
  .filter((name) => /^ct-.*\.liquid$/.test(name))
  .sort();
const paddingExemptions = new Map([
  ['ct-announcement-bars.liquid', 'ticker bars use fixed compact track height'],
  ['ct-sticky-atc.liquid', 'fixed viewport UI, not document-flow section padding'],
]);

const failures = [];
const report = [];

for (const fileName of sectionFiles) {
  const filePath = path.join(sectionsDir, fileName);
  const relPath = normalizePath(path.relative(root, filePath));
  const sectionSource = fs.readFileSync(filePath, 'utf8');
  const schemaSource = extractSchema(sectionSource);
  const hasSharedPadding = sectionSource.includes("ct-section-padding");
  const paddingExemption = paddingExemptions.get(fileName);

  if (!schemaSource) {
    failures.push(`${relPath}: missing schema block`);
    report.push({ file: relPath, presets: 0, blocks: 0, hasSharedPadding, paddingExemption });
    continue;
  }

  let schema;

  try {
    schema = JSON.parse(schemaSource);
  } catch (error) {
    failures.push(`${relPath}: schema JSON parse failed: ${error.message}`);
    report.push({ file: relPath, presets: 0, blocks: 0, hasSharedPadding, paddingExemption });
    continue;
  }

  const presets = Array.isArray(schema.presets) ? schema.presets.length : 0;
  const blocks = Array.isArray(schema.blocks) ? schema.blocks.length : 0;

  report.push({ file: relPath, presets, blocks, hasSharedPadding, paddingExemption });

  if (presets < 1) {
    failures.push(`${relPath}: missing preset`);
  }
}

console.log(`CT section schema audit checked ${sectionFiles.length} custom ct-* sections.`);

const paddingCount = report.filter((item) => item.hasSharedPadding).length;
const paddingExemptCount = report.filter((item) => item.paddingExemption).length;

for (const item of report) {
  const paddingStatus = item.hasSharedPadding
    ? 'shared padding'
    : item.paddingExemption
      ? `padding exempt (${item.paddingExemption})`
      : 'custom padding';
  console.log(`  ${item.file}: ${item.presets} preset(s), ${item.blocks} block type(s), ${paddingStatus}`);
}

console.log(
  `\nShared padding migration: ${paddingCount}/${sectionFiles.length} custom ct-* sections (${paddingExemptCount} documented exemption(s)).`,
);

if (failures.length) {
  console.error('\nFailures:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nAll custom ct-* sections include at least one preset.');
}
