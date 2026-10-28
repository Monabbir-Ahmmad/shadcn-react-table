// Installs the built registry block into a freshly scaffolded shadcn Next.js
// app and proves it typechecks and builds there, for one shadcn base. Serves
// apps/web/public over a local HTTP server (so the PR's own registry is what
// gets installed), runs `shadcn init` + `shadcn add`, copies the fixture page
// in, then `tsc --noEmit` and `next build`. Run after registry:build:
//   node apps/web/scripts/smoke-install.mjs --base radix|base [--keep]
// --keep leaves the temp app in place for debugging (its path is printed).
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createServer } from "node:http"
import { cp, mkdtemp, readFile, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, extname, join, normalize } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const PUBLIC_DIR = join(REPO, "apps/web/public")
const FIXTURE = join(REPO, "apps/web/scripts/smoke-fixture/page.tsx")
const ITEM = "r/data-table.json"
const BASES = new Set(["radix", "base"])

const USAGE =
  "usage: node apps/web/scripts/smoke-install.mjs --base radix|base [--keep]"

function parseArgs(argv) {
  let base
  let keep = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    // pnpm forwards the `--` in `registry:smoke -- --base x` to the script.
    if (arg === "--") continue
    if (arg === "--base") base = argv[++i]
    else if (arg.startsWith("--base=")) base = arg.slice("--base=".length)
    else if (arg === "--keep") keep = true
    else return { error: `unknown argument: ${arg}` }
  }
  if (!base || !BASES.has(base)) return { error: `--base must be radix|base` }
  return { base, keep }
}

const CONTENT_TYPES = {
  ".json": "application/json",
  ".html": "text/html",
  ".txt": "text/plain",
}

// Minimal static server over apps/web/public; only what `shadcn add` needs.
function serve(dir) {
  const server = createServer(async (req, res) => {
    const path = normalize(
      decodeURIComponent(new URL(req.url, "http://x").pathname)
    )
    const file = join(dir, path)
    if (!file.startsWith(dir)) {
      res.writeHead(403).end()
      return
    }
    try {
      if (!(await stat(file)).isFile()) throw new Error("not a file")
      res.writeHead(200, {
        "content-type":
          CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
      })
      res.end(await readFile(file))
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port })
    })
  })
}

// Async (not spawnSync) on purpose: the registry server lives in this process,
// so the event loop must stay free to answer the child's requests.
async function run(tag, step, command, args, cwd) {
  console.log(`\n[smoke:${tag}] ${step}\n$ ${[command, ...args].join(" ")}`)
  let failure
  try {
    // shell: true so `pnpm` resolves on Windows as well as Linux.
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: true })
    // Rejects if the child fails to spawn; otherwise resolves on close.
    const [status, signal] = await once(child, "close")
    if (status !== 0) failure = `exit ${status ?? signal}`
  } catch (error) {
    failure = error.message
  }
  if (failure) {
    console.error(`\n[smoke:${tag}] FAILED at "${step}" (${failure})`)
    throw new Error(step)
  }
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.error) {
    console.error(`${parsed.error}\n${USAGE}`)
    process.exit(2)
  }
  const { base, keep } = parsed

  try {
    await stat(join(PUBLIC_DIR, ITEM))
  } catch {
    console.error(
      `${ITEM} not found under apps/web/public — run \`pnpm --filter shadcn-react-table-web registry:build\` first`
    )
    process.exit(2)
  }

  const { server, port } = await serve(PUBLIC_DIR)
  const itemUrl = `http://127.0.0.1:${port}/${ITEM}`
  const work = await mkdtemp(join(tmpdir(), "srt-smoke-"))
  const app = join(work, "app")
  console.log(
    `[smoke:${base}] registry at ${itemUrl}\n[smoke:${base}] app at ${app}`
  )

  let failed = false
  try {
    await run(
      base,
      "shadcn init",
      "pnpm",
      [
        "dlx",
        "shadcn@latest",
        "init",
        "--template",
        "next",
        "--base",
        base,
        "--preset",
        "nova",
        "--name",
        "app",
        "--yes",
      ],
      work
    )
    await run(
      base,
      "shadcn add",
      "pnpm",
      ["dlx", "shadcn@latest", "add", itemUrl, "--yes"],
      app
    )
    await cp(FIXTURE, join(app, "app/page.tsx"))
    await run(base, "typecheck", "pnpm", ["exec", "tsc", "--noEmit"], app)
    await run(base, "next build", "pnpm", ["exec", "next", "build"], app)
    console.log(`\n[smoke:${base}] OK`)
  } catch {
    failed = true
  } finally {
    server.close()
    if (keep || failed) {
      console.log(`[smoke:${base}] app kept at ${app}`)
    } else {
      await rm(work, { recursive: true, force: true })
    }
  }
  process.exit(failed ? 1 : 0)
}

main()
