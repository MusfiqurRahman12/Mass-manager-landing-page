import { Menu, Shield } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

interface AdminNavbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export function AdminNavbar({ onMenuToggle, pageTitle }: AdminNavbarProps) {
  const { adminUser } = useAdminAuth();

  return (
    <header className="admin-navbar">
      <div className="admin-navbar__left">
        <button className="admin-navbar__menu-btn" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </button>
        {pageTitle && <h1 className="admin-navbar__title">{pageTitle}</h1>}
      </div>
      <div className="admin-navbar__right">
        <div className="admin-navbar__badge">
          <Shield className="w-4 h-4" />
          <span>Super Admin</span>
        </div>
        <div className="admin-navbar__avatar">
          {adminUser?.full_name?.[0]?.toUpperCase() ?? "A"}
        </div>
      </div>
    </header>
  );
}
