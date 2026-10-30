/*
 * The hero's table demo: a small table that sorts, filters, selects and
 * edits on a loop. Everything it shows at a moment comes from `demoFrame`, a
 * pure function of the scene and the progress through it, so the component
 * only keeps time.
 */

export type DemoStatus = "active" | "invited" | "paused"
export type DemoRow = {
  id: string
  name: string
  status: DemoStatus
  salary: number
}

export const DEMO_ROWS: readonly DemoRow[] = [
  { id: "u1", name: "Ada Lovelace", status: "active", salary: 128000 },
  { id: "u2", name: "Grace Hopper", status: "paused", salary: 142000 },
  { id: "u3", name: "Alan Turing", status: "active", salary: 96500 },
  { id: "u4", name: "Katherine Johnson", status: "active", salary: 154000 },
  { id: "u5", name: "Edsger Dijkstra", status: "invited", salary: 118000 },
  { id: "u6", name: "Margaret Hamilton", status: "active", salary: 135000 },
]

export type DemoScene = {
  id: "sort" | "filter" | "select" | "edit"
  label: string
  /** The table option behind what the scene shows. */
  option: string
}

export const DEMO_SCENES: readonly DemoScene[] = [
  { id: "sort", label: "Sort", option: "enableSorting" },
  { id: "filter", label: "Filter", option: "columnFilters" },
  { id: "select", label: "Select", option: "enableRowSelection" },
  { id: "edit", label: "Edit", option: "enableEditing" },
]

/** How long each scene lasts. */
export const SCENE_MS = 2500

/** The cell being edited, or that was just edited. */
export type DemoEdit = {
  id: string
  /** What the cell shows: the draft while editing, the saved value after. */
  text: string
  editing: boolean
  /** The whole draft is highlighted, about to be typed over. */
  selectAll: boolean
}

export type DemoFrame = {
  scene: number
  /** Every row id, in the current sort order (filtered rows included). */
  order: string[]
  /** The visible row ids, in order. */
  rows: string[]
  /** Salary is sorted, highest first. */
  sorted: boolean
  /** The "Status: active" filter is applied. */
  filtered: boolean
  selected: string[]
  edit: DemoEdit | null
}

// When, within its scene (0…1), each scene's change happens.
const SORT_AT = 0.35
const FILTER_AT = 0.3
const SELECT_AT = [0.3, 0.55] as const
const EDIT_OPEN_AT = 0.15
const EDIT_TYPE_AT = 0.3
const EDIT_KEY_STEP = 0.075
const EDIT_SAVE_AT = 0.82

/** The rows ticked in the select scene (two of the active ones). */
const SELECT_IDS = ["u6", "u1"] as const
/** The cell edited in the edit scene: the top salary gets a raise, so the
 *  sort keeps it where it is. */
const EDIT_ID = "u4"
const EDIT_VALUE = "162500"

const SALARY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** "$162,500". */
export function formatSalary(salary: number): string {
  return SALARY.format(salary)
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const ORIGINAL = DEMO_ROWS.map((row) => row.id)
const BY_SALARY = [...DEMO_ROWS]
  .sort((a, b) => b.salary - a.salary)
  .map((row) => row.id)
const ACTIVE = new Set(
  DEMO_ROWS.filter((row) => row.status === "active").map((row) => row.id)
)

function editAt(t: number): DemoEdit | null {
  if (t < EDIT_OPEN_AT) return null
  if (t >= EDIT_SAVE_AT) {
    const text = formatSalary(Number(EDIT_VALUE))
    return { id: EDIT_ID, text, editing: false, selectAll: false }
  }
  if (t < EDIT_TYPE_AT) {
    const current = DEMO_ROWS.find((row) => row.id === EDIT_ID)!.salary
    return {
      id: EDIT_ID,
      text: String(current),
      editing: true,
      selectAll: true,
    }
  }
  const keys = Math.min(
    EDIT_VALUE.length,
    Math.floor((t - EDIT_TYPE_AT) / EDIT_KEY_STEP) + 1
  )
  return {
    id: EDIT_ID,
    text: EDIT_VALUE.slice(0, keys),
    editing: true,
    selectAll: false,
  }
}

/**
 * The demo at progress `t` (0…1) through scene `sceneIndex` (0…3). Scenes
 * build on each other: filtering keeps the sort, selecting keeps the filter.
 */
export function demoFrame(sceneIndex: number, t: number): DemoFrame {
  const scene = clamp(Math.floor(sceneIndex), 0, DEMO_SCENES.length - 1)
  const p = clamp(t, 0, 1)

  const sorted = scene > 0 || p >= SORT_AT
  const filtered = scene > 1 || (scene === 1 && p >= FILTER_AT)
  const order = sorted ? BY_SALARY : ORIGINAL
  const rows = filtered ? order.filter((id) => ACTIVE.has(id)) : order

  let ticked = 0
  if (scene > 2) ticked = SELECT_IDS.length
  else if (scene === 2) ticked = SELECT_AT.filter((at) => p >= at).length

  return {
    scene,
    order: [...order],
    rows,
    sorted,
    filtered,
    selected: SELECT_IDS.slice(0, ticked),
    edit: scene === 3 ? editAt(p) : null,
  }
}

/** Where the loop is after `elapsed` ms. */
export function demoPosition(elapsed: number): { scene: number; t: number } {
  const step = Math.floor(elapsed / SCENE_MS)
  return {
    scene:
      ((step % DEMO_SCENES.length) + DEMO_SCENES.length) % DEMO_SCENES.length,
    t: (elapsed - step * SCENE_MS) / SCENE_MS,
  }
}

/** The one frame shown without motion: sorted, filtered, two rows ticked. */
export const STILL_FRAME: DemoFrame = demoFrame(2, 1)
