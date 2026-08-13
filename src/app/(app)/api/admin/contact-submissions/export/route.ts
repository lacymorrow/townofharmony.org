import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { isAdmin } from "@/server/services/admin-service";
import { listTownContactSubmissionsInRange } from "@/server/services/town-contact-submission-service";

/**
 * GET /api/admin/contact-submissions/export?month=YYYY-MM
 *   or ?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Returns a CSV archive of town contact form submissions in the given
 * window. Admin-gated because the rows contain PII (name/email/phone/message).
 * `end` is exclusive. When `month` is supplied it wins over start/end and
 * covers the calendar UTC month.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const adminStatus = await isAdmin({
    email: session.user.email,
    userId: session.user.id,
  });
  if (!adminStatus) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  let start: Date;
  let end: Date;
  let filenameSuffix: string;

  if (monthParam) {
    const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
    if (!match) {
      return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 });
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: "month is out of range" }, { status: 400 });
    }
    start = new Date(Date.UTC(year, month - 1, 1));
    end = new Date(Date.UTC(year, month, 1));
    filenameSuffix = `${match[1]}-${match[2]}`;
  } else if (startParam && endParam) {
    start = new Date(startParam);
    end = new Date(endParam);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "start and end must be valid ISO dates" }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ error: "end must be after start" }, { status: 400 });
    }
    filenameSuffix = `${startParam}_to_${endParam}`;
  } else {
    // Default: current UTC month.
    const now = new Date();
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const yyyy = start.getUTCFullYear();
    const mm = String(start.getUTCMonth() + 1).padStart(2, "0");
    filenameSuffix = `${yyyy}-${mm}`;
  }

  const submissions = await listTownContactSubmissionsInRange(start, end);
  const csv = buildCsv(submissions);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="town-inquiries-${filenameSuffix}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

interface CsvRow {
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  inquiryType: string;
  inquiryLabel: string;
  message: string;
  attachmentFilename: string | null;
  sendStatus: string;
  sendError: string | null;
  resendMessageId: string | null;
  sentAt: Date | null;
  ip: string | null;
}

const CSV_HEADERS: Array<[keyof CsvRow, string]> = [
  ["createdAt", "Received (UTC)"],
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["inquiryLabel", "Inquiry type"],
  ["inquiryType", "Inquiry code"],
  ["message", "Message"],
  ["attachmentFilename", "Attachment filename"],
  ["sendStatus", "Email status"],
  ["sentAt", "Email sent (UTC)"],
  ["sendError", "Email error"],
  ["resendMessageId", "Resend message id"],
  ["ip", "IP"],
];

function buildCsv(rows: CsvRow[]): string {
  const lines: string[] = [];
  lines.push(CSV_HEADERS.map(([, label]) => escapeCsvCell(label)).join(","));
  for (const row of rows) {
    lines.push(CSV_HEADERS.map(([key]) => escapeCsvCell(formatCell(row[key]))).join(","));
  }
  // Excel opens UTF-8 CSVs correctly when a BOM is present. Town staff open
  // these in Excel; keeping the BOM avoids garbled é/ñ/etc.
  return `﻿${lines.join("\r\n")}\r\n`;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function escapeCsvCell(value: string): string {
  if (value === "") return "";
  // RFC 4180: quote when the value contains ", CR, LF, or ,; double embedded quotes.
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
