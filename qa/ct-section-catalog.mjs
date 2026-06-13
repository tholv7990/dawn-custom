#!/usr/bin/env node
// Generates docs/ct-sections.md - a catalog of all custom ct-* sections.
import fs from 'node:fs';
const files = fs.readdirSync('sections').filter((f) => /^ct-.*\.liquid$/.test(f)).sort();
let md = '# CT Section Library\n\n';
md += 'Auto-generated catalog of the custom `ct-*` sections (`node qa/ct-section-catalog.mjs`). ';
md += 'All are Online Store 2.0 sections a merchant adds from the Theme Editor; all use token-only CSS, neutral presets, and bind commerce data to Shopify objects.\n\n';
md += '| Section | Name | Settings | Block types | Preset blocks |\n|---|---|---|---|---|\n';
let total = 0;
for (const f of files) {
  const src = fs.readFileSync('sections/' + f, 'utf8');
  const m = src.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  if (!m) { md += `| ${f} | (no schema) | - | - | - |\n`; continue; }
  let s;
  try { s = JSON.parse(m[1]); } catch (e) { md += `| ${f} | (schema parse error) | - | - | - |\n`; continue; }
  total++;
  const settings = (s.settings || []).filter((x) => x.id).length;
  const blockTypes = (s.blocks || []).map((b) => b.type).join(', ') || '-';
  const presetBlocks = ((s.presets || [])[0] || {}).blocks ? (s.presets[0].blocks.length) : 0;
  md += `| \`${f.replace('.liquid', '')}\` | ${s.name || '-'} | ${settings} | ${blockTypes} | ${presetBlocks} |\n`;
}
md += `\n**${total} custom \`ct-*\` sections.**\n\n## Regenerate\n\n\`\`\`sh\nnode qa/ct-section-catalog.mjs\n\`\`\`\n`;
fs.writeFileSync('docs/ct-sections.md', md);
console.log('wrote docs/ct-sections.md with', total, 'sections');
