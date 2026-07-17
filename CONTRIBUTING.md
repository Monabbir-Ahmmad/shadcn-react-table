# Contributing to shadcn-react-table

Thanks for your interest in contributing! Direct pushes to `main` are disabled —
all changes land through pull requests. The flow below works for both maintainers
and outside contributors.

## Prerequisites

- Node.js ≥ 20
- pnpm 11.13.1 (`corepack enable` will pick up the pinned version)

## Setup

```bash
# Outside contributors: fork the repo first, then clone your fork.
git clone https://github.com/<you>/shadcn-react-table.git
cd shadcn-react-table
pnpm install
```

## Making a change

1. Create a branch off `main`:
   ```bash
   git switch -c my-feature
   ```
2. Make your change. Edits in `packages/shadcn-react-table/src/` (the data-table) and
   `packages/ui/src/` (shadcn primitives) are picked up immediately by
   `pnpm dev` (no rebuild needed — the packages are consumed as source).
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
