import { prisma } from "@/lib/prisma";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "APPROVE";

export async function writeAuditLog({
  recordType,
  recordId,
  action,
  userId,
  oldValue,
  newValue,
}: {
  recordType: string;
  recordId: string;
  action: AuditAction;
  userId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}) {
  await prisma.auditLog.create({
    data: {
      recordType,
      recordId,
      action,
      userId,
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
    },
  });
}
