import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user?.role as string;
  if (role === "ADMIN" || role === "SUPERVISOR") redirect("/dashboard");
  redirect("/records/equipment-cleaning");
}
