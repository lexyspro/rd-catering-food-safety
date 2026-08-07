import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { formatDate } from "@/lib/utils";
import IngredientsForm from "./IngredientsForm";

export const metadata: Metadata = { title: "Ingredients Checklist" };

export default async function IngredientsPage() {
  const session = await auth();
  const role = session?.user?.role as string;
  const userId = session?.user?.id as string;

  const records = await prisma.ingredientsChecklist.findMany({
    include: { checkedBy: true },
    orderBy: { date: "desc" },
    take: 50,
    ...(role === "STAFF" ? { where: { checkedById: userId } } : {}),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ingredients Checklist</h1>
          <p className="page-desc">Goods-received quality and safety log</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24, alignItems: "start" }}>
        <IngredientsForm />

        <div className="card">
          <div className="card-header">
            <div className="card-title">Records</div>
            <div className="card-sub">{records.length} entries</div>
          </div>
          {records.length === 0 ? (
            <div className="empty-state">
              <Package size={32} />
              <div className="empty-state-title">No records yet</div>
              <div className="empty-state-desc">Log goods received using the form</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ingredient</th>
                    <th>Exp. Date</th>
                    <th>Batch No.</th>
                    <th>Sealing</th>
                    <th>Temp °C</th>
                    <th>Checked By</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                      <td style={{ fontWeight: 500 }}>{r.ingredient}</td>
                      <td style={{ fontSize: 12 }}>{r.expiryDate ? formatDate(r.expiryDate) : "—"}</td>
                      <td style={{ fontSize: 12 }}>{r.batchNo || "—"}</td>
                      <td>
                        <span className={`badge ${r.sealingIntegrity === "OK" ? "badge-approved" : "badge-flagged"}`}>
                          {r.sealingIntegrity === "OK" ? "OK" : "Not OK"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{r.tempReceived != null ? `${r.tempReceived}°C` : "—"}</td>
                      <td style={{ fontSize: 12 }}>{r.checkedBy.name}</td>
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
