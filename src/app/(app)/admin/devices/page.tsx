import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import DeviceConfigForm from "./DeviceConfigForm";

export const metadata: Metadata = { title: "Devices & Thresholds" };

export default async function DevicesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/");

  const devices = await prisma.device.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Devices & Temp Thresholds</h1>
          <p className="page-desc">Manage temperature limits and add devices</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "start" }}>
        <DeviceConfigForm />

        <div className="card">
          <div className="card-header">
            <div className="card-title">Registered Devices</div>
            <div className="card-sub">{devices.length} devices</div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Type</th>
                  <th>Safe Range</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                    <td style={{ fontSize: 12 }}>{d.type.replace("_", " ")}</td>
                    <td style={{ fontWeight: 600 }}>
                      {d.minTemp}°C to {d.maxTemp}°C
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
