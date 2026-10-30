import { copyAnnouncement, type CopyState } from "@/hooks/use-copy"

/** A visually hidden live region that announces a copy's result. */
export function CopyStatus({ state }: { state: CopyState }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {copyAnnouncement(state)}
    </span>
  )
}
