import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Thermometer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import TemperatureForm from "./TemperatureForm";

export const metadata: Metadata = { title: "Temperature Monitoring" };

export default async function TemperaturePage() {
  const session = await auth();
  const role = session?.user?.role as string;
  const userId = session?.user?.id as string;

  const [devices, readings] = await Promise.all([
    prisma.device.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.temperatureReading.findMany({
      include: { device: true, takenBy: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      ...(role === "STAFF" ? { where: { takenById: userId } } : {}),
    }),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Temperature Monitoring</h1>
          <p className="page-desc">Record daily device temperatures (Fridge, Freezer, Hot Holding)</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24, alignItems: "start" }}>
        <TemperatureForm devices={devices} />

        <div className="card">
          <div className="card-header">
            <div className="card-title">Temperature Readings Log</div>
            <div className="card-sub">{readings.length} entries</div>
          </div>
          {readings.length === 0 ? (
            <div className="empty-state">
              <Thermometer size={32} />
              <div className="empty-state-title">No temperature records yet</div>
              <div className="empty-state-desc">Record a reading using the form</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Device</th>
                    <th>Time</th>
                    <th>Reading (°C)</th>
                    <th>Status</th>
                    <th>Logged By</th>
                    <th>Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r) => (
                    <tr key={r.id} className={r.isFlagged ? "flagged" : ""}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.date)}</td>
                      <td style={{ fontWeight: 500 }}>{r.device.name}</td>
                      <td>{r.time}</td>
                      <td style={{ fontWeight: 700, color: r.isFlagged ? "var(--color-danger)" : "var(--color-success)" }}>
                        {r.tempCelsius}°C
                      </td>
                      <td>
                        <span className={`badge ${r.isFlagged ? "badge-flagged" : "badge-approved"}`}>
                          {r.isFlagged ? "Out of Range" : "Safe Range"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{r.takenBy.name}</td>
                      <td>
                        {r.photoUrl ? (
                          <a href={r.photoUrl} target="_blank" rel="noopener noreferrer">
                            <img src={r.photoUrl} alt="Photo" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
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
