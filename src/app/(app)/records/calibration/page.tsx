import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { CalendarCheck2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import CalibrationForm from "./CalibrationForm";

export const metadata: Metadata = { title: "Calibration Records" };

export default async function CalibrationPage() {
  const session = await auth();
  const role = session?.user?.role as string;

  const [devices, records] = await Promise.all([
    prisma.device.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.calibrationRecord.findMany({
      include: { device: true, calibratedBy: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Device Calibration Records</h1>
          <p className="page-desc">Track and log calibration checks for temperature probes and devices</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24, alignItems: "start" }}>
        <CalibrationForm devices={devices} />

        <div className="card">
          <div className="card-header">
            <div className="card-title">Calibration History</div>
            <div className="card-sub">{records.length} entries</div>
          </div>
          {records.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck2 size={32} />
              <div className="empty-state-title">No calibration logs yet</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Device</th>
                    <th>Calibrated By</th>
                    <th>Next Calibration Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const isOverdue = new Date(r.nextCalibrationDate) < new Date();
                    return (
                      <tr key={r.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                        <td style={{ fontWeight: 500 }}>{r.device.name}</td>
                        <td style={{ fontSize: 12 }}>{r.calibratedBy.name}</td>
                        <td>{formatDate(r.nextCalibrationDate)}</td>
                        <td>
                          <span className={`badge ${isOverdue ? "badge-flagged" : "badge-approved"}`}>
                            {isOverdue ? "Overdue" : "Calibrated"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
