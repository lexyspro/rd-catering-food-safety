import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import CleaningForm from "../equipment-cleaning/CleaningForm";
import SignOffButton from "../equipment-cleaning/SignOffButton";

export const metadata: Metadata = { title: "General Cleaning" };

export default async function GeneralCleaningPage() {
  const session = await auth();
  const role = session?.user?.role as string;
  const userId = session?.user?.id as string;

  const records = await prisma.generalCleaningRecord.findMany({
    include: { cleanedBy: true, supervisedBy: true },
    orderBy: { date: "desc" },
    take: 50,
    ...(role === "STAFF" ? { where: { cleanedById: userId } } : {}),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">General Cleaning</h1>
          <p className="page-desc">Log and review area cleaning records</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24, alignItems: "start" }}>
        <CleaningForm type="general" />

        <div className="card">
          <div className="card-header">
            <div className="card-title">Records</div>
            <div className="card-sub">{records.length} entries</div>
          </div>
          {records.length === 0 ? (
            <div className="empty-state">
              <Layers size={32} />
              <div className="empty-state-title">No records yet</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Area</th>
                    <th>Detergent</th>
                    <th>Cleaned By</th>
                    <th>Status</th>
                    <th>Supervised By</th>
                    {role !== "STAFF" && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                      <td style={{ fontWeight: 500 }}>{r.area}</td>
                      <td style={{ fontSize: 12 }}>{r.detergent}</td>
                      <td style={{ fontSize: 12 }}>{r.cleanedBy.name}</td>
                      <td>
                        <span className={`badge ${r.status === "APPROVED" ? "badge-approved" : "badge-pending"}`}>
                          {r.status === "APPROVED" ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {r.supervisedBy ? (
                          <div>
                            <div>{r.supervisedBy.name}</div>
                            {r.supervisedAt && <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>{formatDateTime(r.supervisedAt)}</div>}
                          </div>
                        ) : "—"}
                      </td>
                      {role !== "STAFF" && (
                        <td>
                          {r.status === "PENDING" && <SignOffButton id={r.id} type="general" />}
                        </td>
                      )}
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
