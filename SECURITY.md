# Security

Please report vulnerabilities privately through [GitHub's private vulnerability reporting](https://github.com/Monabbir-Ahmmad/shadcn-react-table/security/advisories/new), not in a public issue.

Include the block version (`meta.version` of the installed data-table), what an attacker can do, and how to reproduce it. You'll get a reply within a week. Fixes ship as a new block version, listed in the [changelog](packages/shadcn-react-table/CHANGELOG.md).

The table renders cell values as text by default. Custom `cell` renderers, `render*` callbacks and `slotProps` run your own code, so treat data you pass to them as you would anywhere else in your app.
