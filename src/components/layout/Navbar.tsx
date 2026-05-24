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

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      const id = target.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        // Use auto instead of smooth so it jumps directly, skipping the long 3D scroll animations
        element.scrollIntoView({ behavior: "auto", block: "start" });
        window.history.pushState(null, "", target);
      }
      setIsMobileMenuOpen(false);
    }
  };

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
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/#features"
            onClick={(e) => handleAnchorClick(e, "/#features")}
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
          >
            Features
          </Link>
          <Link
            to="/#about"
            onClick={(e) => handleAnchorClick(e, "/#about")}
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
          >
            How it Works
          </Link>
          <Link
            to="/#pricing"
            onClick={(e) => handleAnchorClick(e, "/#pricing")}
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
          >
            Pricing
          </Link>
          <Link
            to="/#testimonials"
            onClick={(e) => handleAnchorClick(e, "/#testimonials")}
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
          >
            Reviews
          </Link>
          <Link
            to="/#faq"
            onClick={(e) => handleAnchorClick(e, "/#faq")}
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
          >
            FAQ
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
              >
                Dashboard
              </Link>
              {user.role === "manager" && (
                <Link
                  to="/members"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary font-medium transition-colors duration-200 text-sm"
                >
                  Members
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/#pricing" className="hidden md:block" onClick={(e) => handleAnchorClick(e, "/#pricing")}>
            <button className="neon-border-btn px-4 py-1.5 text-sm font-bold text-neutral-900 dark:text-white transition-colors duration-200">
              Subscribe
            </button>
          </Link>

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
            <Link
              to="/#features"
              onClick={(e) => handleAnchorClick(e, "/#features")}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
            >
              Features
            </Link>
            <Link
              to="/#about"
              onClick={(e) => handleAnchorClick(e, "/#about")}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
            >
              How it Works
            </Link>
            <Link
              to="/#pricing"
              onClick={(e) => handleAnchorClick(e, "/#pricing")}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
            >
              Pricing
            </Link>
            <Link
              to="/#testimonials"
              onClick={(e) => handleAnchorClick(e, "/#testimonials")}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
            >
              Reviews
            </Link>
            <Link
              to="/#faq"
              onClick={(e) => handleAnchorClick(e, "/#faq")}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium"
            >
              FAQ
            </Link>
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
