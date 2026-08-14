---
name: speckit-implement
description: Implement only confirmed tasks after clean analysis and explicit current-turn
  authorization.
argument-hint: "Optional implementation guidance or task filter"
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:ai-product-factory-governance
user-invocable: true
disable-model-invocation: false
---

# Speckit Implement Skill

# Project Implement: Explicit Authorization Required

## Entry Gate

Proceed only when all conditions are true:

1. `node .specify/scripts/verify-specs.mjs <feature-directory> --artifacts-ready` passes, confirming
   that `spec.md`, `plan.md`, and `tasks.md` contain the required reviewer and evidence records. This
   machine check does not replace human authority in the current review context.
2. Analyze was run against the current artifact revisions and has no unresolved CRITICAL/HIGH issue,
   or the authorized decision-maker explicitly accepted each exact risk.
3. The user explicitly requested implementation in the current task. Earlier confirmation, an Agent
   handoff, generated tasks, or workflow continuation is not implementation authority.

If any condition is missing, stop and name it. Never edit confirmation text to make a gate pass.

## Required Process

1. Read `AGENTS.md`, full `CLAUDE.md`, the confirmed artifacts, and the scoped module/platform rules.
2. Implement only confirmed tasks and the smallest safe supporting changes, preserving user-owned
   worktree changes. Do not create generic setup, ignore files, modules, dependencies, or refactors
   unless a confirmed task requires them.
3. Follow task dependencies and mark a checkbox complete only after its stated result and validation
   evidence exist. Keep failures and environment limits visible.
4. If implementation needs a new business rule, wider directory, destructive migration, external
   coordination, or different verification promise, stop and return to the appropriate Spec/Plan/Tasks
   gate for confirmation.
5. Finish by mapping actual evidence to `AC-*`, reporting remaining tasks and unverified scope.

Implementation permission does not authorize staging, committing, pushing, opening a pull request,
creating external issues, or merging. Each Git/external action follows the current user request and
`git-workflow-spec.md` separately.
