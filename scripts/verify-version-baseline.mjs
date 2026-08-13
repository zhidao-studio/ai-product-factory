#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const baselinePath = resolve(rootDir, 'docs/architecture/version-baseline.json');
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const failures = [];

const readText = async (relativePath) =>
  readFile(resolve(rootDir, relativePath), 'utf8');

const normalizeDeclaredVersion = (value) => {
  if (typeof value !== 'string') return value;
  const aliasMatch = value.match(/(?:typescript@|typescript6@)(?:\^|~)?(\d+\.\d+\.\d+)/);
  if (aliasMatch) return aliasMatch[1];
  return value.replace(/^[~^]/, '');
};

const normalizePnpmLockedVersion = (value) => {
  if (typeof value !== 'string') return value;
  const unquoted = value.replace(/^['"]|['"]$/g, '');
  const withoutPeers = unquoted.replace(/\(.*/, '');
  const aliasMatch = withoutPeers.match(/@((?:\d+\.){2}\d+)$/);
  return aliasMatch?.[1] ?? withoutPeers;
};

const getJsonPath = (object, path) =>
  path.split('.').reduce((value, key) => value?.[key], object);

const parsePnpmRootImporterVersions = (yamlText) => {
  const versions = new Map();
  const lines = yamlText.split(/\r?\n/);
  let inRootImporter = false;
  let section;
  let packageName;
  for (const line of lines) {
    if (line === '  .:') {
      inRootImporter = true;
      continue;
    }
    if (!inRootImporter) continue;
    if (/^[^ ]/.test(line)) break;
    const sectionMatch = line.match(/^    (dependencies|devDependencies):$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      packageName = undefined;
      continue;
    }
    const packageMatch = line.match(/^ {6}(?:'([^']+)'|([^ :][^:]*)):/);
    if (packageMatch) {
      packageName = packageMatch[1] ?? packageMatch[2];
      continue;
    }
    const versionMatch = line.match(/^        version: (.+)$/);
    if (section && packageName && versionMatch) {
      versions.set(`${section}.${packageName}`, versionMatch[1].trim());
    }
  }
  return versions;
};

const allowedPrereleases = new Set(
  baseline.allowedPrereleases.map(
    ({ file, path, equals }) => `${file}#${path}=${equals}`,
  ),
);

for (const assertion of baseline.textAssertions) {
  try {
    const actual = (await readText(assertion.file)).trim();
    if ('equals' in assertion && actual !== assertion.equals) {
      failures.push(`${assertion.file}: expected ${assertion.equals}, got ${actual}`);
    }
    if ('contains' in assertion && !actual.includes(assertion.contains)) {
      failures.push(`${assertion.file}: missing ${assertion.contains}`);
    }
  } catch (error) {
    failures.push(`${assertion.file}: ${error.message}`);
  }
}

const jsonCache = new Map();
for (const assertion of baseline.jsonAssertions) {
  try {
    let json = jsonCache.get(assertion.file);
    if (!json) {
      json = JSON.parse(await readText(assertion.file));
      jsonCache.set(assertion.file, json);
    }
    const declared = getJsonPath(json, assertion.path);
    if ('equals' in assertion && declared !== assertion.equals) {
      failures.push(
        `${assertion.file}#${assertion.path}: expected ${assertion.equals}, got ${declared}`,
      );
    }
    if (
      'version' in assertion &&
      normalizeDeclaredVersion(declared) !== assertion.version
    ) {
      failures.push(
        `${assertion.file}#${assertion.path}: expected version ${assertion.version}, got ${declared}`,
      );
    }
  } catch (error) {
    failures.push(`${assertion.file}#${assertion.path}: ${error.message}`);
  }
}

for (const assertion of baseline.packageFamilyAssertions) {
  try {
    let json = jsonCache.get(assertion.file);
    if (!json) {
      json = JSON.parse(await readText(assertion.file));
      jsonCache.set(assertion.file, json);
    }
    const packages = Object.entries({
      ...(json.dependencies ?? {}),
      ...(json.devDependencies ?? {}),
    }).filter(([name]) => name.startsWith(assertion.prefix));
    if (packages.length === 0) {
      failures.push(`${assertion.file}: no packages found for ${assertion.prefix}`);
    }
    for (const [name, declared] of packages) {
      if (declared !== assertion.equals) {
        failures.push(
          `${assertion.file}#${name}: expected ${assertion.equals}, got ${declared}`,
        );
      }
    }
  } catch (error) {
    failures.push(`${assertion.file}#${assertion.prefix}: ${error.message}`);
  }
}

for (const [file, json] of jsonCache) {
  for (const section of ['dependencies', 'devDependencies']) {
    for (const [name, declared] of Object.entries(json[section] ?? {})) {
      if (typeof declared !== 'string') continue;
      const isPrerelease =
        /(?:alpha|beta|canary|nightly|snapshot|(?:^|[.@/_-])rc(?:[.@/_-]|\d|$))/i.test(
          declared,
        ) || /\d+\.\d+\.\d+-/.test(declared);
      const key = `${file}#${section}.${name}=${declared}`;
      if (isPrerelease && !allowedPrereleases.has(key)) {
        failures.push(`${file}#${section}.${name}: prerelease ${declared} is not approved`);
      }
    }
  }
}

for (const [directory, packageJson] of [
  ['web/admin', jsonCache.get('web/admin/package.json')],
  ['web/h5', jsonCache.get('web/h5/package.json')],
  ['web/miniapp', jsonCache.get('web/miniapp/package.json')],
  ['web/harmony', jsonCache.get('web/harmony/package.json')],
]) {
  try {
    const yamlText = await readText(`${directory}/pnpm-lock.yaml`);
    const lockedVersions = parsePnpmRootImporterVersions(yamlText);
    for (const section of ['dependencies', 'devDependencies']) {
      for (const [name, declared] of Object.entries(packageJson?.[section] ?? {})) {
        if (!baseline.jsonAssertions.some(
          (item) => item.file === `${directory}/package.json`
            && item.path === `${section}.${name}`,
        )) continue;
        const lockEntry = lockedVersions.get(`${section}.${name}`);
        if (!lockEntry) {
          failures.push(`${directory}/pnpm-lock.yaml: missing locked ${name}`);
          continue;
        }
        const expected = normalizeDeclaredVersion(declared);
        const locked = normalizePnpmLockedVersion(lockEntry);
        if (locked !== expected) {
          failures.push(
            `${directory}/pnpm-lock.yaml#${name}: expected ${expected}, got ${locked}`,
          );
        }
      }
    }
  } catch (error) {
    failures.push(`${directory}/pnpm-lock.yaml: ${error.message}`);
  }
}

try {
  const appPackage = jsonCache.get('web/app/package.json');
  const appLock = JSON.parse(await readText('web/app/package-lock.json'));
  for (const section of ['dependencies', 'devDependencies']) {
    for (const [name, declared] of Object.entries(appPackage?.[section] ?? {})) {
      if (!baseline.jsonAssertions.some(
        (item) => item.file === 'web/app/package.json'
          && item.path === `${section}.${name}`,
      )) continue;
      const locked = appLock.packages?.[`node_modules/${name}`]?.version;
      const expected = normalizeDeclaredVersion(declared);
      if (locked !== expected) {
        failures.push(
          `web/app/package-lock.json#${name}: expected ${expected}, got ${locked}`,
        );
      }
    }
  }
} catch (error) {
  failures.push(`web/app/package-lock.json: ${error.message}`);
}

const verifiedAt = new Date(`${baseline.verifiedAt}T00:00:00`);
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const ageDays = Math.floor((today.getTime() - verifiedAt.getTime()) / 86_400_000);
if (!Number.isFinite(ageDays) || ageDays < 0) {
  failures.push(`invalid verifiedAt: ${baseline.verifiedAt}`);
} else if (ageDays > baseline.reviewIntervalDays) {
  failures.push(
    `version baseline is ${ageDays} days old; re-check official releases and compatibility matrices`,
  );
}

if (failures.length > 0) {
  console.error('Version baseline check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Version baseline verified (${baseline.verifiedAt}, review interval ${baseline.reviewIntervalDays} days).`,
  );
}
