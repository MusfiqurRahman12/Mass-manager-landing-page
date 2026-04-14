import {
  BarChart3,
  ChevronRight,
  DollarSign,
  Home,
  MessageSquare,
  PiggyBank,
  Settings,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { cn } from "../../utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  managerOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    path: "/dashboard",
  },
  {
    label: "Meals",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    path: "/meals",
  },
  {
    label: "Expenses",
    icon: <DollarSign className="w-5 h-5" />,
    path: "/expenses",
  },
  {
    label: "Deposits",
    icon: <PiggyBank className="w-5 h-5" />,
    path: "/deposits",
  },
  {
    label: "Members",
    icon: <Users className="w-5 h-5" />,
    path: "/members",
    managerOnly: true,
  },
  { label: "Chat", icon: <MessageSquare className="w-5 h-5" />, path: "/chat" },
  {
    label: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    path: "/reports",
  },
  {
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    path: "/settings",
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => !item.managerOnly || user?.role === "manager",
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-20 bottom-0 w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 z-30 shadow-sm",
        "hidden md:flex flex-col",
      )}
    >
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium",
                isActive
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white",
              )}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
