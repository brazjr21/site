# CLAUDE.md

This file provides guidance to AI assistants (like Claude) working in this repository.

## Repository Overview

This repository is currently in its initial state — no source files, dependencies, or framework have been committed yet. The first development task is to establish the project structure and conventions documented here.

- **Remote:** `origin` → `http://local_proxy@127.0.0.1:33761/git/brazjr21/site`
- **Default development branch:** `claude/add-claude-documentation-v3Tje`

## Git Workflow

### Branch Naming

All Claude-generated branches must follow the pattern:

```
claude/<short-description>-<session-id>
```

Example: `claude/add-claude-documentation-v3Tje`

### Commit Conventions

Use clear, imperative commit messages:

```
Add initial project structure
Fix authentication bug in login flow
Update CLAUDE.md with build instructions
```

Avoid vague messages like "fix stuff" or "wip".

### Push Workflow

Always push with tracking set:

```bash
git push -u origin <branch-name>
```

If a push fails due to a network error, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

> **Important:** Only push to branches starting with `claude/` — pushing to other branches will result in a 403 error.

## Project Setup (To Be Completed)

Once source code is added, update this file with:

- The framework and language being used (e.g., Next.js, Django, Rails)
- How to install dependencies (e.g., `npm install`, `pip install -r requirements.txt`)
- How to run the development server
- How to run tests
- How to run linting/formatting

## Development Conventions (To Be Established)

When the project stack is chosen, document here:

- **Language & runtime** — e.g., TypeScript 5.x on Node 20
- **Framework** — e.g., Next.js App Router, FastAPI, etc.
- **Styling** — e.g., Tailwind CSS, CSS Modules, styled-components
- **Testing** — e.g., Vitest, Jest, Pytest
- **Linting/Formatting** — e.g., ESLint + Prettier, Ruff, Black

## Key Principles for AI Assistants

1. **Read before editing.** Always read a file before modifying it.
2. **Minimal changes.** Only change what is necessary for the task at hand — no unsolicited refactors, cleanups, or extra features.
3. **No security vulnerabilities.** Avoid introducing SQL injection, XSS, command injection, or other OWASP Top 10 issues.
4. **Avoid over-engineering.** Prefer the simplest solution that works. Do not add abstractions for hypothetical future needs.
5. **Respect branch rules.** Never push to a branch other than the designated `claude/` branch unless explicitly authorized.
6. **Confirm before destructive actions.** Actions like `git reset --hard`, `rm -rf`, or force-push require explicit user confirmation first.
7. **Do not create unnecessary files.** Prefer editing existing files over creating new ones.

## Current State

| Item | Status |
|---|---|
| Source code | Not yet added |
| Dependencies | Not yet defined |
| CI/CD | Not yet configured |
| Tests | Not yet written |
| CLAUDE.md | Created (this file) |

Update this table as the project evolves.
