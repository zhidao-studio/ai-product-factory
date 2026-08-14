---
description: Reconcile implementation and confirmed artifacts without silently approving new work.
strategy: replace
---

# Project Converge: Reconcile, Then Re-Review

First run `node .specify/scripts/verify-specs.mjs <feature-directory> --artifacts-ready`. Stop unless
the confirmed Spec, Plan, and Tasks contain complete reviewer and confirmation-evidence records, and
verify their human authority from the current review context. Then read those artifacts, the actual
diff, and verification evidence. Compare completed work to every `AC-*` and confirmed task.

- If everything is aligned, report the evidence and remaining environment limits without changing
  artifacts or code.
- If a confirmed Spec/Plan obligation has no task coverage, append a precise traced task and
  immediately set `tasks.md` status back to `草稿`. Do not duplicate an existing incomplete task,
  and do not implement the new task. It requires fresh Tasks review, Analyze, and explicit
  implementation authorization.
- If the gap changes business scope, rules, acceptance, non-goals, architecture boundary, or risk,
  do not append a task as a shortcut. Return to the appropriate Spec or Plan gate.

This command must not stage, commit, push, create issues, open a pull request, merge, or present its
own additions as approved.
