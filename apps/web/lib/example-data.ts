// Deterministic sample data for the example tables (no randomness, so SSR and
// client renders match and pagination/grouping are stable across reloads).

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  age: number
  role: "Owner" | "Admin" | "Editor" | "Viewer"
  department: "Engineering" | "Sales" | "Marketing" | "Support" | "Design"
  status: "active" | "inactive" | "pending"
  salary: number
  startDate: Date
  city: string
  country: string
  progress: number
}

const FIRST = [
  "Ava", "Liam", "Noah", "Emma", "Olivia", "William", "Sophia", "James",
  "Isabella", "Lucas", "Mia", "Benjamin", "Charlotte", "Henry", "Amelia",
  "Jack", "Harper", "Leo", "Ella", "Mason",
]
const LAST = [
  "Thompson", "Carter", "Patel", "Reyes", "Chen", "Diaz", "Khan", "Nguyen",
  "Rossi", "Muller", "Johansson", "Cohen", "Dubois", "Tanaka", "Silva",
  "Walker", "Park", "Costa", "Novak", "Haddad",
]
const ROLES: User["role"][] = ["Owner", "Admin", "Editor", "Viewer"]
const DEPTS: User["department"][] = [
  "Engineering", "Sales", "Marketing", "Support", "Design",
]
const STATUSES: User["status"][] = ["active", "inactive", "pending"]
const PLACES: [string, string][] = [
  ["Berlin", "Germany"], ["Tokyo", "Japan"], ["Austin", "USA"],
  ["Lyon", "France"], ["Milan", "Italy"], ["Toronto", "Canada"],
  ["Oslo", "Norway"], ["Lisbon", "Portugal"],
]

const DAY = 86_400_000

export function makeUsers(count = 48): User[] {
  const base = new Date("2023-01-02T00:00:00Z").getTime()
  return Array.from({ length: count }, (_, i): User => {
    const first = FIRST[i % FIRST.length] as string
    const last = LAST[(i * 7) % LAST.length] as string
    const place = PLACES[i % PLACES.length] as [string, string]
    return {
      id: `U-${1000 + i}`,
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      age: 22 + ((i * 3) % 40),
      role: ROLES[i % ROLES.length] as User["role"],
      department: DEPTS[(i * 2) % DEPTS.length] as User["department"],
      status: STATUSES[i % STATUSES.length] as User["status"],
      salary: 45_000 + ((i * 2137) % 90_000),
      startDate: new Date(base + i * 11 * DAY),
      city: place[0],
      country: place[1],
      progress: (i * 9) % 101,
    }
  })
}

export const users = makeUsers(48)

// Hierarchical data for the tree / sub-rows example.
export type OrgNode = {
  id: string
  name: string
  title: string
  department: User["department"]
  headcount: number
  subRows?: OrgNode[]
}

export const orgData: OrgNode[] = [
  {
    id: "o1",
    name: "Dana Reed",
    title: "VP Engineering",
    department: "Engineering",
    headcount: 24,
    subRows: [
      {
        id: "o1-1",
        name: "Sam Lee",
        title: "Eng Manager",
        department: "Engineering",
        headcount: 8,
        subRows: [
          { id: "o1-1-1", name: "Priya Rao", title: "Senior Engineer", department: "Engineering", headcount: 0 },
          { id: "o1-1-2", name: "Tom Fox", title: "Engineer", department: "Engineering", headcount: 0 },
        ],
      },
      {
        id: "o1-2",
        name: "Nina Wells",
        title: "Eng Manager",
        department: "Engineering",
        headcount: 6,
        subRows: [
          { id: "o1-2-1", name: "Omar Diaz", title: "Engineer", department: "Engineering", headcount: 0 },
        ],
      },
    ],
  },
  {
    id: "o2",
    name: "Chris Vale",
    title: "VP Sales",
    department: "Sales",
    headcount: 12,
    subRows: [
      { id: "o2-1", name: "Ivy Brooks", title: "Sales Lead", department: "Sales", headcount: 4 },
      { id: "o2-2", name: "Ravi Shah", title: "Account Exec", department: "Sales", headcount: 0 },
    ],
  },
]
