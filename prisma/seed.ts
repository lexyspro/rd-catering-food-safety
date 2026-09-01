import { PrismaClient, DeviceType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── Devices with Q3 thresholds ─────────────────────────────────────────
  await prisma.device.upsert({
    where: { id: "device-fridge-1" },
    update: {},
    create: {
      id: "device-fridge-1",
      name: "Main Fridge",
      type: DeviceType.FRIDGE,
      minTemp: 1.6,
      maxTemp: 3.3,
    },
  });

  await prisma.device.upsert({
    where: { id: "device-freezer-1" },
    update: {},
    create: {
      id: "device-freezer-1",
      name: "Main Freezer",
      type: DeviceType.FREEZER,
      minTemp: -50,
      maxTemp: -18,
    },
  });

  await prisma.device.upsert({
    where: { id: "device-hot-1" },
    update: {},
    create: {
      id: "device-hot-1",
      name: "Hot Holding Unit",
      type: DeviceType.HOT_HOLDING,
      minTemp: 60,
      maxTemp: 100,
    },
  });

  // ─── Default Admin account ────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Asiamah.pass123", 12);
  await prisma.user.upsert({
    where: { email: "admin@rdcatering.com" },
    update: {},
    create: {
      name: "Asiamah-Konadu Nana Kwame",
      email: "admin@rdcatering.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  // ─── Default Supervisor account ───────────────────────────────────────────
  const supHash = await bcrypt.hash("supervisor123", 12);
  await prisma.user.upsert({
    where: { email: "supervisor@rdcatering.com" },
    update: {},
    create: {
      name: "Head Supervisor",
      email: "supervisor@rdcatering.com",
      passwordHash: supHash,
      role: Role.SUPERVISOR,
    },
  });

  // ─── Default Staff account ────────────────────────────────────────────────
  const staffHash = await bcrypt.hash("staff123", 12);
  await prisma.user.upsert({
    where: { email: "staff@rdcatering.com" },
    update: {},
    create: {
      name: "Staff Member",
      email: "staff@rdcatering.com",
      passwordHash: staffHash,
      role: Role.STAFF,
    },
  });

  // ─── Default cleaning schedules (daily) ──────────────────────────────────
  const schedules = [
    { id: "sched-kitchen", targetType: "EQUIPMENT" as const, targetName: "Kitchen Equipment", frequencyDays: 1 },
    { id: "sched-prep", targetType: "AREA" as const, targetName: "Prep Area", frequencyDays: 1 },
    { id: "sched-storage", targetType: "AREA" as const, targetName: "Storage Area", frequencyDays: 1 },
    { id: "sched-serving", targetType: "AREA" as const, targetName: "Serving Area", frequencyDays: 1 },
  ];

  for (const s of schedules) {
    await prisma.cleaningSchedule.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  console.log("✅ Seed complete — devices, users, and schedules created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
