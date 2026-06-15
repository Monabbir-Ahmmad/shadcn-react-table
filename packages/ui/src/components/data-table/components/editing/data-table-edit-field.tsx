"use client"

import * as React from "react"

import { Input } from "@monabbir/tablecn/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monabbir/tablecn/components/select"
import { cn } from "@monabbir/tablecn/lib/utils"

import type { DataTableFilterOption, EditVariant } from "../../types"

const FIELD_CLASS =
  "h-8 rounded-sm text-xs font-normal tracking-normal normal-case"

/**
 * A controlled inline edit field (text / number / select). The parent owns the
 * draft value; this renders the input, surfaces validation errors, and wires
 * Enter (commit) / Escape (cancel) / blur (commit) for text inputs.
 */
export function DataTableEditField({
  value,
  onChange,
  onCommit,
  onCancel,
  variant = "text",
  options,
  error,
  ariaLabel,
  autoFocus,
}: {
  value: unknown
  onChange: (value: unknown) => void
  onCommit?: () => void
  onCancel?: () => void
  variant?: EditVariant
  options?: DataTableFilterOption[]
  error?: string
  ariaLabel: string
  autoFocus?: boolean
}) {
  if (variant === "select") {
    return (
      <div className="flex flex-col gap-0.5">
        <Select
          value={value == null ? undefined : String(value)}
          onValueChange={(next) => {
            onChange(next)
            onCommit?.()
          }}
        >
          <SelectTrigger
            size="sm"
            className={cn(FIELD_CLASS, "w-full px-2")}
            aria-label={ariaLabel}
            aria-invalid={!!error}
          >
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {(options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <FieldError>{error}</FieldError>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Input
        autoFocus={autoFocus}
        type={variant === "number" ? "number" : "text"}
        inputMode={variant === "number" ? "decimal" : undefined}
        value={value == null ? "" : String(value)}
        aria-label={ariaLabel}
        aria-invalid={!!error}
        onChange={(e) =>
          onChange(
            variant === "number"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value
          )
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onCommit?.()
          } else if (e.key === "Escape") {
            e.preventDefault()
            onCancel?.()
          }
        }}
        onBlur={() => onCommit?.()}
        className={FIELD_CLASS}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] text-destructive">{children}</span>
}
