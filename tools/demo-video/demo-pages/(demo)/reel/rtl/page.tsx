import { ReelTable } from "../reel-table"

export const metadata = { title: "shadcn-react-table" }

/** Temporary page for the marketing video: Arabic, right to left (local only). */
export default function ReelRtlPage() {
  return (
    <main className="min-h-svh bg-background" style={{ padding: "64px 40px 0" }}>
      <div className="mx-auto max-w-6xl">
        <ReelTable rtl />
      </div>
    </main>
  )
}
