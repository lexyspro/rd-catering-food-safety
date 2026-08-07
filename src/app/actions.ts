"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isFlaggedTemp } from "@/lib/utils";

// ─── Supplier ─────────────────────────────────────────────────────────────────

const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  location: z.string().optional(),
});

export async function createSupplier(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    contact: formData.get("contact") || undefined,
    location: formData.get("location") || undefined,
  });

  const supplier = await prisma.supplier.create({ data: parsed });
  await writeAuditLog({ recordType: "Supplier", recordId: supplier.id, action: "CREATE", userId: session.user!.id!, newValue: parsed });
  revalidatePath("/records/suppliers");
  return { success: true, id: supplier.id };
}

const purchaseSchema = z.object({
  date: z.string(),
  itemPurchased: z.string().min(1),
  supplierId: z.string().min(1),
  photoUrl: z.string().optional(),
});

export async function createPurchase(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = purchaseSchema.parse({
    date: formData.get("date"),
    itemPurchased: formData.get("itemPurchased"),
    supplierId: formData.get("supplierId"),
    photoUrl: formData.get("photoUrl") || undefined,
  });

  const purchase = await prisma.supplierPurchase.create({
    data: {
      ...parsed,
      date: new Date(parsed.date),
      createdById: session.user!.id!,
    },
  });

  await writeAuditLog({ recordType: "SupplierPurchase", recordId: purchase.id, action: "CREATE", userId: session.user!.id!, newValue: parsed });
  revalidatePath("/records/suppliers");
  return { success: true };
}

// ─── Equipment Cleaning ───────────────────────────────────────────────────────

const eqCleanSchema = z.object({
  date: z.string(),
  equipment: z.string().min(1),
  detergent: z.string().min(1),
  remarks: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function createEquipmentCleaning(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = eqCleanSchema.parse({
    date: formData.get("date"),
    equipment: formData.get("equipment"),
    detergent: formData.get("detergent"),
    remarks: formData.get("remarks") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });

  const record = await prisma.equipmentCleaningRecord.create({
    data: {
      ...parsed,
      date: new Date(parsed.date),
      cleanedById: session.user!.id!,
    },
  });

  await writeAuditLog({ recordType: "EquipmentCleaningRecord", recordId: record.id, action: "CREATE", userId: session.user!.id!, newValue: parsed });
  revalidatePath("/records/equipment-cleaning");
  return { success: true };
}

export async function approveEquipmentCleaning(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");
  const role = session.user?.role as string;
  if (role !== "SUPERVISOR" && role !== "ADMIN") throw new Error("Forbidden");

  const old = await prisma.equipmentCleaningRecord.findUniqueOrThrow({ where: { id } });

  const record = await prisma.equipmentCleaningRecord.update({
    where: { id },
    data: {
      status: "APPROVED",
      supervisedById: session.user!.id!,
      supervisedAt: new Date(),
    },
  });

  await writeAuditLog({
    recordType: "EquipmentCleaningRecord",
    recordId: id,
    action: "APPROVE",
    userId: session.user!.id!,
    oldValue: { status: old.status },
    newValue: { status: "APPROVED", supervisedById: session.user!.id },
  });
  revalidatePath("/records/equipment-cleaning");
  return { success: true };
}

// ─── General Cleaning ──────────────────────────────────────────────────────────

const gnCleanSchema = z.object({
  date: z.string(),
  area: z.string().min(1),
  detergent: z.string().min(1),
  remarks: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function createGeneralCleaning(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = gnCleanSchema.parse({
    date: formData.get("date"),
    area: formData.get("area"),
    detergent: formData.get("detergent"),
    remarks: formData.get("remarks") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });

  const record = await prisma.generalCleaningRecord.create({
    data: {
      ...parsed,
      date: new Date(parsed.date),
      cleanedById: session.user!.id!,
    },
  });

  await writeAuditLog({ recordType: "GeneralCleaningRecord", recordId: record.id, action: "CREATE", userId: session.user!.id!, newValue: parsed });
  revalidatePath("/records/general-cleaning");
  return { success: true };
}

export async function approveGeneralCleaning(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");
  const role = session.user?.role as string;
  if (role !== "SUPERVISOR" && role !== "ADMIN") throw new Error("Forbidden");

  const old = await prisma.generalCleaningRecord.findUniqueOrThrow({ where: { id } });

  await prisma.generalCleaningRecord.update({
    where: { id },
    data: {
      status: "APPROVED",
      supervisedById: session.user!.id!,
      supervisedAt: new Date(),
    },
  });

  await writeAuditLog({
    recordType: "GeneralCleaningRecord",
    recordId: id,
    action: "APPROVE",
    userId: session.user!.id!,
    oldValue: { status: old.status },
    newValue: { status: "APPROVED", supervisedById: session.user!.id },
  });
  revalidatePath("/records/general-cleaning");
  return { success: true };
}

// ─── Ingredients Checklist ────────────────────────────────────────────────────

const ingredientsSchema = z.object({
  date: z.string(),
  ingredient: z.string().min(1),
  expiryDate: z.string().optional(),
  batchNo: z.string().optional(),
  sealingIntegrity: z.enum(["OK", "NOT_OK"]),
  tempReceived: z.string().optional(),
  remarks: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function createIngredient(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = ingredientsSchema.parse({
    date: formData.get("date"),
    ingredient: formData.get("ingredient"),
    expiryDate: formData.get("expiryDate") || undefined,
    batchNo: formData.get("batchNo") || undefined,
    sealingIntegrity: formData.get("sealingIntegrity"),
    tempReceived: formData.get("tempReceived") || undefined,
    remarks: formData.get("remarks") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });

  const record = await prisma.ingredientsChecklist.create({
    data: {
      date: new Date(parsed.date),
      ingredient: parsed.ingredient,
      expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
      batchNo: parsed.batchNo,
      sealingIntegrity: parsed.sealingIntegrity,
      tempReceived: parsed.tempReceived ? parseFloat(parsed.tempReceived) : undefined,
      remarks: parsed.remarks,
      photoUrl: parsed.photoUrl,
      checkedById: session.user!.id!,
    },
  });

  await writeAuditLog({ recordType: "IngredientsChecklist", recordId: record.id, action: "CREATE", userId: session.user!.id!, newValue: parsed });
  revalidatePath("/records/ingredients");
  return { success: true };
}

// ─── Temperature Reading ──────────────────────────────────────────────────────

const tempSchema = z.object({
  date: z.string(),
  deviceId: z.string().min(1),
  time: z.enum(["AM", "PM"]),
  tempCelsius: z.string(),
  remarks: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function createTemperatureReading(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = tempSchema.parse({
    date: formData.get("date"),
    deviceId: formData.get("deviceId"),
    time: formData.get("time"),
    tempCelsius: formData.get("tempCelsius"),
    remarks: formData.get("remarks") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });

  const device = await prisma.device.findUniqueOrThrow({ where: { id: parsed.deviceId } });
  const temp = parseFloat(parsed.tempCelsius);
  const isFlagged = isFlaggedTemp(temp, device.minTemp, device.maxTemp);

  const record = await prisma.temperatureReading.create({
    data: {
      date: new Date(parsed.date),
      deviceId: parsed.deviceId,
      time: parsed.time,
      tempCelsius: temp,
      isFlagged,
      remarks: parsed.remarks,
      photoUrl: parsed.photoUrl,
      takenById: session.user!.id!,
    },
  });

  await writeAuditLog({ recordType: "TemperatureReading", recordId: record.id, action: "CREATE", userId: session.user!.id!, newValue: { ...parsed, isFlagged } });
  revalidatePath("/records/temperature");
  return { success: true, isFlagged };
}

// ─── Calibration Record ───────────────────────────────────────────────────────

const calibSchema = z.object({
  date: z.string(),
  deviceId: z.string().min(1),
  nextCalibrationDate: z.string(),
});

export async function createCalibration(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");

  const parsed = calibSchema.parse({
    date: formData.get("date"),
    deviceId: formData.get("deviceId"),
    nextCalibrationDate: formData.get("nextCalibrationDate"),
  });

  const record = await prisma.calibrationRecord.create({
    data: {
      date: new Date(parsed.date),
      deviceId: parsed.deviceId,
      nextCalibrationDate: new Date(parsed.nextCalibrationDate),
      calibratedById: session.user!.id!,
    },
  });

  await writeAuditLog({ recordType: "CalibrationRecord", recordId: record.id, action: "CREATE", userId: session.user!.id!, newValue: parsed });
  revalidatePath("/records/calibration");
  return { success: true };
}
