export const SITE_URL = "https://monabbir-ahmmad.github.io/shadcn-react-table"
export const GITHUB_URL =
  "https://github.com/Monabbir-Ahmmad/shadcn-react-table"
/** The block's version, shown in the header (set by `next.config.ts`). */
export const VERSION: string = process.env.NEXT_PUBLIC_TABLE_VERSION ?? ""
/**
 * The sticky site header's height in px. The site layout sets it on `<html>`
 * as `--site-header-h`; sticky offsets use the variable, scroll math this.
 */
export const SITE_HEADER_HEIGHT = 57
export const INSTALL_COMMAND = `npx shadcn@latest add ${SITE_URL}/r/data-table.json`
