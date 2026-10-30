# Changesets

Each file here describes one change to the data table that is waiting for a
release. Add one with `pnpm changeset` in any pull request that changes what
users get from the block, and write it for them, in the changelog's style:

```md
---
"@monabbir/shadcn-react-table": minor
---

**New:** `enableFoo` turns on the foo, so the bar can baz.
```

Pick `major` for a breaking change, `minor` for a new feature and `patch` for a
fix. When the pull request merges, the Version workflow keeps a
"chore: version packages" pull request open that bumps the version and moves
these notes into `packages/shadcn-react-table/CHANGELOG.md`. Merging that one
publishes the GitHub release.
