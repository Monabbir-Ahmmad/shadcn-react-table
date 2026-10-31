// Temporary data for the marketing-video pages (local only).

export type Person = {
  id: string
  name: string
  email: string
  team: "Research" | "Platform" | "Design" | "Growth" | "Sales"
  status: "active" | "invited" | "paused"
  joined: string
  rating: number
  salary: number
}

const FIRST = [
  "Ada",
  "Grace",
  "Alan",
  "Katherine",
  "Edsger",
  "Margaret",
  "Barbara",
  "Radia",
  "Frances",
  "Dennis",
  "Hedy",
  "Linus",
  "Annie",
  "Ken",
  "Joan",
  "Tim",
  "Mary",
  "Guido",
  "Sophie",
  "Bjarne",
]
const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Johnson",
  "Dijkstra",
  "Hamilton",
  "Liskov",
  "Perlman",
  "Allen",
  "Ritchie",
  "Lamarr",
  "Torvalds",
  "Easley",
  "Thompson",
  "Clarke",
  "Berners-Lee",
  "Keller",
  "van Rossum",
  "Wilson",
  "Stroustrup",
]
const TEAMS: Person["team"][] = [
  "Research",
  "Platform",
  "Design",
  "Growth",
  "Sales",
]
const STATUSES: Person["status"][] = [
  "active",
  "active",
  "active",
  "invited",
  "paused",
]

/** Deterministic, so every take shows the same people. */
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280
  return x - Math.floor(x)
}

export function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[i % FIRST.length]!
    const last = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length]!
    const year = 2017 + Math.floor(seeded(i, 1) * 9)
    const month = 1 + Math.floor(seeded(i, 2) * 12)
    return {
      id: `p${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@acme.dev`,
      team: TEAMS[Math.floor(seeded(i, 3) * TEAMS.length)]!,
      status: STATUSES[Math.floor(seeded(i, 4) * STATUSES.length)]!,
      joined: `${year}-${String(month).padStart(2, "0")}-15`,
      rating: 55 + Math.floor(seeded(i, 5) * 45),
      salary: 85000 + Math.round(seeded(i, 6) * 95) * 1000,
    }
  })
}
