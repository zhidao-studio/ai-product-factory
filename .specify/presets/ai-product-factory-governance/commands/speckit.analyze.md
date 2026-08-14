---
description: Read-only consistency and scope analysis for confirmed requirement artifacts.
strategy: replace
---

# Project Analyze: Read-Only Gate

## Entry Gate

Run `node .specify/scripts/verify-specs.mjs <feature-directory> --artifacts-ready`. Require confirmed
`spec.md`, `plan.md`, and `tasks.md` with completed reviewer and confirmation-evidence records. The
script checks records; it does not replace human authority in the current review context. Analyze the
current artifacts and repository facts only; do not modify any file or confirmation status.

## Analysis

1. Check that every `US-*`, `BR-*`, and `AC-*` has a plan response, task coverage, and verification
   evidence path; report orphan or invented identifiers.
2. Check that no Plan or Task implements an `NG-*`, changes business meaning, or hides an unconfirmed
   scope expansion.
3. Validate real paths, module ownership, dependency direction, API/data ownership, private trust
   boundaries, frontend independence, UI design sources, and version constraints against current
   repository facts.
4. Check task ordering, file conflicts, safe parallel markers, destructive changes, migration and
   rollback needs, credential/security handling, regression coverage, and honest environment limits.
5. Technical details may correctly exist in Plan/Tasks without appearing in the business Spec. Do
   not flag a table, field, endpoint, or class merely because the Spec intentionally omits design;
   flag it only when it lacks a confirmed business need or contradicts project facts.

## Output

Report findings with evidence and severity:

- **CRITICAL**: violates a confirmed requirement/constitution or makes safe implementation impossible;
- **HIGH**: material scope, ownership, security, contract, migration, or acceptance gap;
- **MEDIUM/LOW**: non-blocking clarity, ordering, maintainability, or evidence improvement.

Unresolved CRITICAL/HIGH findings block implementation unless the authorized decision-maker
explicitly accepts the exact risk. End with a clear gate result. Do not implement, edit artifacts,
stage files, commit, push, create external issues, or merge.
