import {
  BarChart3,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LogOut,
  Package,
  Shield,
  Ticket,
  Users,
  UserSquare2,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
  { label: "Messes", icon: Building2, path: "/admin/messes" },
  { label: "Managers", icon: UserSquare2, path: "/admin/managers" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Tickets", icon: Ticket, path: "/admin/tickets" },
  { label: "Packages", icon: Package, path: "/admin/packages" },
  { label: "Announcements", icon: Bell, path: "/admin/announcements" },
  { label: "Audit Log", icon: ClipboardList, path: "/admin/audit-log" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { adminUser, adminLogout } = useAdminAuth();

  return (
    <aside
      className={`admin-sidebar ${collapsed ? "admin-sidebar--collapsed" : ""}`}
    >
      {/* Logo */}
      <div className="admin-sidebar__logo">
        <div className="admin-sidebar__logo-icon">
          <Shield className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="admin-sidebar__logo-text">
            <span className="admin-sidebar__logo-title">Admin Panel</span>
            <span className="admin-sidebar__logo-sub">Mess Manager</span>
          </div>
        )}
        <button
          className="admin-sidebar__collapse-btn"
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/admin/dashboard" &&
              location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="admin-nav-item__icon" />
              {!collapsed && (
                <span className="admin-nav-item__label">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="admin-nav-item__dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="admin-sidebar__footer">
        {!collapsed && (
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-avatar">
              {adminUser?.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="admin-sidebar__user-info">
              <p className="admin-sidebar__user-name">{adminUser?.full_name}</p>
              <p className="admin-sidebar__user-role">Super Admin</p>
            </div>
          </div>
        )}
        <button
          className="admin-sidebar__logout"
          onClick={adminLogout}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
