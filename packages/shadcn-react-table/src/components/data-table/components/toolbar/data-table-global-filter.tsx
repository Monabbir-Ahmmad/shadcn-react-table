"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import type { DataTableInstance } from "../../core/types"
import type { GlobalFilterMode } from "../../fns/filter-fns"
import { dt } from "../../core/internal"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import { cn } from "@workspace/ui/lib/utils"
import {
  isEditingOrCreating,
  readMotionTokens,
  useAnimationsActive,
} from "../../core/motion"

/** Whether the Web Animations API is there (jsdom has none). */
const canAnimate = () =>
  typeof HTMLElement !== "undefined" &&
  typeof HTMLElement.prototype.animate === "function"

/**
 * Expandable global search (MRT order: first in the toolbar icon cluster). The
 * search button toggles an input group beside it, which slides out from the
 * button and back into it: the leading search icon (the search-mode menu's
 * trigger when modes are on), the input, and a clear button. Input is
 * debounced in manual (server) mode so each keystroke doesn't fire a request.
 */
export function DataTableGlobalFilter<TData extends RowData>({
  table,
  searchInputRef,
}: {
  table: DataTableInstance<TData>
  /** Optional ref forwarded to the search input. Defaults to the instance's
   *  `searchInputRef` when rendered by `DataTable`. */
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const {
    localization,
    icons,
    enableGlobalFilter,
    enableGlobalFilterModes,
    globalFilterMode,
    setGlobalFilterMode,
    renderGlobalFilterModeMenuItems,
    globalFilterModeOptions: modes,
    showGlobalFilter: expanded,
    setShowGlobalFilter: setExpanded,
    enableAnimations,
    positionGlobalFilter,
  } = dt(table)
  // Still while a cell or row is edited or created, as the toolbar is.
  const animates =
    useAnimationsActive(enableAnimations) &&
    !isEditingOrCreating(table.getState()) &&
    canAnimate()

  const external = (table.getState().globalFilter ?? "") as string
  // A value set from outside opens the box (also when the table starts with
  // a search in `initialState`).
  const [openedFor, setOpenedFor] = React.useState("")
  if (external.length > 0 && !expanded && external !== openedFor) {
    setOpenedFor(external)
    setExpanded(true)
  }
  const [value, setValue] = React.useState(external)

  // Values this box committed that the table state has not reflected yet.
  // Controlled state that stores them late (router / async state) echoes them
  // back while the user types on; an echo must not replace the newer draft.
  const [inFlight, setInFlight] = React.useState<string[]>([])

  // Outside changes (`setGlobalFilter`, `resetGlobalFilter`, controlled state)
  // win over the local draft. Adjusted during render (React's "derive state
  // from a prop change" pattern) rather than in an effect, which lint forbids.
  // While typing with a debounce, `external` is unchanged, so the draft is kept:
  // `value` only resets when `external` itself changes to something new.
  const [prevExternal, setPrevExternal] = React.useState(external)
  if (external !== prevExternal) {
    setPrevExternal(external)
    const echo = inFlight.indexOf(external)
    if (echo >= 0) {
      setInFlight(inFlight.slice(echo + 1))
    } else {
      setInFlight([])
      setValue(external)
      if (external.length > 0) setExpanded(true)
    }
  }
  // Drive focus-on-expand and let consumers focus the box. Use the forwarded
  // ref when provided (so `DataTable` shares its `searchInputRef`), else a
  // local one. React assigns it directly — no manual `.current` mutation.
  const localRef = React.useRef<HTMLInputElement>(null)
  const inputRef = searchInputRef ?? localRef

  const debounceMs = table.options.manualFiltering ? 300 : 0

  React.useEffect(() => {
    if (value === (table.getState().globalFilter ?? "")) return
    const id = setTimeout(() => {
      setInFlight((prev) => [...prev.slice(-19), value])
      table.setGlobalFilter(value || undefined)
    }, debounceMs)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounceMs])

  // The box stays mounted while it slides back into the button. Derived
  // during render: it shows at once, and without motion it goes at once.
  const [present, setPresent] = React.useState(expanded)
  if (expanded && !present) setPresent(true)
  if (!expanded && present && !animates) setPresent(false)
  const leaving = present && !expanded
  const boxRef = React.useRef<HTMLDivElement>(null)
  const lastExpanded = React.useRef<boolean | null>(null)
  const slides = React.useRef(new Set<Animation>())

  // Slides the box out of the button (its width grows from 0, pushing the
  // items before it aside) and back in.
  React.useLayoutEffect(() => {
    const was = lastExpanded.current
    lastExpanded.current = expanded
    const box = boxRef.current
    if (was === null || was === expanded || !animates || !box) return
    // Mid-slide, it turns around from the width it shows.
    const turning = slides.current.size > 0
    const shown = `${box.getBoundingClientRect().width}px`
    const shownGap =
      getComputedStyle(box)[
        positionGlobalFilter === "left"
          ? "marginInlineStart"
          : "marginInlineEnd"
      ]
    for (const animation of slides.current) animation.cancel()
    slides.current.clear()
    const { duration, ease } = readMotionTokens(box)
    // The gap to the button opens with the box, so nothing jumps by it.
    const gap = box.parentElement
      ? parseFloat(getComputedStyle(box.parentElement).columnGap) || 0
      : 0
    const side =
      positionGlobalFilter === "left" ? "marginInlineStart" : "marginInlineEnd"
    const closed = `${-gap}px`
    const play = (
      keyframes: PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ) => {
      const animation = box.animate(keyframes, { easing: ease, ...options })
      slides.current.add(animation)
      const done = () => slides.current.delete(animation)
      animation.finished.then(done, done)
      return animation
    }
    if (expanded) {
      const full = `${box.getBoundingClientRect().width}px`
      play(
        {
          width: [turning ? shown : "0px", full],
          [side]: [turning ? shownGap : closed, "0px"],
        },
        { duration }
      )
      if (!turning) play({ opacity: [0, 1] }, { duration: duration / 2 })
      return
    }
    play(
      { width: [shown, "0px"], [side]: [shownGap, closed], opacity: [1, 0] },
      { duration, fill: "forwards" }
    ).finished.then(
      () => {
        // Unless it was asked back meanwhile.
        if (lastExpanded.current === false) setPresent(false)
      },
      // Cancelled: it came back, or the table stopped animating.
      () => {}
    )
  }, [expanded, animates, positionGlobalFilter])

  React.useEffect(() => {
    const live = slides.current
    return () => {
      for (const animation of live) animation.cancel()
      live.clear()
    }
  }, [])

  if (!enableGlobalFilter) return null

  const clear = () => {
    setValue("")
    table.setGlobalFilter(undefined)
    inputRef.current?.focus()
  }

  const toggle = () => {
    if (expanded) {
      // Hiding the box drops its search too, so no filter hides out of sight.
      setValue("")
      if (table.getState().globalFilter) table.setGlobalFilter(undefined)
      setExpanded(false)
      return
    }
    setExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const box = present && (
    <div
      ref={boxRef}
      data-slot="data-table-search"
      // Leaving: out of reach while it slides back into the button.
      inert={leaving || undefined}
      // Pinned to the button's side, so it slides out of the button.
      className={cn(
        "flex shrink-0 overflow-hidden",
        positionGlobalFilter === "left" ? "justify-start" : "justify-end"
      )}
    >
      {renderBox()}
    </div>
  )
  const button = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={localization.search}
          aria-expanded={expanded}
          className={cn(
            "size-8",
            expanded && "bg-accent text-accent-foreground"
          )}
          onClick={toggle}
        >
          <icons.search />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localization.search}</TooltipContent>
    </Tooltip>
  )

  // It opens away from the toolbar's edge: leftward from the actions on the
  // right, rightward from the start of the toolbar.
  return positionGlobalFilter === "left" ? (
    <>
      {button}
      {box}
    </>
  ) : (
    <>
      {box}
      {button}
    </>
  )

  function renderBox() {
    return (
      <InputGroup className="h-8 w-auto shrink-0 rounded-md border-border bg-background ps-1 pe-1 focus-within:border-ring">
        <InputGroupAddon align="inline-start" className="py-0">
          {enableGlobalFilterModes ? (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={localization.globalFilterMode}
                      className="text-muted-foreground"
                    >
                      <icons.search className="size-3.5" />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{localization.globalFilterMode}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-48">
                {/* Base UI's GroupLabel requires a Group ancestor; Radix renders
                  the group as an inert wrapper. */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {localization.globalFilterMode}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {renderGlobalFilterModeMenuItems ? (
                  renderGlobalFilterModeMenuItems({
                    modes,
                    currentMode: globalFilterMode,
                    onSelect: setGlobalFilterMode,
                    table,
                  })
                ) : (
                  <DropdownMenuRadioGroup
                    value={globalFilterMode}
                    onValueChange={(mode) =>
                      setGlobalFilterMode(mode as GlobalFilterMode)
                    }
                  >
                    {modes.map((mode) => (
                      <DropdownMenuRadioItem key={mode} value={mode}>
                        {localization.filterModes[mode] ?? mode}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <icons.search className="ms-1 size-3.5 shrink-0 text-muted-foreground" />
          )}
        </InputGroupAddon>
        <InputGroupInput
          {...mergeProps(
            // The ref is forwarded to the input, not read during render.
            {
              ref: inputRef,
              value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setValue(e.target.value),
              placeholder: localization.searchPlaceholder,
              "aria-label": localization.search,
              className:
                "h-7 w-40 flex-none px-1 text-xs font-normal tracking-normal normal-case shadow-none sm:w-56",
            } as React.ComponentProps<"input">,
            getSlotProps(table, "searchInput", {})
          )}
        />
        {value && (
          <InputGroupAddon align="inline-end" className="py-0">
            <InputGroupButton
              size="icon-xs"
              aria-label={localization.clearSearch}
              onClick={clear}
              className="text-muted-foreground"
            >
              <icons.clear className="size-3.5" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    )
  }
}
