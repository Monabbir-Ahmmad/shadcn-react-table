/** Numbered steps with a connecting line, for install / setup sequences. */
export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <ol className="my-8 ml-3 border-s ps-8 [counter-reset:step]">{children}</ol>
  )
}

export function Step({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  return (
    <li className="relative mb-8 [counter-increment:step] last:mb-0">
      <span
        aria-hidden
        className="absolute -start-[2.85rem] flex size-7 items-center justify-center rounded-full border bg-background font-mono text-xs font-semibold text-primary before:content-[counter(step)]"
      />
      <h3 className="scroll-m-20 text-base font-semibold">{title}</h3>
      <div className="[&>*:first-child]:mt-2">{children}</div>
    </li>
  )
}
