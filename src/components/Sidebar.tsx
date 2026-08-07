"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    { href: "/records/temperature", label: "Temperature Logs", icon: <Thermometer size={16} /> },
    { href: "/records/calibration", label: "Calibration", icon: <CalendarCheck2 size={16} /> },
  ];

  const adminItems: NavItem[] = [
    { href: "/export", label: "Export Data", icon: <Download size={16} />, roles: ["SUPERVISOR", "ADMIN"] },
    { href: "/admin/users", label: "User Management", icon: <Users size={16} />, roles: ["ADMIN"] },
    { href: "/admin/devices", label: "Devices & Thresholds", icon: <Settings size={16} />, roles: ["ADMIN"] },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const visibleNav = navItems.filter(
    (i) => !i.roles || i.roles.includes(role)
  );
  const visibleAdmin = adminItems.filter(
    (i) => !i.roles || i.roles.includes(role)
  );

  return (
    <>
      {/* Unique Branded Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <img
            src="/logo.svg"
            alt="RD Catering Logo"
            className="sidebar-logo-img"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
          <div>
            <div className="sidebar-logo-text" style={{ fontSize: 13 }}>RD Catering</div>
            <div className="sidebar-logo-sub" style={{ fontSize: 9 }}>Food Safety</div>
          </div>
        </div>

        <button
          className={`mobile-hamburger-btn ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          id="btn-mobile-menu"
        >
          <img
            src="/logo.svg"
            alt=""
            style={{ width: 18, height: 18, objectFit: "contain" }}
          />
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
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
          
          {/* Close button inside mobile menu */}
          <button
            className="mobile-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Overview */}
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
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
    </>
  );
}
