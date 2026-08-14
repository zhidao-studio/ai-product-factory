---
name: speckit-tasks
description: Create traceable tasks from a separately confirmed engineering plan.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:ai-product-factory-governance
---

# Speckit Tasks Skill

# Project Tasks: User-Story Delivery Checklist

## Entry Gate

Stop unless `spec.md` and `plan.md` both state `已确认`, the Spec passes the strict requirement gate,
and the confirmation evidence identifies the responsible reviewers. Task generation is not
implementation authorization.

## Required Process

1. Read the confirmed Spec, Plan, and only the supporting artifacts that the Plan declared necessary.
2. Resolve the project tasks template and write `tasks.md` with status `草稿`.
3. Organize work by `US-*` and independent acceptance checkpoint, not by generic Setup → Model →
   Service → Endpoint layers. A shared prerequisite phase is allowed only when multiple stories truly
   depend on it.
4. Every implementation task must use the project format and include:
   - a stable `Txxx` identifier;
   - relevant `US-*`, `BR-*`, and `AC-*` traceability;
   - exact existing or planned repository file paths;
   - one observable result and one proportionate verification method.
5. Include contract/security/data preparation before dependent code only when the confirmed Plan
   requires it. Mark `[P]` only for work with no dependency or file conflict.
6. End every user story with an independent acceptance checkpoint. The final phase must cover all
   affected builds, critical business paths, regression boundaries, documentation, diff hygiene,
   and known unverified environments.
7. Reject tasks for non-goals, speculative modules/services, unrelated cleanup, generic framework
   setup, or opportunistic refactors.
8. Report task dependencies, parallel safety, and MVP boundary; then stop for task review. Do not
   run Analyze or Implement automatically, and never self-change the status to `已确认`.
