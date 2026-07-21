/**
 * Date-only helpers for Builder content with mixed date formats.
 *
 * Builder entries hold dates (eventDate, meetingDate) in mixed formats —
 * ISO ("2026-07-24T08:00:00") and JS toString
 * ("Sat Jul 04 2026 06:00:00 GMT-0400 (…)"). Naive `split("T")[0]`
 * classification breaks on toString values (splits at "GMT"), so always
 * normalize through toDateOnly() before comparing.
 */

export const safeDate = (dateStr: unknown): Date | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Dates on or after today count as upcoming. Comparison is date-string
 * only so a date-only value parsed as UTC midnight is never shifted into
 * yesterday by the viewer's timezone; "today" comes from local date parts
 * for the same reason.
 */
export const getTodayString = (): string => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const MONTH_ABBREVIATIONS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/**
 * Normalize a mixed-format date value to "YYYY-MM-DD", or null when
 * unparseable. Takes the ISO date prefix verbatim when present (no UTC
 * shift for date-only values); otherwise parses and uses local date parts.
 */
export const toDateOnly = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const isoMatch = /^\d{4}-\d{2}-\d{2}/.exec(value);
  if (isoMatch) return isoMatch[0];
  // "Sat Jul 04 2026 06:00:00 GMT-0400 (…)" — read the parts as written so
  // the viewer's timezone never shifts the authored date.
  const toStringMatch = /^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})/.exec(value);
  if (toStringMatch) {
    const [, monthName = "", day = "", year = ""] = toStringMatch;
    const month = MONTH_ABBREVIATIONS[monthName];
    if (month) return `${year}-${month}-${day.padStart(2, "0")}`;
  }
  const d = safeDate(value);
  if (!d) return null;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};
