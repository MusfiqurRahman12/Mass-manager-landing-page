import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  LoadingSpinner,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../components/common";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context";
import { useRequireAuth } from "../hooks";
import { Member, memberService } from "../services/memberService";
import { MealCost, mealService } from "../services/mealService";
import { Month, monthService } from "../services/monthService";

interface MonthlySummary {
  totalMeals: number;
  totalExpenses: number;
  yourDeposit: number;
  balanceDue: number;
  mealRate: number;
}

export function DashboardPage() {
  const { isReady, user } = useRequireAuth();
  const navigate = useNavigate();
  const [activeMonth, setActiveMonth] = useState<Month | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealCost, setMealCost] = useState<MealCost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);

  // Start new month modal
  const [showStartMonthModal, setShowStartMonthModal] = useState(false);
  const [isStartingMonth, setIsStartingMonth] = useState(false);
  const [nextMonthDate, setNextMonthDate] = useState("");

  useEffect(() => {
    if (isReady && user) {
      setIsManager(user.role === "manager");
      loadDashboardData();
    }
  }, [isReady, user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [monthData, membersData, costData] = await Promise.all([
        monthService.getActiveMonth().catch(() => null),
        memberService.getMembers(),
        mealService.getMealCost().catch(() => null),
      ]);
      setActiveMonth(monthData);
      setMembers(membersData);
      setMealCost(costData);

      // Set default next month date (1st of next month)
      if (monthData) {
        const currentDate = new Date(monthData.month_year);
        currentDate.setMonth(currentDate.getMonth() + 1);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        setNextMonthDate(`${year}-${month}-01`);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewMonth = async () => {
    if (!nextMonthDate) {
      toast.error("Please select a valid date");
      return;
    }

    setIsStartingMonth(true);
    try {
      const newMonth = await monthService.startNewMonth({
        month_year: nextMonthDate,
      });
      toast.success("New month started successfully");
      setActiveMonth(newMonth);
      setShowStartMonthModal(false);
      loadDashboardData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start new month"
      );
    } finally {
      setIsStartingMonth(false);
    }
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isReady || isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </MainLayout>
    );
  }

  const currentMonthName = activeMonth
    ? getMonthName(activeMonth.month_year)
    : "No Active Month";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.full_name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {isManager
                ? "🎯 You are the mess manager"
                : "👥 You are a mess member"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="primary" size="lg">
              {currentMonthName}
            </Badge>
            {isManager && activeMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStartMonthModal(true)}
              >
                Start New Month
              </Button>
            )}
          </div>
        </div>

        {/* Month Status Banner */}
        {!activeMonth && (
          <Card className="bg-warning/10 border-warning">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-warning"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-warning">No Active Month</p>
                <p className="text-sm text-neutral-600">
                  Please start a new month to begin tracking meals and expenses.
                </p>
              </div>
              {isManager && (
                <Button
                  size="sm"
                  onClick={() => setShowStartMonthModal(true)}
                >
                  Start Now
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="text-center p-6">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
              Total Meals
            </p>
            <h3 className="text-3xl font-bold mb-2">
              {mealCost?.total_meal || 0}
            </h3>
            <Badge variant="primary">Current Month</Badge>
          </Card>

          <Card className="text-center p-6">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
              Meal Rate
            </p>
            <h3 className="text-3xl font-bold mb-2">
              {formatCurrency(mealCost?.meal_rate || 0)}
            </h3>
            <Badge variant="warning">Per Meal</Badge>
          </Card>

          <Card className="text-center p-6">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
              Total Expenses
            </p>
            <h3 className="text-3xl font-bold mb-2">
              {formatCurrency(mealCost?.total_cost || 0)}
            </h3>
            <Badge variant="success">Current Month</Badge>
          </Card>

          <Card className="text-center p-6">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
              Members
            </p>
            <h3 className="text-3xl font-bold mb-2">{members.length}</h3>
            <Badge variant="default">Active</Badge>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Summary */}
          <Card className="lg:col-span-2">
            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Monthly Summary</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/reports")}
                >
                  View Full Report
                </Button>
              </div>
            </div>

            {activeMonth ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-500 mb-1">Opening Balance</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(activeMonth.opening_balance)}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-500 mb-1">Closing Balance</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(activeMonth.closing_balance)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-600">Total Meals</span>
                    <span className="font-medium">{activeMonth.total_meal}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-600">Total Cost</span>
                    <span className="font-medium">
                      {formatCurrency(activeMonth.total_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-600">Meal Rate</span>
                    <span className="font-medium">
                      {formatCurrency(activeMonth.meal_rate)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No active month data available</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Add Meal", path: "/meals", icon: "🍽️" },
                { label: "Add Expense", path: "/expenses", icon: "💰" },
                { label: "Add Deposit", path: "/deposits", icon: "💵" },
                { label: "View Members", path: "/members", icon: "👥" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-medium flex items-center gap-3"
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>          </Card>
        </div>
      </div>

      {/* Start New Month Modal */}
      {showStartMonthModal && (
        <Modal onClose={() => setShowStartMonthModal(false)}>
          <ModalHeader>Start New Month</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {activeMonth && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-2">
                  <h4 className="font-medium">Current Month Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Total Meals</p>
                      <p className="font-medium">{activeMonth.total_meal}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Total Cost</p>
                      <p className="font-medium">
                        {formatCurrency(activeMonth.total_cost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Meal Rate</p>
                      <p className="font-medium">
                        {formatCurrency(activeMonth.meal_rate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Closing Balance</p>
                      <p className="font-medium">
                        {formatCurrency(activeMonth.closing_balance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-warning">
                  <strong>Warning:</strong> Starting a new month will close
                  the current month and calculate final settlements. This action
                  cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  New Month Start Date
                </label>
                <input
                  type="date"
                  value={nextMonthDate}
                  onChange={(e) => setNextMonthDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Select the 1st day of the new month
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowStartMonthModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartNewMonth}
              isLoading={isStartingMonth}
            >
              Start New Month
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </MainLayout>
  );
}
