import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import UserForm from "./UserForm";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Manage Users" };

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-desc">Add and manage accounts for Staff, Supervisors, and Admins</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "start" }}>
        <UserForm />

        <div className="card">
          <div className="card-header">
            <div className="card-title">System Accounts</div>
            <div className="card-sub">{users.length} active users</div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "ADMIN" ? "badge-flagged" : u.role === "SUPERVISOR" ? "badge-pending" : "badge-approved"}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
