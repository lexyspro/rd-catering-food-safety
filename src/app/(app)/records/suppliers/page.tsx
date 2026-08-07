import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import SupplierForm from "./SupplierForm";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const session = await auth();
  const role = session?.user?.role as string;

  const [suppliers, purchases] = await Promise.all([
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.supplierPurchase.findMany({
      include: { supplier: true, createdBy: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-desc">Supplier directory and purchase log</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24, alignItems: "start" }}>
        {/* Form Panel */}
        <SupplierForm suppliers={suppliers} />

        {/* Records Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Purchase Log</div>
              <div className="card-sub">{purchases.length} recent entries</div>
            </div>
          </div>
          {purchases.length === 0 ? (
            <div className="empty-state">
              <Truck size={32} />
              <div className="empty-state-title">No purchases logged yet</div>
              <div className="empty-state-desc">Use the form on the left to add an entry</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Item</th>
                    <th>Supplier</th>
                    <th>Logged By</th>
                    <th>Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(p.date)}</td>
                      <td>{p.itemPurchased}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.supplier.name}</div>
                        {p.supplier.location && (
                          <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>{p.supplier.location}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{p.createdBy.name}</td>
                      <td>
                        {p.photoUrl ? (
                          <a href={p.photoUrl} target="_blank" rel="noopener noreferrer">
                            <img src={p.photoUrl} alt="Photo" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
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
