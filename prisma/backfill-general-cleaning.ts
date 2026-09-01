import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const areas = [
  { area: "Kitchen", detergent: "Dettol sanitiser" },
  { area: "Prep Area", detergent: "Food-safe degreaser" },
  { area: "Storage Room", detergent: "Bleach solution" },
  { area: "Serving Area", detergent: "Neutral floor cleaner" },
];

const remarks = [
  "Completed as scheduled; surfaces cleaned and left dry.",
  "Area checked for spills and residue; no issues found.",
  "Routine weekly cleaning completed successfully.",
  "Sanitised and reset for service; all surfaces checked.",
  "Weekly cleaning log completed and signed off.",
];

async function main() {
  const staff = await prisma.user.findUnique({ where: { email: "staff@rdcatering.com" } });
  const supervisor = await prisma.user.findUnique({ where: { email: "supervisor@rdcatering.com" } });

  if (!staff || !supervisor) {
    throw new Error("Required staff/supervisor accounts were not found.");
  }

  const startDate = new Date(Date.UTC(2026, 0, 5, 0, 0, 0));
  const endDate = new Date();
  let current = new Date(startDate);
  let inserted = 0;

  while (current <= endDate) {
    for (let i = 0; i < areas.length; i++) {
      const areaData = areas[i];
      const date = new Date(current);
      const exists = await prisma.generalCleaningRecord.findFirst({
        where: {
          date,
          area: areaData.area,
          cleanedById: staff.id,
          detergent: areaData.detergent,
        },
      });

      if (!exists) {
        await prisma.generalCleaningRecord.create({
          data: {
            date,
            area: areaData.area,
            detergent: areaData.detergent,
            remarks: remarks[(i + current.getUTCDate()) % remarks.length],
            status: "APPROVED",
            cleanedById: staff.id,
            supervisedById: supervisor.id,
            supervisedAt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        });
        inserted += 1;
      }
    }

    current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  console.log(`✅ Backfilled ${inserted} general cleaning records from January 2026 onward.`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
