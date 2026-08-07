import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Wrench,
  CalendarClock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user?.role as string;
  if (role !== "SUPERVISOR" && role !== "ADMIN") redirect("/records/equipment-cleaning");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    flaggedTemps,
    pendingEq,
    pendingGn,
    todayEq,
    todayGn,
    todayTempAM,
    todayTempPM,
    calibrationsDue,
    recentReadings,
    recentFlagged,
  ] = await Promise.all([
    prisma.temperatureReading.count({ where: { isFlagged: true } }),
    prisma.equipmentCleaningRecord.count({ where: { status: "PENDING" } }),
    prisma.generalCleaningRecord.count({ where: { status: "PENDING" } }),
    prisma.equipmentCleaningRecord.findMany({ where: { date: { gte: today } }, select: { date: true } }),
    prisma.generalCleaningRecord.findMany({ where: { date: { gte: today } }, select: { date: true } }),
    prisma.temperatureReading.findFirst({ where: { date: { gte: today }, time: "AM" } }),
    prisma.temperatureReading.findFirst({ where: { date: { gte: today }, time: "PM" } }),
    prisma.calibrationRecord.findMany({
      where: { nextCalibrationDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      include: { device: true },
      orderBy: { nextCalibrationDate: "asc" },
      take: 5,
    }),
    prisma.temperatureReading.findMany({
      include: { device: true, takenBy: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.temperatureReading.findMany({
      where: { isFlagged: true },
      include: { device: true, takenBy: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const eqOverdue = todayEq.length === 0;
  const gnOverdue = todayGn.length === 0;
  const amMissing = !todayTempAM;
  const pmMissing = !todayTempPM;
  const pendingSupervision = pendingEq + pendingGn;

  const alerts: { text: string; type: "danger" | "warning" | "info" }[] = [];
  if (flaggedTemps > 0) alerts.push({ text: `${flaggedTemps} temperature reading${flaggedTemps > 1 ? "s" : ""} outside safe range`, type: "danger" });
  if (eqOverdue) alerts.push({ text: "Equipment cleaning not logged today", type: "warning" });
  if (gnOverdue) alerts.push({ text: "General area cleaning not logged today", type: "warning" });
  if (amMissing) alerts.push({ text: "AM temperature check not recorded yet", type: "warning" });
  if (pmMissing) alerts.push({ text: "PM temperature check not recorded yet", type: "info" });
  if (pendingSupervision > 0) alerts.push({ text: `${pendingSupervision} cleaning record${pendingSupervision > 1 ? "s" : ""} awaiting supervision`, type: "info" });
  if (calibrationsDue.length > 0) alerts.push({ text: `${calibrationsDue.length} device calibration${calibrationsDue.length > 1 ? "s" : ""} due this week`, type: "warning" });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-desc">Overview for {formatDate(new Date())}</p>
        </div>
        <Link href="/export" className="btn btn-ghost btn-sm">
          <TrendingUp size={14} />
          Export Records
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className={`stat-card ${flaggedTemps > 0 ? "danger" : ""}`}>
          <div className={`stat-icon ${flaggedTemps > 0 ? "danger" : "success"}`}>
            <Thermometer size={18} />
          </div>
          <div className="stat-value" style={{ color: flaggedTemps > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
            {flaggedTemps}
          </div>
          <div className="stat-label">Flagged Readings</div>
        </div>

        <div className={`stat-card ${pendingSupervision > 0 ? "warning" : ""}`}>
          <div className={`stat-icon ${pendingSupervision > 0 ? "warning" : "success"}`}>
            <Clock size={18} />
          </div>
          <div className="stat-value" style={{ color: pendingSupervision > 0 ? "var(--color-warning)" : "var(--color-success)" }}>
            {pendingSupervision}
          </div>
          <div className="stat-label">Pending Sign-off</div>
        </div>

        <div className={`stat-card ${eqOverdue || gnOverdue ? "warning" : "success"}`}>
          <div className={`stat-icon ${eqOverdue || gnOverdue ? "warning" : "success"}`}>
            <Wrench size={18} />
          </div>
          <div className="stat-value" style={{ color: eqOverdue || gnOverdue ? "var(--color-warning)" : "var(--color-success)" }}>
            {(eqOverdue ? 0 : 1) + (gnOverdue ? 0 : 1)}/2
          </div>
          <div className="stat-label">Today's Cleanings Done</div>
        </div>

        <div className={`stat-card ${calibrationsDue.length > 0 ? "warning" : ""}`}>
          <div className={`stat-icon ${calibrationsDue.length > 0 ? "warning" : "success"}`}>
            <CalendarClock size={18} />
          </div>
          <div className="stat-value" style={{ color: calibrationsDue.length > 0 ? "var(--color-warning)" : "var(--color-success)" }}>
            {calibrationsDue.length}
          </div>
          <div className="stat-label">Calibrations Due</div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Active Alerts</div>
              <div className="card-sub">{alerts.length} item{alerts.length > 1 ? "s" : ""} requiring attention</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: "var(--radius-md)",
                  background: a.type === "danger"
                    ? "var(--color-danger-glow)"
                    : a.type === "warning"
                    ? "var(--color-warning-glow)"
                    : "var(--color-primary-glow)",
                  border: `1px solid ${
                    a.type === "danger"
                      ? "var(--color-danger-dim)"
                      : a.type === "warning"
                      ? "var(--color-warning-dim)"
                      : "var(--color-primary-dim)"
                  }`,
                }}
              >
                <AlertTriangle
                  size={15}
                  style={{
                    color: a.type === "danger"
                      ? "var(--color-danger)"
                      : a.type === "warning"
                      ? "var(--color-warning)"
                      : "var(--color-primary)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderColor: "var(--color-success-dim)",
            background: "var(--color-success-glow)",
          }}
        >
          <CheckCircle2 size={22} style={{ color: "var(--color-success)" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>All systems compliant</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
              No active alerts — great work keeping records up to date!
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Temperature Readings */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Temperature Readings</div>
              <div className="card-sub">Latest 6 entries</div>
            </div>
            <Link href="/records/temperature" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentReadings.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <Thermometer size={28} />
              <div className="empty-state-title">No readings yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentReadings.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.device.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>
                      {r.time} · {formatDate(r.date)} · {r.takenBy.name}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: r.isFlagged ? "var(--color-danger)" : "var(--color-success)" }}>
                      {r.tempCelsius}°C
                    </span>
                    {r.isFlagged && <span className="badge badge-flagged">Flagged</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calibrations Due */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Calibrations Due</div>
              <div className="card-sub">Within the next 7 days</div>
            </div>
            <Link href="/records/calibration" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {calibrationsDue.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <CalendarClock size={28} />
              <div className="empty-state-title">No calibrations due</div>
              <div className="empty-state-desc">All devices are calibrated</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {calibrationsDue.map((c) => {
                const isPast = new Date(c.nextCalibrationDate) < new Date();
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.device.name}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>
                        {c.device.type.replace("_", " ")}
                      </div>
                    </div>
                    <span className={`badge ${isPast ? "badge-flagged" : "badge-pending"}`}>
                      {isPast ? "Overdue" : `Due ${formatDate(c.nextCalibrationDate)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
