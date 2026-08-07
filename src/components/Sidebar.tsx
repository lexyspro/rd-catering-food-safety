"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Truck,
  Wrench,
  Layers,
  Package,
  Thermometer,
  CalendarCheck2,
  Settings,
  Users,
  Download,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

interface SidebarProps {
  role: string;
  userName: string;
  alerts?: {
    flaggedTemps: number;
    overdueCleanings: number;
    pendingSupervision: number;
  };
}

export default function Sidebar({ role, userName, alerts }: SidebarProps) {
  const pathname = usePathname();

  const totalAlerts =
    (alerts?.flaggedTemps ?? 0) +
    (alerts?.overdueCleanings ?? 0) +
    (alerts?.pendingSupervision ?? 0);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
      roles: ["SUPERVISOR", "ADMIN"],
      badge: totalAlerts > 0 ? totalAlerts : undefined,
    },
  ];

  const recordItems: NavItem[] = [
    { href: "/records/suppliers", label: "Suppliers", icon: <Truck size={16} /> },
    { href: "/records/equipment-cleaning", label: "Equipment Cleaning", icon: <Wrench size={16} /> },
    { href: "/records/general-cleaning", label: "General Cleaning", icon: <Layers size={16} /> },
    { href: "/records/ingredients", label: "Ingredients", icon: <Package size={16} /> },
    { href: "/records/temperature", label: "Temperature", icon: <Thermometer size={16} /> },
    { href: "/records/calibration", label: "Calibration", icon: <CalendarCheck2 size={16} /> },
  ];

  const adminItems: NavItem[] = [
    { href: "/admin/users", label: "Manage Users", icon: <Users size={16} />, roles: ["ADMIN"] },
    { href: "/admin/devices", label: "Devices & Thresholds", icon: <Settings size={16} />, roles: ["ADMIN"] },
    { href: "/export", label: "Export Records", icon: <Download size={16} />, roles: ["SUPERVISOR", "ADMIN"] },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const visibleNav = navItems.filter(
    (i) => !i.roles || i.roles.includes(role)
  );

  const visibleAdmin = adminItems.filter(
    (i) => !i.roles || i.roles.includes(role)
  );

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src="/logo.svg"
          alt="RD Catering Logo"
          className="sidebar-logo-img"
          style={{ width: 36, height: 36, objectFit: "contain" }}
        />
        <div>
          <div className="sidebar-logo-text">RD Catering</div>
          <div className="sidebar-logo-sub">Food Safety System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Overview */}
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {item.icon}
            {item.label}
            {item.badge ? (
              <span className="sidebar-link-badge">{item.badge}</span>
            ) : (
              isActive(item.href) && (
                <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
              )
            )}
          </Link>
        ))}

        {/* Record Modules */}
        <div className="sidebar-section-title">Records</div>
        {recordItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {item.icon}
            {item.label}
            {isActive(item.href) && (
              <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
            )}
          </Link>
        ))}

        {/* Admin & Tools */}
        {visibleAdmin.length > 0 && (
          <>
            <div className="sidebar-section-title">Tools</div>
            {visibleAdmin.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.icon}
                {item.label}
                {isActive(item.href) && (
                  <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-primary)",
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </div>
          </div>
        </div>

        <button
          id="btn-logout"
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
