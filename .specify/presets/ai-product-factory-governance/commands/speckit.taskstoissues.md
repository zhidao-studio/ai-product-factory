---
description: Publish confirmed tasks as GitHub issues only with explicit current-turn authorization.
strategy: replace
---

# Project Tasks to Issues: External Write Gate

Creating GitHub Issues changes external project state. Proceed only when:

1. `node .specify/scripts/verify-specs.mjs <feature-directory> --artifacts-ready` passes with complete
   reviewer and confirmation-evidence records, their human authority is verified from the current
   review context, and the latest Analyze has no unresolved CRITICAL/HIGH;
2. the current user request explicitly asks to create GitHub Issues from these tasks;
3. the target repository and issue grouping are unambiguous.

First present the proposed issue titles and their `Txxx` / `US-*` / `AC-*` mappings. If authority or
target is unclear, stop for confirmation. When authorized, create only those issues through the
approved GitHub integration, preserve traceability and dependencies, and return their URLs. Do not
modify task completion state, create branches, commit, push, open a pull request, or merge. Never
publish secrets, internal credentials, private endpoint signatures, or unreviewed draft tasks.
