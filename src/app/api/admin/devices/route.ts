import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, type, minTemp, maxTemp } = await req.json();

  if (!name || !type || minTemp === undefined || maxTemp === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const device = await prisma.device.create({
    data: {
      name,
      type,
      minTemp: parseFloat(minTemp),
      maxTemp: parseFloat(maxTemp),
    },
  });

  await writeAuditLog({
    recordType: "Device",
    recordId: device.id,
    action: "CREATE",
    userId: session.user.id!,
    newValue: { name, type, minTemp, maxTemp },
  });

  return NextResponse.json({ success: true });
}
