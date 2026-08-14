---
name: speckit-clarify
description: Clarify at most three material business decisions without adding technical
  design.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:ai-product-factory-governance
---

# Speckit Clarify Skill

# Project Clarify: Business Decisions Only

## Scope

Clarify an existing draft `spec.md`. This command may resolve business ambiguity; it may not design
the solution or approve the requirement.

## Required Process

1. Resolve the explicit Feature directory, then read its `spec.md`,
   `.specify/memory/constitution.md`, and the project requirement checklist.
2. Review only business-facing ambiguity:
   - actor and permission outcome;
   - trigger, main flow, exception, boundary, and user-visible state transition;
   - business rule, privacy/security outcome, compliance obligation, and non-goal;
   - acceptance result that a product owner can observe.
3. Ignore questions that can be answered later from repository facts or engineering constraints.
   Never ask the product owner to choose a framework, module, API, protocol, table, field, data type,
   index, cache, deployment, build tool, or code structure. Do not infer performance numbers or
   industry defaults. A business SLA may be clarified only when the user has made that outcome part
   of the requirement.
4. Ask no more than three questions across the whole clarification session, one at a time, highest
   impact first. Each question must explain in plain language which business result changes. Stop
   early when the remaining ambiguity does not affect scope or acceptance.
5. Incorporate accepted answers into the existing business sections and remove superseded wording.
   Do not create Data Model, API, Technical Constraints, Success Metrics, or implementation sections.
6. Keep the Spec status `草稿`. Do not tick, untick, replace, or self-approve any requirement
   checklist item; tell the human reviewer which items should be rechecked.
7. Run `node .specify/scripts/verify-specs.mjs <feature-directory>`, report the changes and remaining
   business questions, then stop. Do not start planning.
