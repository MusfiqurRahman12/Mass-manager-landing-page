import { LogOut, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useAuth, useTheme } from "../../context";
import { Button, NotificationBell } from "../common";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            onClick={() => onMenuClick ? onMenuClick() : setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Internal Mobile Menu (rendered only when no onMenuClick is provided) */}
      {!onMenuClick && isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 absolute top-16 left-0 right-0 shadow-lg">
          <div className="flex flex-col p-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
                >
                  Dashboard
                </Link>
                {user.role === "manager" && (
                  <Link
                    to="/members"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
                  >
                    Members
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-start">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
