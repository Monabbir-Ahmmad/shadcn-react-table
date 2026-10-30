/*
 * Writes each changeset into CHANGELOG.md as its author wrote it: one bullet
 * per changeset, with no commit hashes or pull request links. Its first line
 * starts the bullet; any further lines are indented under it.
 */

/** @type {import("@changesets/types").ChangelogFunctions} */
const changelog = {
  getReleaseLine: async (changeset) => {
    const [first = "", ...rest] = changeset.summary.trim().split("\n")
    const more = rest.map((line) => (line ? `  ${line}` : line)).join("\n")
    return `\n- ${first}${more ? `\n${more}` : ""}`
  },
  // Only the table is released, so no other package's bump is listed.
  getDependencyReleaseLine: async () => "",
}

export default changelog
