---
description: Create a business-only requirement specification and stop for human review.
strategy: replace
---

# Project Specify: Business Requirement Only

## User Input

```text
$ARGUMENTS
```

The text supplied by the user is the requirement source. Preserve its meaning and do not add a
product domain, actor, rule, metric, integration, or capability that the user did not provide.

## Required Process

1. Read `.specify/memory/constitution.md`, `AGENTS.md`, and the demand-first sections of
   `docs/需求驱动开发流程.md`. Do not inspect implementation code to invent product behavior; current
   code is used later during planning.
2. Reuse the explicitly selected Feature directory when one is provided. Otherwise create the next
   real Feature directory with `.specify/scripts/bash/create-new-feature.sh`. Choose a short name
   from the business outcome. The requirement number is not a Git branch, and this command must not
   create, switch, stage, commit, push, or merge a branch.
3. Use the resolved project `spec-template`. Create `checklists/requirements.md` from the resolved
   project `checklist-template`, but leave every checkbox unchecked and leave reviewer/confirmation
   evidence for the actual reviewer. The Agent must never approve its own Spec.
4. Fill only these business sections:
   - background and goal;
   - users and observable scenarios (`US-*`);
   - business rules (`BR-*`);
   - acceptance criteria (`AC-*`);
   - in-scope work and explicit non-goals (`NG-*`);
   - material business questions still awaiting a decision.
5. Keep the status `草稿`. Ask at most three high-impact questions, and only when the answer changes
   business scope, behavior, security/privacy outcome, user experience, or acceptance. Prefer a
   clearly labeled business assumption when the user can reasonably correct it during review.
6. Run `node .specify/scripts/verify-specs.mjs <feature-directory>` and fix structural issues without
   changing business intent.
7. Report the Spec and checklist paths, summarize remaining business questions, and stop for human
   review. Do not start planning in the same command.

## Prohibited Content

Do not write implementation choices into `spec.md`: no language, framework, database, cache,
protocol, API or route, table/field/index, module/class/file path, deployment topology, build tool,
code task, or inferred numerical target. Business objects may be named only by their user-visible
meaning. Technical facts and repository inspection belong in `plan.md` after the Spec is confirmed.
