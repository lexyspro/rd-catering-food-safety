import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import { isOverdueToday } from "@/lib/utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user?.role as string;
  const userId = session.user?.id as string;
  const userName = session.user?.name || "User";

  // Compute in-app alerts for sidebar badge
  const [
    flaggedTemps,
    pendingEqCleaning,
    pendingGnCleaning,
    todayEqCleanings,
    todayGnCleanings,
  ] = await Promise.all([
    prisma.temperatureReading.count({ where: { isFlagged: true } }),
    prisma.equipmentCleaningRecord.count({ where: { status: "PENDING" } }),
    prisma.generalCleaningRecord.count({ where: { status: "PENDING" } }),
    prisma.equipmentCleaningRecord.findMany({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      select: { date: true },
    }),
    prisma.generalCleaningRecord.findMany({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      select: { date: true },
    }),
  ]);

  const overdueCleanings =
    (isOverdueToday(todayEqCleanings) ? 1 : 0) +
    (isOverdueToday(todayGnCleanings) ? 1 : 0);

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        userName={userName}
        alerts={{
          flaggedTemps,
          overdueCleanings,
          pendingSupervision: pendingEqCleaning + pendingGnCleaning,
        }}
      />
      <div className="main-content">
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
