const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Day 1..N for a Destination, derived from its date range (inclusive).
// See specs/backend-spec.md > Data Model / Database Schema > Activity.
export function dayCount(startDate: Date, endDate: Date): number {
  return Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
}
