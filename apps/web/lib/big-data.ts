import { makeUsers, type User } from "./example-data"

/**
 * Rows in the large dataset. Measured in desktop Chrome: 100,000 rows take
 * about 26 ms to generate and ~139 MB of heap; 250,000 needed ~812 MB.
 */
export const BIG_ROW_COUNT = 100_000

/** The large dataset (deterministic; its first 48 rows are the usual users). */
export function makeBigUsers(count: number = BIG_ROW_COUNT): User[] {
  return makeUsers(count)
}
