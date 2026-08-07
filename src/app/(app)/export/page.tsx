import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import ExportForm from "./ExportForm";

export const metadata: Metadata = { title: "Export Records" };

export default async function ExportPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user?.role as string;
  if (role !== "SUPERVISOR" && role !== "ADMIN") redirect("/");

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Export Compliance Records</h1>
          <p className="page-desc">Generate PDF or Excel sheets for audits or food safety inspections</p>
        </div>
      </div>

      <div className="card">
        <ExportForm />
      </div>
    </div>
  );
}
