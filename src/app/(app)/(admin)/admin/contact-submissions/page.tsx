import type { Metadata } from "next";
import { constructMetadata } from "@/config/metadata";
import { getContactSubmissions } from "@/server/services/contact-submission-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = constructMetadata({
  title: "Contact Submissions",
  description: "View all contact form submissions for public records compliance.",
  noIndex: true,
});

const STATUS_STYLES: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  rejected: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

const FORM_TYPE_LABELS: Record<string, string> = {
  contact: "General",
  town_contact: "Town",
};

export default async function ContactSubmissionsPage() {
  const submissions = await getContactSubmissions(200);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Submissions</h1>
          <p className="text-muted-foreground">
            All form submissions — {submissions.length} records (latest 200)
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Form</th>
                <th className="px-4 py-3 text-left font-medium">Inquiry</th>
                <th className="px-4 py-3 text-left font-medium">Email (partial)</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {FORM_TYPE_LABELS[s.formType] ?? s.formType}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.inquiryType ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {s.submitterEmailPartial ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.rejectionReason ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
