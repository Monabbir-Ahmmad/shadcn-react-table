/*
 * The hero's feature tour: the real table plays one feature after another.
 * What the table shows at a moment comes from `tourFrame`, a pure function of
 * the scene and the progress through it, so the component only keeps time.
 */

import { HERO_ROWS } from "@/lib/hero-rows"

export type TourScene = {
  id:
    | "sort"
    | "filter"
    | "search"
    | "select"
    | "edit"
    | "group"
    | "pin"
    | "density"
    | "columns"
  label: string
  /** The table option or state behind what the scene shows. */
  option: string
}

export const TOUR_SCENES: readonly TourScene[] = [
  { id: "sort", label: "Sort", option: "sorting" },
  { id: "filter", label: "Filter", option: "columnFilters" },
  { id: "search", label: "Search", option: "globalFilter" },
  { id: "select", label: "Select", option: "rowSelection" },
  { id: "edit", label: "Edit", option: "editingCell" },
  { id: "group", label: "Group", option: "grouping" },
  { id: "pin", label: "Pin rows", option: "rowPinning" },
  { id: "density", label: "Density", option: "density" },
  { id: "columns", label: "Hide columns", option: "columnVisibility" },
]

/** How long each scene lasts. */
export const SCENE_MS = 3200
/** When, within its scene (0…1), the scene's feature switches on. */
export const APPLY_AT = 0.2
/** The filter applies a beat after its row opens, so each reads alone. */
const FILTER_AT = 0.42

/** The cell being edited, or that was just edited. */
export type TourEdit = {
  id: string
  /** What the cell shows: the draft while editing, the saved value after. */
  text: string
  editing: boolean
  /** The whole draft is highlighted, about to be typed over. */
  selectAll: boolean
}

export type TourFrame = {
  scene: number
  sorted: boolean
  /** The filter row is open. */
  filterRow: boolean
  filtered: boolean
  search: string
  selected: string[]
  edit: TourEdit | null
  grouped: boolean
  pinned: string[]
  compact: boolean
  hidden: string[]
}

const SELECT_AT = [APPLY_AT, 0.45] as const
const SELECT_IDS = ["u6", "u1"] as const
// A team: the search matches across columns, not only names.
const SEARCH = "research"
const SEARCH_KEY_STEP = 0.06
const EDIT_TYPE_AT = 0.35
const EDIT_KEY_STEP = 0.06
const EDIT_SAVE_AT = 0.8
/** The top salary gets a raise. */
export const EDIT_ID = "u4"
const EDIT_VALUE = "162500"
const PIN_ID = "u5"
const HIDE = ["team", "joined"] as const

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

function editAt(t: number): TourEdit | null {
  if (t < APPLY_AT) return null
  if (t >= EDIT_SAVE_AT) {
    return { id: EDIT_ID, text: EDIT_VALUE, editing: false, selectAll: false }
  }
  if (t < EDIT_TYPE_AT) {
    const current = HERO_ROWS.find((row) => row.id === EDIT_ID)!.salary
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
 * The tour at progress `t` (0…1) through scene `sceneIndex`. Each scene starts
 * from the plain table, so its one feature stands out, and switches that
 * feature on at `APPLY_AT`.
 */
export function tourFrame(sceneIndex: number, t: number): TourFrame {
  const scene = clamp(Math.floor(sceneIndex), 0, TOUR_SCENES.length - 1)
  const p = clamp(t, 0, 1)
  const id = TOUR_SCENES[scene]!.id
  const on = p >= APPLY_AT

  let search = ""
  if (id === "search" && on) {
    const keys = Math.floor((p - APPLY_AT) / SEARCH_KEY_STEP) + 1
    search = SEARCH.slice(0, Math.min(SEARCH.length, keys))
  }

  return {
    scene,
    sorted: id === "sort" && on,
    filterRow: id === "filter" && on,
    filtered: id === "filter" && p >= FILTER_AT,
    search,
    selected:
      id === "select"
        ? SELECT_IDS.slice(0, SELECT_AT.filter((at) => p >= at).length)
        : [],
    edit: id === "edit" ? editAt(p) : null,
    grouped: id === "group" && on,
    pinned: id === "pin" && on ? [PIN_ID] : [],
    compact: id === "density" && on,
    hidden: id === "columns" && on ? [...HIDE] : [],
  }
}

/** Where the loop is after `elapsed` ms. */
export function tourPosition(elapsed: number): { scene: number; t: number } {
  const n = TOUR_SCENES.length
  const step = Math.floor(elapsed / SCENE_MS)
  return {
    scene: ((step % n) + n) % n,
    t: (elapsed - step * SCENE_MS) / SCENE_MS,
  }
}

/** The one frame shown without motion: the table sorted by salary. */
export const STILL_FRAME: TourFrame = tourFrame(0, 1)
