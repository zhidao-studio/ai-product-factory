---
name: speckit-plan
description: Translate a confirmed business requirement into a repository-grounded
  engineering plan.
argument-hint: "Optional guidance for the planning phase"
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:ai-product-factory-governance
user-invocable: true
disable-model-invocation: false
---

# Speckit Plan Skill

# Project Plan: Confirmed Requirement to Engineering Design

## Entry Gate

1. Identify the explicit Feature directory.
2. Run `node .specify/scripts/verify-specs.mjs <feature-directory> --ready`.
3. Stop unless the Spec is human-confirmed, all business questions are closed, and the full project
   requirement checklist includes reviewer and confirmation evidence.

## Required Process

1. Read the confirmed Spec without changing its business meaning.
2. Inspect the repository's real Controller, VO, POM, schema, configuration, target frontend,
   design rules, version baseline, and nearest working implementation for every affected boundary.
   Distinguish current fact from desired behavior and report conflicts rather than guessing.
3. Create `plan.md` from the resolved project plan template and map every `US-*`, `BR-*`, and `AC-*`
   to an engineering response and verification method.
4. Define the smallest change boundary across Root, Admin, Client, Common, five independent
   frontends, data, infrastructure, and documents. Mark unaffected boundaries as `不涉及`; do not
   create empty modules, shared frontend packages, or a second framework.
5. Record contract, data, UI/platform, security, compatibility, release, rollback, and verification
   changes only where they truly exist. Preserve the ownership and trust boundaries in `CLAUDE.md`.
6. Create supporting artifacts only when they add real information:
   - `research.md` for a material unresolved technical decision backed by primary evidence;
   - `data-model.md` only for real data or lifecycle change;
   - `contracts/` only for a real external or cross-application contract change;
   - `quickstart.md` only for a new reproducible run or acceptance path.
   Never create placeholder artifacts to satisfy a generic layout.
7. Keep `plan.md` status `草稿`, report unresolved engineering decisions and scope risks, and stop
   for the user-designated technical reviewer. Plan approval does not authorize Tasks or code changes.

## Prohibited Actions

Do not modify `spec.md` to fit the preferred solution. Do not implement, stage, commit, push, open a
pull request, or merge. If the plan requires changing business scope or non-goals, return to Specify
and require renewed Spec confirmation.
