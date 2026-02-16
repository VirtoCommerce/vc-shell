---
name: fixbug
description: Structured bug fix workflow — diagnose from git history, minimal fix, verify
---

# Bug Fix Workflow

1. Ask the user for a clear description of the bug and expected behavior
2. Check `git log --oneline -15` and `git diff HEAD~5` to identify recent changes that may have caused the regression
3. Do targeted investigation (max 5 file reads) to identify root cause
4. Present a 1-2 sentence diagnosis and proposed fix BEFORE implementing
5. Implement the minimal fix — do NOT refactor surrounding code
6. Run `cd framework && npx tsc --noEmit` to verify no TypeScript errors
7. Check for regressions in directly related functionality

CONSTRAINTS:
- Do NOT spend more than 5 minutes exploring without proposing a fix
- Do NOT over-engineer — fix the bug, nothing more
- Reuse existing components (see CLAUDE.md "Reusable Components" section)
- Do NOT create PLAN.md, PROGRESS.md, CONTEXT.md, DECISIONS.md, or REVIEW.md files
