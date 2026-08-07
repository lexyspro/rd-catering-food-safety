import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Safety check: Requirement doc specifies a maximum of three users
  const userCount = await prisma.user.count();
  if (userCount >= 3) {
    return NextResponse.json(
      { error: "Limit Reached: System is configured to support a maximum of three users." },
      { status: 400 }
    );
  }

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  await writeAuditLog({
    recordType: "User",
    recordId: user.id,
    action: "CREATE",
    userId: session.user.id!,
    newValue: { name, email, role },
  });

  return NextResponse.json({ success: true });
}
