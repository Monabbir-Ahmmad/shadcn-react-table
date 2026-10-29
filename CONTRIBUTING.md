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
   pnpm test
   pnpm test:browser
   pnpm build
   ```
   `pnpm test:browser` runs the `*.browser.test.tsx` files in headless
   Chromium. Install it once with
   `pnpm --filter @monabbir/shadcn-react-table exec playwright install chromium`.
4. Push your branch and open a pull request against `main`.

## Changelog

Every pull request that changes what users get — the data table's behavior,
options, types, styles or docs they rely on — adds an entry to
[`packages/shadcn-react-table/CHANGELOG.md`](packages/shadcn-react-table/CHANGELOG.md)
under `## Unreleased` (create the heading if it isn't there). Start each entry
with **New**, **Changed**, **Fixed** or **Removed**, and mark breaking changes
**(breaking)** with what to do instead. CI checks that a PR touching the table's
source also touches the changelog; for a change users can't see (tests,
refactors), add the `no-changelog` label.

A release renames `## Unreleased` to the new version and bumps `version` in
`packages/shadcn-react-table/package.json`; merging that to `main` publishes the
GitHub release with that section as its notes.

## Generated files

These are built from the source and committed. Never edit them by hand —
change the source and regenerate (`pnpm build` does all of them):

| File                                                        | Built by                                              |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| `apps/web/public/r/*.json`                                  | `pnpm --filter shadcn-react-table-web registry:build` |
| `apps/web/lib/api-reference.generated.ts`                   | `pnpm --filter shadcn-react-table-web api:build`      |
| `apps/web/lib/example-source.generated.ts`                  | `pnpm --filter shadcn-react-table-web examples:build` |
| `apps/web/public/llms*.txt`, `apps/web/public/docs/**/*.md` | `pnpm --filter shadcn-react-table-web llms:build`     |

CI fails when one of them is out of date. Every documented option needs a
JSDoc description; `api:build` fails on a missing one.

## Commits

One change per commit, with a subject line in the form `<type>: <summary>`
(`feat`, `fix`, `perf`, `docs`, `test`, `refactor`, `build`, `ci`, `chore`;
`feat!:` / `refactor!:` for breaking changes).

## Pull requests

- CI runs automatically on every PR and must pass: lint, typecheck, test,
  browser tests (Chromium), build, generated-artifact freshness,
  `registry:verify`, and the install smoke test (fresh Radix and Base UI apps).
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

A failed run keeps the generated app for debugging (its path is printed); pass
`--keep` to keep it after a successful run too. Delete `srt-smoke-*` folders
under your OS temp directory when you are done. A failure names the step
(`shadcn init`, `shadcn add`, `typecheck`, `next build`).

## Useful commands

| Command                                                               | What it does                                    |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| `pnpm dev`                                                            | Run the web app (`next dev`)                    |
| `pnpm build`                                                          | Build all workspaces                            |
| `pnpm lint`                                                           | ESLint across workspaces                        |
| `pnpm typecheck`                                                      | `tsc --noEmit` across workspaces                |
| `pnpm format`                                                         | Prettier `--write` across workspaces            |
| `pnpm test`                                                           | Unit tests (Vitest, jsdom)                      |
| `pnpm test:browser`                                                   | Browser tests (Vitest, headless Chromium)       |
| `pnpm --filter shadcn-react-table-web registry:smoke -- --base radix` | Install the block into a fresh app and build it |

See [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) for architecture details.
