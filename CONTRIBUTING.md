# Contributing to shadcn-react-table

Thanks for your interest in contributing! Direct pushes to `main` are disabled —
all changes land through pull requests. The flow below works for both maintainers
and outside contributors.

## Prerequisites

- Node.js ≥ 22.13
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

- CI runs automatically on every PR and must pass: lint, typecheck, test,
  build, generated-artifact freshness, `registry:verify`, and the install smoke
  test (fresh Radix and Base UI apps).
- At least one approving review is required before merging.
- Keep PRs focused — smaller PRs are reviewed faster.

## Install smoke test

CI installs the block from the PR's own registry into a fresh shadcn Next.js
app for both the Radix and Base UI bases, then typechecks and builds it. To
run it locally (needs internet, a few minutes per base):

```bash
pnpm --filter shadcn-react-table-web registry:build
pnpm --filter shadcn-react-table-web registry:smoke -- --base radix
pnpm --filter shadcn-react-table-web registry:smoke -- --base base
```

Pass `--keep` to leave the generated app in place for debugging; its path is
printed. A failure names the step (`shadcn init`, `shadcn add`, `typecheck`,
`next build`).

## Useful commands

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Run the web app (`next dev`)                  |
| `pnpm build`     | Build all workspaces                          |
| `pnpm lint`      | ESLint across workspaces                      |
| `pnpm typecheck` | `tsc --noEmit` across workspaces              |
| `pnpm format`    | Prettier `--write` across workspaces          |

See [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) for architecture details.
