---
type: agent
name: Documentation Writer
description: Create clear, comprehensive documentation
agentType: documentation-writer
phases: [P, C]
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Documentation Structure

### Primary Files

- `/CLAUDE.md` — main project guide read by Claude Code on every session. Contains: commands, monorepo structure, Clean Architecture layer descriptions, database overview, frontend overview, request flow, tech stack. Keep this file accurate and concise.
- `/AGENTS.md` — redirects to CLAUDE.md (the file you are reading now is sourced from AGENTS.md).

### AI Context Directory

```
.context/
  docs/        # Conceptual docs (architecture decisions, API contracts, etc.)
    README.md  # Index of all doc files
  agents/      # Agent playbooks (this directory)
    README.md  # Index of all agent roles
```

## Writing Guidelines for This Project

- Keep CLAUDE.md focused on commands and structure — it is read on every Claude session, so brevity matters
- Doc files in `.context/docs/` should document things that aren't obvious from reading the code (e.g., why WAL mode, why no ORM, the payment simulation logic)
- Agent playbooks should be practical: what to look for, where the key files are, common patterns — not generic advice
- Use absolute paths when referring to files in documentation (e.g., `packages/api/src/products/products.module.ts`)
- Brazilian payment terminology: boleto (bank slip), pix (instant payment), amounts in centavos

## What Not to Document

- Do not document the legacy `api-core` as the reference — always point to `packages/api` as the canonical pattern
- Do not add Docker, CI/CD, or deployment docs (workshop scope)
- Do not document `frontend-v1` — it is superseded by `frontend-v2`
