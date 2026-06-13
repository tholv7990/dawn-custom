#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const schemaPath = path.join(root, 'config', 'settings_schema.json');
const dataPath = path.join(root, 'config', 'settings_data.json');

const watchedSettingIds = [
  'color_accent',
  'color_accent_hover',
  'border_radius',
  'glass_opacity',
  'ct_force_light_mode',
  'page_width',
  'ct_reward_thresholds_by_currency',
  'ct_free_shipping_threshold_cents',
  'ct_discount_threshold_cents',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectDefaults(groups) {
  const defaults = {};

  for (const group of groups) {
    for (const setting of group.settings || []) {
      if (setting.id && Object.prototype.hasOwnProperty.call(setting, 'default')) {
        defaults[setting.id] = setting.default;
      }
    }
  }

  return defaults;
}

function getCurrentPreset(settingsData) {
  const currentName = settingsData.current || 'Default';
  const preset = settingsData.presets?.[currentName];

  if (!preset) {
    throw new Error(`Current preset "${currentName}" was not found in config/settings_data.json.`);
  }

  return { currentName, preset };
}

function formatValue(value) {
  return JSON.stringify(value);
}

const schemaDefaults = collectDefaults(readJson(schemaPath));
const settingsData = readJson(dataPath);
const { currentName, preset } = getCurrentPreset(settingsData);

const failures = [];
const warnings = [];

for (const id of watchedSettingIds) {
  const hasSchemaDefault = Object.prototype.hasOwnProperty.call(schemaDefaults, id);
  const hasSavedValue = Object.prototype.hasOwnProperty.call(preset, id);

  if (!hasSchemaDefault) {
    warnings.push(`${id}: watched setting is not present in settings_schema.json`);
    continue;
  }

  if (!hasSavedValue) {
    warnings.push(`${id}: schema default ${formatValue(schemaDefaults[id])} is not saved in preset "${currentName}"`);
    continue;
  }

  if (formatValue(schemaDefaults[id]) !== formatValue(preset[id])) {
    failures.push(`${id}: schema default ${formatValue(schemaDefaults[id])} != preset "${currentName}" value ${formatValue(preset[id])}`);
  }
}

console.log(`CT settings sync checked ${watchedSettingIds.length} watched settings against preset "${currentName}".`);

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (failures.length) {
  console.error('\nFailures:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nNo saved setting drift found.');
}
