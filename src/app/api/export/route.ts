import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const role = session.user?.role as string;
  if (role !== "SUPERVISOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const format = searchParams.get("format");

  const dateFilter: any = {};
  if (startDateStr) dateFilter.gte = new Date(startDateStr);
  if (endDateStr) dateFilter.lte = new Date(endDateStr);

  const dateWhere = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

  // For the sake of simplicity, we export Excel worksheets
  if (format === "excel" || format === "pdf") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Compliance Records");

    if (module === "suppliers") {
      sheet.columns = [
        { header: "Date of Purchase", key: "date", width: 15 },
        { header: "Item Purchased", key: "item", width: 25 },
        { header: "Supplier Name", key: "name", width: 20 },
        { header: "Contact", key: "contact", width: 20 },
        { header: "Location", key: "location", width: 20 },
      ];

      const data = await prisma.supplierPurchase.findMany({
        where: dateWhere,
        include: { supplier: true },
        orderBy: { date: "desc" },
      });

      data.forEach((p) => {
        sheet.addRow({
          date: p.date.toISOString().slice(0, 10),
          item: p.itemPurchased,
          name: p.supplier.name,
          contact: p.supplier.contact || "",
          location: p.supplier.location || "",
        });
      });
    } else if (module === "equipment-cleaning") {
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Equipment Cleaned", key: "equipment", width: 25 },
        { header: "Detergent Used", key: "detergent", width: 20 },
        { header: "Cleaned By", key: "cleanedBy", width: 20 },
        { header: "Supervised By", key: "supervisedBy", width: 20 },
        { header: "Remarks", key: "remarks", width: 30 },
      ];

      const data = await prisma.equipmentCleaningRecord.findMany({
        where: dateWhere,
        include: { cleanedBy: true, supervisedBy: true },
        orderBy: { date: "desc" },
      });

      data.forEach((r) => {
        sheet.addRow({
          date: r.date.toISOString().slice(0, 10),
          equipment: r.equipment,
          detergent: r.detergent,
          cleanedBy: r.cleanedBy.name,
          supervisedBy: r.supervisedBy?.name || "",
          remarks: r.remarks || "",
        });
      });
    } else if (module === "general-cleaning") {
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Area Cleaned", key: "area", width: 25 },
        { header: "Detergent Used", key: "detergent", width: 20 },
        { header: "Cleaned By", key: "cleanedBy", width: 20 },
        { header: "Supervised By", key: "supervisedBy", width: 20 },
        { header: "Remarks", key: "remarks", width: 30 },
      ];

      const data = await prisma.generalCleaningRecord.findMany({
        where: dateWhere,
        include: { cleanedBy: true, supervisedBy: true },
        orderBy: { date: "desc" },
      });

      data.forEach((r) => {
        sheet.addRow({
          date: r.date.toISOString().slice(0, 10),
          area: r.area,
          detergent: r.detergent,
          cleanedBy: r.cleanedBy.name,
          supervisedBy: r.supervisedBy?.name || "",
          remarks: r.remarks || "",
        });
      });
    } else if (module === "ingredients") {
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Ingredient", key: "ingredient", width: 25 },
        { header: "Expiry Date", key: "expiry", width: 15 },
        { header: "Batch No", key: "batch", width: 15 },
        { header: "Sealing Integrity", key: "sealing", width: 15 },
        { header: "Temp Received (°C)", key: "temp", width: 20 },
        { header: "Checked By", key: "checkedBy", width: 20 },
        { header: "Remarks", key: "remarks", width: 30 },
      ];

      const data = await prisma.ingredientsChecklist.findMany({
        where: dateWhere,
        include: { checkedBy: true },
        orderBy: { date: "desc" },
      });

      data.forEach((r) => {
        sheet.addRow({
          date: r.date.toISOString().slice(0, 10),
          ingredient: r.ingredient,
          expiry: r.expiryDate ? r.expiryDate.toISOString().slice(0, 10) : "",
          batch: r.batchNo || "",
          sealing: r.sealingIntegrity,
          temp: r.tempReceived != null ? r.tempReceived : "",
          checkedBy: r.checkedBy.name,
          remarks: r.remarks || "",
        });
      });
    } else if (module === "temperature") {
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Device", key: "device", width: 20 },
        { header: "Time", key: "time", width: 10 },
        { header: "Temp Reading (°C)", key: "temp", width: 20 },
        { header: "Flagged?", key: "flagged", width: 15 },
        { header: "Name / Signature", key: "name", width: 20 },
        { header: "Remarks", key: "remarks", width: 30 },
      ];

      const data = await prisma.temperatureReading.findMany({
        where: dateWhere,
        include: { device: true, takenBy: true },
        orderBy: { date: "desc" },
      });

      data.forEach((r) => {
        sheet.addRow({
          date: r.date.toISOString().slice(0, 10),
          device: r.device.name,
          time: r.time,
          temp: r.tempCelsius,
          flagged: r.isFlagged ? "Yes" : "No",
          name: r.takenBy.name,
          remarks: r.remarks || "",
        });
      });
    } else if (module === "calibration") {
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Device Name", key: "device", width: 20 },
        { header: "Calibrated By", key: "calibratedBy", width: 20 },
        { header: "Next Calibration Date", key: "nextDate", width: 20 },
      ];

      const data = await prisma.calibrationRecord.findMany({
        where: dateWhere,
        include: { device: true, calibratedBy: true },
        orderBy: { date: "desc" },
      });

      data.forEach((r) => {
        sheet.addRow({
          date: r.date.toISOString().slice(0, 10),
          device: r.device.name,
          calibratedBy: r.calibratedBy.name,
          nextDate: r.nextCalibrationDate.toISOString().slice(0, 10),
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const ext = format === "excel" ? "xlsx" : "pdf.xlsx";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${module}_export_${Date.now()}.${ext}"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
