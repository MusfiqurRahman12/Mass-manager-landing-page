import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Home,
  PiggyBank,
  Receipt,
  Settings,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { cn } from "../../utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  managerOnly?: boolean;
}

// Sidebar order: Dashboard, Meals, Deposits, Expenses (group), Reports, Month History, Settings
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
    label: "Deposits",
    icon: <PiggyBank className="w-5 h-5" />,
    path: "/deposits",
  },
  // Expense group is rendered separately below
  {
    label: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    path: "/reports",
  },
  {
    label: "Month History",
    icon: <Calendar className="w-5 h-5" />,
    path: "/month-history",
  },
  {
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    path: "/settings",
  },
];

const expenseNavGroup = {
  label: "Expenses",
  icon: <Receipt className="w-5 h-5" />,
  children: [
    {
      label: "Summary",
      icon: <BarChart3 className="w-4 h-4" />,
      path: "/expense-summary",
      managerOnly: true,
    },
    {
      label: "Meal Expenses",
      icon: <UtensilsCrossed className="w-4 h-4" />,
      path: "/meal-expenses",
    },
    {
      label: "Home Rent",
      icon: <Home className="w-4 h-4" />,
      path: "/home-rent",
      managerOnly: true,
    },
    {
      label: "Utilities",
      icon: <Zap className="w-4 h-4" />,
      path: "/utility-expenses",
      managerOnly: true,
    },
  ],
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [expenseGroupOpen, setExpenseGroupOpen] = useState(false);

  // Open expense group if any child route is active
  React.useEffect(() => {
    const isExpenseRoute = expenseNavGroup.children.some(
      (child) => location.pathname === child.path,
    );
    if (isExpenseRoute) {
      setExpenseGroupOpen(true);
    }
  }, [location.pathname]);

  // Filter expense group children based on role
  const filteredExpenseChildren = expenseNavGroup.children.filter(
    (child) => !child.managerOnly || user?.role === "manager",
  );

  const isExpenseGroupActive = expenseNavGroup.children.some(
    (child) => location.pathname === child.path,
  );

  // Split navItems into before and after Expenses group
  const navBeforeExpenses = navItems.slice(0, 3); // Dashboard, Meals, Deposits
  const navAfterExpenses = navItems.slice(3);     // Reports, Month History, Settings

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium",
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary/20 shadow-sm ring-1 ring-primary/20"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white",
        )}
        onClick={onClose}
      >
        {item.icon}
        <span>{item.label}</span>
        {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200/60 dark:border-neutral-800/60 transition-transform duration-300 z-30 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Before Expenses: Dashboard, Meals, Deposits */}
          {navBeforeExpenses.map(renderNavItem)}

          {/* Expense Module Group */}
          <div className="pt-1">
            <button
              onClick={() => setExpenseGroupOpen(!expenseGroupOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium",
                isExpenseGroupActive
                  ? "bg-primary/5 text-primary dark:bg-primary/10"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white",
              )}
            >
              {expenseNavGroup.icon}
              <span className="flex-1 text-left">{expenseNavGroup.label}</span>
              {expenseGroupOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Expanded Children */}
            {expenseGroupOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {filteredExpenseChildren.map((child) => {
                  const isActive = location.pathname === child.path;
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white",
                      )}
                      onClick={onClose}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                      {isActive && <ChevronRight className="ml-auto w-3 h-3" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* After Expenses: Reports, Month History, Settings */}
          {navAfterExpenses.map(renderNavItem)}
        </nav>
      </aside>
    </>
  );
}
