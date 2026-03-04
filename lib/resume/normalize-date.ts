import { parse, isValid, format } from "date-fns";

const FORMATS = [
  "MMMM yyyy",   // January 2022
  "MMM yyyy",    // Jan 2022
  "MM/yyyy",     // 01/2022
  "yyyy-MM",     // 2022-01
  "MM/dd/yyyy",  // 01/15/2022
  "yyyy",        // 2022
];

/**
 * Attempt to parse a free-text date string into ISO "yyyy-MM-dd".
 * Returns null if unparseable.
 */
export function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^(present|current|now|ongoing)$/i.test(trimmed)) return null;

  for (const fmt of FORMATS) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) {
      return format(parsed, "yyyy-MM-dd");
    }
  }
  // Last resort: native Date
  const d = new Date(trimmed);
  if (isValid(d) && !isNaN(d.getTime())) {
    return format(d, "yyyy-MM-dd");
  }
  return null;
}
