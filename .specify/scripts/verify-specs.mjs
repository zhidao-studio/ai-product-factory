#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const SPECS_DIR = join(ROOT, 'specs');
const CHECKLIST_TEMPLATE = join(ROOT, '.specify', 'templates', 'overrides', 'checklist-template.md');

const SECTION_RULES = [
  ['背景与目标', /^##\s+(?:\d+[.、]\s*)?背景与目标\s*$/m],
  ['使用者与场景', /^##\s+(?:\d+[.、]\s*)?使用者与场景\s*$/m],
  ['业务规则', /^##\s+(?:\d+[.、]\s*)?业务规则\s*$/m],
  ['验收标准', /^##\s+(?:\d+[.、]\s*)?验收标准\s*$/m],
  ['范围与非目标', /^##\s+(?:\d+[.、]\s*)?范围与非目标\s*$/m],
  ['待确认问题', /^##\s+(?:\d+[.、]\s*)?待确认问题\s*$/m],
];

const FORBIDDEN_TECH = [
  ['代码块', /```|~~~/m],
  ['技术方案章节', /^#{2,6}\s+(?:\d+[.、]\s*)?(?:技术方案|技术实现|接口设计|API\s*设计|数据库设计|表结构|字段设计|工程结构|目录结构|框架选型|部署方案|代码实现)\s*$/im],
  ['HTTP 方法与路径', /\b(?:GET|POST|PUT|PATCH|DELETE)\s+\/[A-Za-z0-9_{}-]/i],
  ['技术产品或实现机制', /\b(?:MySQL|PostgreSQL|Oracle|SQL\s*Server|Redis|Kafka|Spring(?:\s*Boot)?|RuoYi|Java|Kotlin|TypeScript|JavaScript|React(?:\s*Native)?|Vue|Taro|Umi|Vite|Maven|Gradle|Docker|Nginx|JWT|RSA|AES|HMAC|GraphQL|REST(?:ful)?|HTTP|JSON|XML|API)\b/i],
  ['实现层术语', /(?:Controller|Service|Mapper|Repository|DTO|Entity|数据库|缓存|消息队列|技术栈|框架选型|接口路径|表结构|字段(?:名|类型|设计)|索引设计|类名|工程目录|部署拓扑|构建工具)/i],
  ['代码式标识符', /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/],
  ['裸接口或工程路径', /\/(?:[A-Za-z][A-Za-z0-9_{}.-]*\/)+[A-Za-z0-9_{}.-]+/],
  ['源码或工程路径', /(?:^|[\s`"'(])(?:backend|web|src)\/[A-Za-z0-9_.@/-]+/im],
  ['SQL 表结构', /\b(?:CREATE|ALTER|DROP)\s+TABLE\b/i],
  ['字段或索引清单', /^\s*(?:表名|字段名|索引|主键)\s*[:：]/m],
];

const REQUIRED_CHECKLIST_IDS = Array.from({ length: 15 }, (_, index) =>
  `CHK${String(index + 1).padStart(3, '0')}`,
);

function usage() {
  console.log(`用法：
  node .specify/scripts/verify-specs.mjs
  node .specify/scripts/verify-specs.mjs specs/<编号-短名称>
  node .specify/scripts/verify-specs.mjs specs/<编号-短名称>/spec.md --ready
  node .specify/scripts/verify-specs.mjs specs/<编号-短名称> --artifacts-ready

默认检查全部 Feature 的结构；--ready 额外检查用户确认状态、待确认问题和需求清单；
--artifacts-ready 还会检查 plan.md 与 tasks.md 的确认人和确认依据。`);
}

function parseArgs(argv) {
  let target;
  let ready = false;
  let artifactsReady = false;

  for (const arg of argv) {
    if (arg === '--ready') {
      ready = true;
    } else if (arg === '--artifacts-ready') {
      ready = true;
      artifactsReady = true;
    } else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else if (arg.startsWith('-')) {
      throw new Error(`未知选项：${arg}`);
    } else if (target) {
      throw new Error('一次只能检查一个 Feature；不传路径可检查全部。');
    } else {
      target = arg;
    }
  }

  return { target, ready, artifactsReady };
}

function isInsideSpecs(path) {
  const rel = relative(SPECS_DIR, path);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !rel.startsWith(sep);
}

function resolveTargets(target) {
  if (!target) {
    if (!existsSync(SPECS_DIR)) return [];
    const candidates = readdirSync(SPECS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(SPECS_DIR, entry.name, 'spec.md'))
      .sort();
    const missing = candidates.filter((path) => !existsSync(path));
    if (missing.length > 0) {
      throw new Error(`Feature 目录缺少 spec.md：${missing.map((path) => relative(ROOT, dirname(path))).join('、')}`);
    }
    return candidates;
  }

  const requested = resolve(ROOT, target);
  if (!existsSync(requested)) throw new Error(`路径不存在：${relative(ROOT, requested)}`);

  const specPath = statSync(requested).isDirectory() ? join(requested, 'spec.md') : requested;
  if (!isInsideSpecs(specPath)) throw new Error('Feature 必须位于 specs/<编号-短名称>/。');
  if (basename(specPath) !== 'spec.md') throw new Error('目标文件必须命名为 spec.md。');
  const featureDir = relative(SPECS_DIR, dirname(specPath));
  if (!featureDir || featureDir.includes(sep)) {
    throw new Error('spec.md 必须直接位于 specs/<编号-短名称>/。');
  }
  if (!existsSync(specPath)) throw new Error(`缺少需求文件：${relative(ROOT, specPath)}`);
  return [specPath];
}

function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

function sectionContent(text, headingPattern) {
  const match = headingPattern.exec(text);
  if (!match) return null;
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const nextHeading = rest.search(/^##\s+/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
}

function hasMeaningfulContent(content) {
  if (content === null) return false;
  const plain = stripComments(content)
    .replace(/^#{3,6}\s+.*$/gm, '')
    .replace(/^\s*[-*+]\s*/gm, '')
    .replace(/[`*_>]/g, '')
    .replace(/\[[^\]\n]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 0 && !/^(?:待补充|请填写|暂无内容|N\/A)$/i.test(plain);
}

function normalizePending(content) {
  return stripComments(content ?? '')
    .replace(/^\s*[-*+]\s*/gm, '')
    .replace(/[。；;]\s*$/g, '')
    .trim();
}

function collectDefinitions(text, prefix) {
  const pattern = new RegExp(
    prefix === 'US'
      ? '^###\\s+(US-\\d{3})\\b'
      : '^\\s*-\\s+\\*\\*(' + prefix + '-\\d{3})\\*\\*\\s*[:：()（）]',
    'gm',
  );
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

function duplicateIds(ids) {
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

function checklistItems(text) {
  return [...text.matchAll(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/gm)].map((match) => {
    const body = match[2].replace(/\s+/g, ' ').trim();
    return {
      marker: match[1],
      body,
      id: body.match(/^(CHK\d{3})\b/)?.[1],
    };
  });
}

function validateChecklist(featureDir, errors) {
  const checklistPath = join(featureDir, 'checklists', 'requirements.md');
  if (!existsSync(checklistPath)) {
    errors.push('严格门禁缺少 checklists/requirements.md。');
    return;
  }

  const checklist = readFileSync(checklistPath, 'utf8');
  const allItems = checklistItems(checklist);
  const items = allItems.filter((item) => item.id);
  const ids = items.map((item) => item.id);
  const missing = REQUIRED_CHECKLIST_IDS.filter((id) => !ids.includes(id));
  const unexpected = ids.filter((id) => !REQUIRED_CHECKLIST_IDS.includes(id));
  const duplicates = duplicateIds(ids);

  if (missing.length > 0) errors.push(`requirements.md 缺少审查项：${missing.join('、')}。`);
  if (unexpected.length > 0) errors.push(`requirements.md 含未知审查项：${unexpected.join('、')}。`);
  if (duplicates.length > 0) errors.push(`requirements.md 审查项重复：${duplicates.join('、')}。`);
  if (allItems.length !== REQUIRED_CHECKLIST_IDS.length || items.length !== allItems.length) {
    errors.push(`requirements.md 必须且只能包含 ${REQUIRED_CHECKLIST_IDS.length} 个项目审查项。`);
  }
  if (items.some((item) => item.marker === ' ')) {
    errors.push('requirements.md 仍有未通过的审查项。');
  }

  if (!existsSync(CHECKLIST_TEMPLATE)) {
    errors.push('缺少项目需求清单模板，无法核对审查项正文。');
  } else {
    const expectedItems = checklistItems(readFileSync(CHECKLIST_TEMPLATE, 'utf8'));
    const expectedById = new Map(expectedItems.map((item) => [item.id, item.body]));
    for (const item of items) {
      if (expectedById.get(item.id) !== item.body) {
        errors.push(`requirements.md 的 ${item.id} 正文与项目需求清单不一致。`);
      }
    }
  }

  const reviewer = checklist.match(/^\*\*审查者\*\*\s*[:：]\s*(.+)$/m)?.[1]?.trim();
  if (isInvalidReviewer(reviewer)) {
    errors.push('requirements.md 必须记录实际审查者。');
  }

  const failedItems = checklist.match(/^\s*-\s+未通过项\s*[:：]\s*(.+)$/m)?.[1]?.trim();
  if (failedItems !== '无') errors.push('requirements.md 的“未通过项”必须为“无”。');

  const confirmation = checklist.match(/^\s*-\s+确认依据\s*[:：]\s*(.+)$/m)?.[1]?.trim();
  if (isInvalidConfirmationEvidence(confirmation)) {
    errors.push('requirements.md 必须记录可追溯的用户确认依据。');
  }
}

function isMissingConfirmationValue(value) {
  return !value || value === '无' || /^\[.*\]$/.test(value) || /(?:待用户确认|待填写|请填写|TODO|TBD)/i.test(value);
}

function isInvalidReviewer(value) {
  return (
    isMissingConfirmationValue(value) ||
    /(?:^|[\s：:,，])(?:AI|Codex|Claude(?:\s+Code)?|Agent|机器人|自动化流程|系统)(?:$|[\s：:,，])/i.test(value)
  );
}

function isInvalidConfirmationEvidence(value) {
  const hasTraceableContext =
    value && /(?:https?:\/\/\S+|#\d+\b|任务|评审|会议|消息|评论|记录|链接|PR|Issue|工单|需求单|对话|会话)/i.test(value);
  return (
    isMissingConfirmationValue(value) ||
    /^(?:AI|Codex|Claude(?:\s+Code)?|Agent|机器人|自动化流程|系统)$/i.test(value) ||
    /(?:自动生成|自动确认|自行确认|模型生成)/i.test(value) ||
    /(?:^|[\s：:,，])(?:AI|Codex|Claude(?:\s+Code)?|Agent|机器人|自动化流程|系统)\s*(?:已|明确)?确认/i.test(value) ||
    !hasTraceableContext
  );
}

function validateArtifactConfirmation(featureDir, filename, label, errors) {
  const artifactPath = join(featureDir, filename);
  if (!existsSync(artifactPath)) {
    errors.push(`完整工件门禁缺少 ${filename}。`);
    return;
  }

  const artifact = stripComments(readFileSync(artifactPath, 'utf8'));
  const documentStatus = artifact.match(/^\*\*状态\*\*\s*[:：]\s*([^\n]+)$/m)?.[1]?.trim();
  if (documentStatus !== '已确认') errors.push(`${label} 顶部状态必须为“已确认”。`);

  const confirmationStatus = artifact.match(/^\s*-\s+\*\*状态\*\*\s*[:：]\s*([^\n]+)$/m)?.[1]?.trim();
  if (confirmationStatus !== '已确认') errors.push(`${label} 确认区状态必须为“已确认”。`);

  const reviewer = artifact.match(/^\s*-\s+\*\*确认人\*\*\s*[:：]\s*([^\n]+)$/m)?.[1]?.trim();
  if (isInvalidReviewer(reviewer)) errors.push(`${label} 必须记录实际确认人。`);

  const evidence = artifact.match(/^\s*-\s+\*\*确认依据\*\*\s*[:：]\s*([^\n]+)$/m)?.[1]?.trim();
  if (isInvalidConfirmationEvidence(evidence)) errors.push(`${label} 必须记录可追溯的确认依据。`);
}

function validateSpec(specPath, ready, artifactsReady) {
  const raw = readFileSync(specPath, 'utf8');
  const text = stripComments(raw);
  const errors = [];

  const statusMatch = text.match(/^\*\*状态\*\*\s*[:：]\s*([^\n]+)$/m);
  if (!statusMatch) {
    errors.push('缺少“**状态**：草稿/已确认”。');
  } else if (!/^(?:草稿|待确认|已确认)\s*$/.test(statusMatch[1])) {
    errors.push(`无法识别需求状态：${statusMatch[1].trim()}。`);
  }

  const contents = new Map();
  for (const [name, pattern] of SECTION_RULES) {
    const content = sectionContent(text, pattern);
    contents.set(name, content);
    if (content === null) errors.push(`缺少必需章节“${name}”。`);
    else if (!hasMeaningfulContent(content)) errors.push(`章节“${name}”没有有效内容。`);
  }

  const definitions = new Map();
  for (const prefix of ['US', 'BR', 'AC']) {
    const ids = collectDefinitions(text, prefix);
    definitions.set(prefix, ids);
    if (ids.length === 0) errors.push(`至少定义一个 ${prefix}-xxx。`);
    const duplicates = duplicateIds(ids);
    if (duplicates.length > 0) errors.push(`${prefix} 编号重复：${duplicates.join('、')}。`);
  }

  for (const match of text.matchAll(/^\s*-\s+\*\*(AC-\d{3})\*\*([^\n]*)$/gm)) {
    const [, acId, body] = match;
    const referencedUsers = [...body.matchAll(/\bUS-\d{3}\b/g)].map((item) => item[0]);
    const referencedRules = [...body.matchAll(/\bBR-\d{3}\b/g)].map((item) => item[0]);
    if (referencedUsers.length === 0 || referencedRules.length === 0) {
      errors.push(`${acId} 必须同时关联至少一个 US-xxx 和 BR-xxx。`);
    }
    for (const id of [...referencedUsers, ...referencedRules]) {
      const prefix = id.slice(0, 2);
      if (!definitions.get(prefix)?.includes(id)) errors.push(`${acId} 引用了未定义编号 ${id}。`);
    }
  }

  const nonGoal = contents.get('范围与非目标') ?? '';
  if (!/^###\s+非目标\s*$/m.test(nonGoal) || !/\bNG-\d{3}\b/.test(nonGoal)) {
    errors.push('“范围与非目标”必须包含“### 非目标”和至少一个 NG-xxx。');
  }

  const unresolved = [
    [/\[NEEDS CLARIFICATION[^\]]*\]/i, '仍有 NEEDS CLARIFICATION 标记'],
    [/\b(?:TODO|TBD)\b/i, '仍有 TODO/TBD 标记'],
    [/\$(?:ARGUMENTS)\b/, '仍有命令参数占位符'],
    [/\[(?:FEATURE NAME|DATE|###-feature-name)\]/i, '仍有模板占位符'],
    [/\[[^\]\n]*(?:请填写|待补充|说明|场景名称|谁|什么|为什么|业务|本次|前置条件|用户行为|事件|结果|内容)[^\]\n]*\]/, '仍有中文模板占位符'],
  ];
  for (const [pattern, message] of unresolved) {
    if (pattern.test(text)) errors.push(`${message}。`);
  }

  for (const [name, pattern] of FORBIDDEN_TECH) {
    if (pattern.test(text)) errors.push(`需求中出现${name}；技术内容应移至 plan.md。`);
  }

  if (ready) {
    if (!statusMatch || statusMatch[1].trim() !== '已确认') {
      errors.push('严格门禁要求状态为“已确认”。');
    }

    const pending = normalizePending(contents.get('待确认问题'));
    if (pending !== '无') errors.push('严格门禁要求“待确认问题”仅为“无”。');
    validateChecklist(dirname(specPath), errors);
  }

  if (artifactsReady) {
    const featureDir = dirname(specPath);
    validateArtifactConfirmation(featureDir, 'plan.md', 'plan.md', errors);
    validateArtifactConfirmation(featureDir, 'tasks.md', 'tasks.md', errors);
  }

  return errors;
}

function main() {
  try {
    const { target, ready, artifactsReady } = parseArgs(process.argv.slice(2));
    const specs = resolveTargets(target);

    if (specs.length === 0) {
      if (ready) {
        throw new Error('严格门禁未找到任何真实 Feature Spec。请明确指定待确认需求。');
      }
      console.log('Spec Kit 需求目录校验通过：尚无真实 Feature Spec。');
      return;
    }

    let failureCount = 0;
    for (const specPath of specs) {
      const label = relative(ROOT, specPath);
      const errors = validateSpec(specPath, ready, artifactsReady);
      if (errors.length === 0) {
        const suffix = artifactsReady ? '（artifacts-ready）' : ready ? '（ready）' : '';
        console.log(`PASS ${label}${suffix}`);
      } else {
        failureCount += 1;
        console.error(`FAIL ${label}`);
        for (const error of errors) console.error(`  - ${error}`);
      }
    }

    if (failureCount > 0) process.exitCode = 1;
    else console.log(`Spec Kit 需求校验通过：${specs.length} 项。`);
  } catch (error) {
    console.error(`Spec Kit 需求校验失败：${error.message}`);
    process.exitCode = 1;
  }
}

main();
