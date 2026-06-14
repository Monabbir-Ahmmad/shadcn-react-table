# Contributing to tablecn

Thanks for your interest in contributing! Direct pushes to `main` are disabled —
all changes land through pull requests. The flow below works for both maintainers
and outside contributors.

## Prerequisites

- Node.js ≥ 20
- pnpm 10.33.4 (`corepack enable` will pick up the pinned version)

## Setup

```bash
# Outside contributors: fork the repo first, then clone your fork.
git clone https://github.com/<you>/tablecn.git
cd tablecn
pnpm install
```

## Making a change

1. Create a branch off `main`:
   ```bash
   git switch -c my-feature
   ```
2. Make your change. Edits in `packages/ui/src/` are picked up immediately by
   `pnpm dev` (no rebuild needed — the package is consumed as source).
3. Before opening a PR, make sure these all pass locally:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
4. Push your branch and open a pull request against `main`.

## Pull requests

- CI (lint, typecheck, build) runs automatically on every PR and must pass.
- At least one approving review is required before merging.
- Keep PRs focused — smaller PRs are reviewed faster.

## Useful commands

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Run the web app (`next dev`)                  |
| `pnpm build`     | Build all workspaces                          |
| `pnpm lint`      | ESLint across workspaces                      |
| `pnpm typecheck` | `tsc --noEmit` across workspaces              |
| `pnpm format`    | Prettier `--write` across workspaces          |

See [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) for architecture details.
