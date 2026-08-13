import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { constructMetadata } from "@/config/metadata";
import { cn } from "@/lib/utils";
import { listTownContactSubmissionsInRange } from "@/server/services/town-contact-submission-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = constructMetadata({
  title: "Town Inquiries",
  description: "Archive of town contact form submissions with monthly CSV export.",
  noIndex: true,
});

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

function currentMonthLabel(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function parseMonth(monthParam: string | undefined): {
  year: number;
  month: number;
  label: string;
} {
  const fallback = currentMonthLabel();
  const raw = monthParam ?? fallback;
  const match = /^(\d{4})-(\d{2})$/.exec(raw);
  if (!match) {
    const [yStr, mStr] = fallback.split("-");
    return { year: Number(yStr), month: Number(mStr), label: fallback };
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    const [fyStr, fmStr] = fallback.split("-");
    return { year: Number(fyStr), month: Number(fmStr), label: fallback };
  }
  return { year, month, label: `${match[1]}-${match[2]}` };
}

function shiftMonth(label: string, delta: number): string {
  const [yStr, mStr] = label.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

export default async function ContactSubmissionsPage({ searchParams }: PageProps) {
  const { month } = await searchParams;
  const { year, month: monthNum, label } = parseMonth(month);
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 1));
  const submissions = await listTownContactSubmissionsInRange(start, end);

  const prevMonth = shiftMonth(label, -1);
  const nextMonth = shiftMonth(label, 1);
  const csvHref = `/api/admin/contact-submissions/export?month=${label}`;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Town Inquiries</h1>
          <p className="text-sm text-muted-foreground">
            Archive of contact form submissions. Fields contain PII — download responsibly.
          </p>
        </div>
        <a href={csvHref} className={cn(buttonVariants({ variant: "default" }))} download>
          Download {label} CSV
        </a>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/admin/contact-submissions?month=${prevMonth}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← {prevMonth}
        </Link>
        <span className="font-medium">{label}</span>
        <Link
          href={`/admin/contact-submissions?month=${nextMonth}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {nextMonth} →
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Received (UTC)</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Attachment</th>
              <th className="px-3 py-2 font-medium">Email status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  No inquiries in this month.
                </td>
              </tr>
            )}
            {submissions.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {row.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-3 py-2">
                  {row.firstName} {row.lastName}
                </td>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">{row.phone ?? "—"}</td>
                <td className="px-3 py-2">{row.inquiryLabel}</td>
                <td className="px-3 py-2">{row.attachmentFilename ?? "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      row.sendStatus === "sent" && "bg-green-100 text-green-800",
                      row.sendStatus === "failed" && "bg-red-100 text-red-800",
                      row.sendStatus === "pending" && "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    {row.sendStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submissions.some((s) => s.message) && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          {submissions.map((row) => (
            <div key={`msg-${row.id}`} className="rounded-lg border p-4">
              <div className="mb-2 text-sm text-muted-foreground">
                {row.createdAt.toISOString().replace("T", " ").slice(0, 19)} — {row.firstName}{" "}
                {row.lastName} &lt;{row.email}&gt; — {row.inquiryLabel}
              </div>
              <p className="whitespace-pre-wrap">{row.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
