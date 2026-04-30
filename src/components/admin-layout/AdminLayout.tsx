import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`admin-layout ${collapsed ? "admin-layout--collapsed" : ""}`}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="admin-layout__backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <div className="admin-layout__main">
        <AdminNavbar
          onMenuToggle={() => setMobileOpen((o) => !o)}
          pageTitle={pageTitle}
        />
        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}
