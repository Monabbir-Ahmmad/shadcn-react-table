/*
 * The people in the hero's feature tour.
 */

export type HeroStatus = "active" | "invited" | "paused"
export type HeroRow = {
  id: string
  name: string
  email: string
  team: string
  status: HeroStatus
  /** ISO date. */
  joined: string
  /** 0…100. */
  rating: number
  salary: number
}

const row = (
  id: string,
  name: string,
  team: string,
  status: HeroStatus,
  joined: string,
  rating: number,
  salary: number
): HeroRow => ({
  id,
  name,
  email: `${name.split(" ")[0]!.toLowerCase()}@acme.dev`,
  team,
  status,
  joined,
  rating,
  salary,
})

export const HERO_ROWS: readonly HeroRow[] = [
  row("u1", "Ada Lovelace", "Research", "active", "2021-03-14", 92, 128000),
  row("u2", "Grace Hopper", "Platform", "paused", "2019-07-02", 88, 142000),
  row("u3", "Alan Turing", "Research", "active", "2022-01-20", 81, 96500),
  row(
    "u4",
    "Katherine Johnson",
    "Platform",
    "active",
    "2018-11-05",
    97,
    154000
  ),
  row("u5", "Edsger Dijkstra", "Design", "invited", "2024-09-30", 64, 118000),
  row(
    "u6",
    "Margaret Hamilton",
    "Platform",
    "active",
    "2020-05-18",
    90,
    135000
  ),
  row("u7", "Barbara Liskov", "Design", "active", "2021-10-11", 86, 121000),
  row("u8", "Radia Perlman", "Research", "paused", "2023-02-27", 73, 109000),
]

const SALARY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** "$162,500". */
export function formatSalary(salary: number): string {
  return SALARY.format(salary)
}

const JOINED = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/** "Mar 2021". */
export function formatJoined(iso: string): string {
  return JOINED.format(new Date(iso))
}

/** "AL" for "Ada Lovelace". */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}
