import styles from "@/style-kits/styles.json"
import { StyleFrameClient } from "@/components/home/customize/style-frame-client"

export const dynamicParams = false

export function generateStaticParams() {
  return styles.map((s) => ({ style: s.name }))
}

export const metadata = { robots: { index: false } }

export default async function StyleFramePage({
  params,
}: {
  params: Promise<{ style: string }>
}) {
  const { style } = await params
  return <StyleFrameClient style={style} />
}
