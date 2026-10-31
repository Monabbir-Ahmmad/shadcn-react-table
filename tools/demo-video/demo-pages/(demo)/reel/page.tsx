import { ReelTable } from "./reel-table"

export const metadata = { title: "shadcn-react-table" }

/** Temporary page for the marketing video (local only). */
export default function ReelPage() {
  return (
    <main className="min-h-svh bg-background" style={{ padding: "64px 40px 0" }}>
      <div className="mx-auto max-w-6xl">
        <ReelTable />
      </div>
    </main>
  )
}
