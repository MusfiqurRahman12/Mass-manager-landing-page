import { LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "../../context";
import { Button, NotificationBell } from "../common";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60 sticky top-0 z-40">
      <div className="container-max flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MessSync
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
              {user.role === "manager" && (
                <Link
                  to="/members"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200"
                >
                  Members
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <>
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                title="Toggle theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              <NotificationBell />

              <button
                onClick={logout}
                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-neutral-600 dark:text-neutral-400 hover:text-error transition-colors" />
              </button>
            </>
          )}

          {!user && (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
