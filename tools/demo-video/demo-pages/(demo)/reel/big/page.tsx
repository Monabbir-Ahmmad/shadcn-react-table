import { ReelTable } from "../reel-table"

export const metadata = { title: "shadcn-react-table" }

/** Temporary page for the marketing video: 100,000 rows (local only). */
export default function ReelBigPage() {
  return (
    <main className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-6xl">
        <ReelTable big />
      </div>
    </main>
  )
}
