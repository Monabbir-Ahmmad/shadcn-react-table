import type * as React from "react"

/** Keeps a click on an in-row control (edit, expand, pin, copy, menu…) from
 *  also firing the row's / cell's own click handlers. React synthetic events
 *  bubble through the React tree, portals included, so putting this on a
 *  wrapper also covers menu items and select options rendered in portals. */
export function stopPropagation(event: React.SyntheticEvent): void {
  event.stopPropagation()
}
