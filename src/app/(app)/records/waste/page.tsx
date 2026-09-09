import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import WasteForm from "./WasteForm";

export const metadata: Metadata = { title: "Waste Management Records" };

export default async function WasteRecordsPage() {
  const session = await auth();
  const role = session?.user?.role as string;
  const userId = session?.user?.id as string;

  const records = await prisma.wasteRecord.findMany({
    include: { createdBy: true },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
    take: 50,
    ...(role === "STAFF" ? { where: { createdById: userId } } : {}),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Waste Management Records</h1>
          <p className="page-desc">
            Record and monitor waste collection dates, times, disposal companies, and transfer note numbers
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24, alignItems: "start" }}>
        <WasteForm />

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Waste Collection History</div>
              <div className="card-sub">{records.length} entries recorded</div>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              <Trash2 size={32} />
              <div className="empty-state-title">No waste records logged yet</div>
              <div className="empty-state-desc">Use the form to log waste collections, contractor details, and note numbers.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day / Date</th>
                    <th>Time</th>
                    <th>Company</th>
                    <th>Number / Ref</th>
                    <th>Waste Type</th>
                    <th>Logged By</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                        {formatDate(r.date)}
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--color-text-muted)" }}>
                        {r.time}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {r.company}
                        {r.remarks && (
                          <div style={{ fontSize: 11, color: "var(--color-text-dim)", fontWeight: 400, marginTop: 2 }}>
                            {r.remarks}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--color-surface-3)",
                            border: "1px solid var(--color-border)",
                            display: "inline-block",
                          }}
                        >
                          {r.number}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {r.wasteType ? (
                          <span className="badge badge-approved" style={{ fontSize: 11 }}>
                            {r.wasteType}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{r.createdBy.name}</td>
                      <td>
                        {r.photoUrl ? (
                          <a
                            href={r.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px 8px", fontSize: 11, gap: 4 }}
                            title="View transfer note / photo"
                          >
                            <ImageIcon size={13} style={{ color: "var(--color-primary)" }} />
                            View
                          </a>
                        ) : (
                          <span style={{ color: "var(--color-text-dim)", fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
