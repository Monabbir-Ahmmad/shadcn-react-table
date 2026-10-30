// Drag helpers for browser tests. They dispatch real event types at the
// element's on-screen centre, so dnd-kit's pointer sensor and TanStack's
// resize handler react exactly as they do to a user's drag.

const center = (el: Element) => {
  const rect = el.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

/** Resolves after the next animation frame (lets React and dnd-kit update). */
export const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

interface DragOptions {
  dx: number
  dy?: number
  steps?: number
}

/** dnd-kit pointer drag: pointerdown on the handle, moves and up on document. */
export async function dragPointer(
  handle: Element,
  { dx, dy = 0, steps = 10 }: DragOptions
) {
  const { x, y } = center(handle)
  const base = {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    isPrimary: true,
    pointerType: "mouse",
    button: 0,
  }
  handle.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...base,
      buttons: 1,
      clientX: x,
      clientY: y,
    })
  )
  await nextFrame()
  for (let i = 1; i <= steps; i++) {
    document.dispatchEvent(
      new PointerEvent("pointermove", {
        ...base,
        buttons: 1,
        clientX: x + (dx * i) / steps,
        clientY: y + (dy * i) / steps,
      })
    )
    await nextFrame()
  }
  document.dispatchEvent(
    new PointerEvent("pointerup", {
      ...base,
      buttons: 0,
      clientX: x + dx,
      clientY: y + dy,
    })
  )
  await nextFrame()
}

/** Resize-handle drag: mousedown on the handle, moves and up on document. */
export async function dragMouse(
  handle: Element,
  { dx, dy = 0, steps = 10 }: DragOptions
) {
  const { x, y } = center(handle)
  const base = { bubbles: true, cancelable: true, button: 0 }
  handle.dispatchEvent(
    new MouseEvent("mousedown", {
      ...base,
      buttons: 1,
      clientX: x,
      clientY: y,
    })
  )
  await nextFrame()
  for (let i = 1; i <= steps; i++) {
    document.dispatchEvent(
      new MouseEvent("mousemove", {
        ...base,
        buttons: 1,
        clientX: x + (dx * i) / steps,
        clientY: y + (dy * i) / steps,
      })
    )
    await nextFrame()
  }
  document.dispatchEvent(
    new MouseEvent("mouseup", {
      ...base,
      buttons: 0,
      clientX: x + dx,
      clientY: y + dy,
    })
  )
  await nextFrame()
}
