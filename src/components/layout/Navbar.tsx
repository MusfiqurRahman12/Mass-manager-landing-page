import { LogOut, Menu } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, useTheme } from "../../context";
import { Button, NotificationBell } from "../common";

export function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <nav className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40 shadow-sm">
      <div className="container-max flex items-center justify-between h-16 md:h-20">
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
              <Link
                to="/chat"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200"
              >
                Chat
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

              <button className="relative p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200">
                <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
              </button>

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
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileOpen && user && (
        <div className="md:hidden px-4 py-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
          <Link
            to="/dashboard"
            className="block py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
          >
            Dashboard
          </Link>
          <Link
            to="/chat"
            className="block py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
          >
            Chat
          </Link>
          {user.role === "manager" && (
            <Link
              to="/members"
              className="block py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
            >
              Members
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
