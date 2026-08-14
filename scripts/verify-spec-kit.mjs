#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SPECKIT_VERSION = '0.16.3';
const PRESET_ID = 'ai-product-factory-governance';
const PRESET_VERSION = '1.0.0';
const PRESET_MANIFEST_HASH = 'b6a91bbdff455d5147cbaa761adb86d46522a6bd0ff8de6720286aa22ccf4c4c';
const BUNDLED_WORKFLOW_HASH = 'b9a2a3c3d1e5f022d0369be7c83802a656c64e2d95306a7870a1f59b90c0e307';
const INTEGRATIONS = ['codex', 'claude'];
const SKILLS = [
  'analyze',
  'checklist',
  'clarify',
  'constitution',
  'converge',
  'implement',
  'plan',
  'specify',
  'tasks',
  'taskstoissues',
];
const CONTROLLED_SKILLS = [
  'analyze',
  'clarify',
  'converge',
  'implement',
  'plan',
  'specify',
  'tasks',
  'taskstoissues',
];
const CONTROLLED_SKILL_SET = new Set(CONTROLLED_SKILLS);

// These hashes pin the official v0.16.3 integration manifests independently of the manifests'
// own file lists, so changing an official file and its local manifest together is still detected.
const OFFICIAL_MANIFEST_CONTENT_HASHES = {
  '.specify/integrations/speckit.manifest.json':
    'e7af562e483d729bc294b3630ebd827e0ea77992022a284098578274df034411',
  '.specify/integrations/codex.manifest.json':
    '73c596fd371878f5a8bd456122f02f77a1572ab4a1608f72019fc75a8b3d27c0',
  '.specify/integrations/claude.manifest.json':
    '146488f9f04dc67e507674486b884d5c96584988b32f309398b8edf60b2d8f46',
};

const PROJECT_FILE_HASHES = {
  '.agents/.gitignore': '2e97a0ca9910c6df2d021ab75463221e37b049303d0817ce638372c20a2b6f9a',
  '.claude/.gitignore': '2e97a0ca9910c6df2d021ab75463221e37b049303d0817ce638372c20a2b6f9a',
  '.specify/presets/ai-product-factory-governance/preset.yml': PRESET_MANIFEST_HASH,
  '.specify/presets/ai-product-factory-governance/commands/speckit.specify.md':
    'a253db421d10cf9da717d94e21edbc761362743a911e24db87b7622dcbfc9fa9',
  '.specify/presets/ai-product-factory-governance/commands/speckit.clarify.md':
    '9abcfc0191fd5d235d331b27ee33b36322dc2ce190cbdf52d75c4f7b9d7d9ed6',
  '.specify/presets/ai-product-factory-governance/commands/speckit.plan.md':
    'a278fa36e5dd901f38ca0d9e11fe5657fdc244f6126ecf018c01b8801cf67b1c',
  '.specify/presets/ai-product-factory-governance/commands/speckit.tasks.md':
    '784ecfef1c25b10a3a88a57333136bb52b465ef24d50de24a713a8ac32ffe48a',
  '.specify/presets/ai-product-factory-governance/commands/speckit.analyze.md':
    'eb881601c3fff9c91aa7286e592950d8a33f23451fd0374ba10583ee760fc9d6',
  '.specify/presets/ai-product-factory-governance/commands/speckit.implement.md':
    '469a096342feebf293c31aa232885b561d35ebdba117029b5da8bc1e5c98f0af',
  '.specify/presets/ai-product-factory-governance/commands/speckit.converge.md':
    '53ae22d5183e1d103de637907faacd84e1e9e18caef33f61095c47c23c779aff',
  '.specify/presets/ai-product-factory-governance/commands/speckit.taskstoissues.md':
    'da7fe3d93d5919726fd6093d8347843101c2515064325dfa83cd3f6b6b3230c2',
  '.specify/templates/overrides/spec-template.md':
    '088a0f9e641043d084ba30c8f0b3829ee9d43402e84ba1ed97d5f30caf2243d6',
  '.specify/templates/overrides/checklist-template.md':
    '595e2549d335fda14fe3bc6c8b4b79cc4d882f45a1b4e1e5d008567c77142624',
  '.specify/templates/overrides/plan-template.md':
    'e683ef9f1b9c655a6c2c59e9d1732a39c8731c5961365ec1b2640cd8dcbf608b',
  '.specify/templates/overrides/tasks-template.md':
    '300eea3b9f87b7c8f650b93fe2fe8db9a3164a42aa8cabb2e9b533932f9ed62f',
  '.specify/templates/overrides/constitution-template.md':
    '6ec8a422c6a47cabc90418b4fe1da8cf360869b01f6969d1380849a46710c5a4',
  '.specify/memory/constitution.md':
    'f5214fd08aa4ff7a23a5e834e7864c97384021040e9519d984d7e0f2e5e5dfea',
  '.specify/scripts/verify-specs.mjs':
    '80b039df7278750712bffec9718cae0445af6aa273997f34dbbeb85c6bc8d4b9',
  'scripts/sync-spec-kit-integrations.sh':
    '1b85a1eb8c6801342f14a07ae1127fd43ab6f004e9ce94da12b508803fadbab2',
};

const failures = [];

function pathFromRoot(path) {
  return join(ROOT, path);
}

function readText(path) {
  const absolute = pathFromRoot(path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: missing`);
    return '';
  }
  return readFileSync(absolute, 'utf8');
}

function readJson(path) {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    failures.push(`${path}: invalid JSON (${error.message})`);
    return {};
  }
}

function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(pathFromRoot(path))).digest('hex');
}

function assertHash(path, expectedHash, label = path) {
  if (!existsSync(pathFromRoot(path))) {
    failures.push(`${path}: missing`);
    return;
  }
  if (lstatSync(pathFromRoot(path)).isSymbolicLink()) {
    failures.push(`${path}: managed file must not be a symlink`);
    return;
  }
  if (sha256(path) !== expectedHash) {
    failures.push(`${label}: expected sha256 ${expectedHash}, got ${sha256(path)}`);
  }
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, '');
}

function generatedSkillBody(content) {
  return stripFrontmatter(content).replace(/^# Speckit .* Skill\r?\n+/, '').trim();
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function manifestFingerprint(manifest) {
  const stable = stableValue({
    version: manifest.version,
    integration: manifest.integration ?? null,
    files: manifest.files,
  });
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex');
}

const init = readJson('.specify/init-options.json');
const integration = readJson('.specify/integration.json');
const registry = readJson('.specify/presets/.registry');
const workflowRegistry = readJson('.specify/workflows/workflow-registry.json');

assertEqual(init.speckit_version, SPECKIT_VERSION, 'init-options Spec Kit version');
assertEqual(integration.version, SPECKIT_VERSION, 'integration Spec Kit version');
assertEqual(integration.default_integration, 'codex', 'default integration');
assertEqual(integration.integration, 'codex', 'active integration');
assertEqual(integration.installed_integrations, INTEGRATIONS, 'installed integrations');

for (const [path, hash] of Object.entries(OFFICIAL_MANIFEST_CONTENT_HASHES)) {
  const manifest = readJson(path);
  assertEqual(manifestFingerprint(manifest), hash, `${path}: pinned official manifest content`);
}
for (const [path, hash] of Object.entries(PROJECT_FILE_HASHES)) assertHash(path, hash);

const preset = registry.presets?.[PRESET_ID];
assertEqual(Object.keys(registry.presets ?? {}).sort(), [PRESET_ID], 'installed presets');
assertEqual(preset?.version, PRESET_VERSION, 'project preset version');
assertEqual(preset?.enabled, true, 'project preset enabled');
assertEqual(preset?.manifest_hash, `sha256:${PRESET_MANIFEST_HASH}`, 'project preset manifest hash');
const presetsRoot = '.specify/presets';
assertEqual(readdirSync(pathFromRoot(presetsRoot)).sort(), ['.registry', PRESET_ID], 'preset directory entries');
const presetDirectory = `${presetsRoot}/${PRESET_ID}`;
if (existsSync(pathFromRoot(presetDirectory))) {
  const stat = lstatSync(pathFromRoot(presetDirectory));
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    failures.push(`${presetDirectory}: project preset must be a real directory`);
  } else {
    assertEqual(readdirSync(pathFromRoot(presetDirectory)).sort(), ['commands', 'preset.yml'], 'project preset files');
  }
}
const presetCommandsDirectory = `${presetDirectory}/commands`;
if (existsSync(pathFromRoot(presetCommandsDirectory))) {
  const stat = lstatSync(pathFromRoot(presetCommandsDirectory));
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    failures.push(`${presetCommandsDirectory}: preset commands must be a real directory`);
  } else {
    assertEqual(
      readdirSync(pathFromRoot(presetCommandsDirectory)).sort(),
      CONTROLLED_SKILLS.map((name) => `speckit.${name}.md`).sort(),
      'project preset command files',
    );
  }
}

assertEqual(workflowRegistry.schema_version, '1.0', 'workflow registry schema');
assertEqual(Object.keys(workflowRegistry.workflows ?? {}).sort(), ['speckit'], 'installed workflows');
assertEqual(
  stableValue({
    name: workflowRegistry.workflows?.speckit?.name,
    version: workflowRegistry.workflows?.speckit?.version,
    description: workflowRegistry.workflows?.speckit?.description,
    source: workflowRegistry.workflows?.speckit?.source,
  }),
  stableValue({
    name: 'Full SDD Cycle',
    version: '1.0.0',
    description: 'Runs specify → plan → tasks → implement with review gates',
    source: 'bundled',
  }),
  'bundled workflow metadata',
);
const workflowRegistryPath = '.specify/workflows/workflow-registry.json';
if (existsSync(pathFromRoot(workflowRegistryPath)) && lstatSync(pathFromRoot(workflowRegistryPath)).isSymbolicLink()) {
  failures.push(`${workflowRegistryPath}: workflow registry must not be a symlink`);
}
const workflowRoot = '.specify/workflows';
const workflowEntries = existsSync(pathFromRoot(workflowRoot))
  ? readdirSync(pathFromRoot(workflowRoot)).sort()
  : [];
assertEqual(workflowEntries, ['speckit', 'workflow-registry.json'], 'workflow directory entries');
const bundledWorkflowDirectory = `${workflowRoot}/speckit`;
if (existsSync(pathFromRoot(bundledWorkflowDirectory))) {
  const stat = lstatSync(pathFromRoot(bundledWorkflowDirectory));
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    failures.push(`${bundledWorkflowDirectory}: bundled workflow must be a real directory`);
  } else {
    assertEqual(readdirSync(pathFromRoot(bundledWorkflowDirectory)).sort(), ['workflow.yml'], 'bundled workflow files');
  }
}
assertHash(`${bundledWorkflowDirectory}/workflow.yml`, BUNDLED_WORKFLOW_HASH, 'bundled Spec Kit workflow');

const coreManifest = readJson('.specify/integrations/speckit.manifest.json');
assertEqual(
  readdirSync(pathFromRoot('.specify/integrations')).sort(),
  ['claude.manifest.json', 'codex.manifest.json', 'speckit.manifest.json'],
  'integration manifest files',
);
assertEqual(coreManifest.version, SPECKIT_VERSION, 'shared infrastructure manifest version');
for (const [path, expectedHash] of Object.entries(coreManifest.files ?? {})) {
  assertHash(path, expectedHash, `${path}: official managed core file`);
}

const presetRoot = `.specify/presets/${PRESET_ID}`;
if (existsSync(pathFromRoot(`${presetRoot}/.composed`))) {
  failures.push(`${presetRoot}/.composed: replace-only preset must not retain stale composed output`);
}

for (const skill of CONTROLLED_SKILLS) {
  const rawPath = `${presetRoot}/commands/speckit.${skill}.md`;
  const raw = readText(rawPath);
  if (!/^strategy:\s*replace\s*$/m.test(raw)) failures.push(`${rawPath}: strategy must be replace`);
  if (raw.includes('{CORE_TEMPLATE}')) failures.push(`${rawPath}: replace command must not include CORE_TEMPLATE`);
}

for (const integrationName of INTEGRATIONS) {
  const manifest = readJson(`.specify/integrations/${integrationName}.manifest.json`);
  assertEqual(manifest.version, SPECKIT_VERSION, `${integrationName} manifest version`);
  const skillsRoot = integrationName === 'codex' ? '.agents/skills' : '.claude/skills';
  const registeredCommands = preset?.registered_commands?.[integrationName] ?? [];
  const registered = preset?.registered_skills?.[integrationName] ?? [];
  assertEqual(
    [...registeredCommands].sort(),
    CONTROLLED_SKILLS.map((name) => `speckit.${name}`).sort(),
    `${integrationName} preset command registrations`,
  );
  assertEqual(
    [...registered].sort(),
    CONTROLLED_SKILLS.map((name) => `speckit-${name}`).sort(),
    `${integrationName} preset registrations`,
  );

  const presentSkills = existsSync(pathFromRoot(skillsRoot))
    ? readdirSync(pathFromRoot(skillsRoot), { withFileTypes: true })
        .filter((entry) => entry.name.startsWith('speckit-'))
        .map((entry) => entry.name)
        .sort()
    : [];
  assertEqual(presentSkills, SKILLS.map((name) => `speckit-${name}`).sort(), `${integrationName} skills`);

  for (const skill of SKILLS) {
    const skillDirectory = `${skillsRoot}/speckit-${skill}`;
    if (existsSync(pathFromRoot(skillDirectory))) {
      const stat = lstatSync(pathFromRoot(skillDirectory));
      if (!stat.isDirectory() || stat.isSymbolicLink()) {
        failures.push(`${skillDirectory}: skill entry must be a real directory, not a file or symlink`);
      }
    }
    const path = `${skillsRoot}/speckit-${skill}/SKILL.md`;
    if (existsSync(pathFromRoot(path))) {
      const stat = lstatSync(pathFromRoot(path));
      if (!stat.isFile() || stat.isSymbolicLink()) {
        failures.push(`${path}: generated skill must be a real file, not a directory or symlink`);
      }
    }
    const content = readText(path);
    if (!content) continue;

    if (CONTROLLED_SKILL_SET.has(skill)) {
      const rawPath = `${presetRoot}/commands/speckit.${skill}.md`;
      const expectedBody = stripFrontmatter(readText(rawPath)).trim();
      if (!content.includes(`source: preset:${PRESET_ID}`)) failures.push(`${path}: preset source missing`);
      if (generatedSkillBody(content) !== expectedBody) {
        failures.push(`${path}: generated skill differs from the project replace command`);
      }
    } else {
      const expectedHash = manifest.files?.[path];
      if (!expectedHash) failures.push(`${path}: missing from official integration manifest`);
      else assertHash(path, expectedHash, `${path}: unmodified official skill`);
    }
  }
}

const constitution = readText('.specify/memory/constitution.md');
if (!constitution.includes('**Version**: 1.0.0')) {
  failures.push('.specify/memory/constitution.md: constitution version is not 1.0.0');
}
if (/\[(?:PROJECT_NAME|PRINCIPLE_|SECTION_|GOVERNANCE_RULES|CONSTITUTION_VERSION)/.test(constitution)) {
  failures.push('.specify/memory/constitution.md: unresolved constitution placeholder');
}

if (existsSync(pathFromRoot('.specify/extensions.yml'))) {
  failures.push('.specify/extensions.yml: project extensions are not approved');
}
const extensionsDir = pathFromRoot('.specify/extensions');
if (existsSync(extensionsDir)) {
  const installed = readdirSync(extensionsDir).filter((name) => !name.startsWith('.'));
  if (installed.length > 0) failures.push(`unapproved Spec Kit extensions installed: ${installed.join(', ')}`);
}

if (failures.length > 0) {
  console.error('Spec Kit integration check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Spec Kit integration verified (v${SPECKIT_VERSION}, preset v${PRESET_VERSION}, ` +
      '8 project-gated commands, Codex + Claude).',
  );
}
