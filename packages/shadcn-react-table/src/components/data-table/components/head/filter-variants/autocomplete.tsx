"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { VALUELESS_MODES } from "../../../fns/filter-fns"
import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import {
  ClearableInput,
  useSelectOptions,
  ValuelessLabel,
  type FilterFieldProps,
} from "./shared"
import { dt } from "../../../core/internal"

/** A text filter that suggests the column's values (or its
 *  `filterSelectOptions`) through the browser's own suggestion list. */
export function AutocompleteFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = dt(table)
  const { options } = useSelectOptions(column)
  const listId = React.useId()
  const mode = getEffectiveMode(column, table)
  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }
  const value = (column.getFilterValue() ?? "") as string
  return (
    <>
      <ClearableInput
        list={listId}
        value={value}
        onChange={(next) => column.setFilterValue(next || undefined)}
        placeholder={localization.filterPlaceholder(getColumnLabel(column))}
        ariaLabel={localization.filterByColumn(getColumnLabel(column))}
        clearLabel={localization.clearFilter}
        ClearIcon={icons.clear}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            label={option.label}
          />
        ))}
      </datalist>
    </>
  )
}
