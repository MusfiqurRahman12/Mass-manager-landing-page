import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  LoadingSpinner,
  Modal,
  ModalBody,
  ModalFooter,
} from "../components/common";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context";
import { formatCurrency } from "../utils";
import { useActiveMonth, useStartNewMonth } from "../hooks/queries/useMonthQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import { useMealCost } from "../hooks/queries/useMealQueries";
import { useExpenseSummaryByMembers, useDeposits } from "../hooks/queries/useExpenseQueries";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isManager = user?.role === "manager";

  // Start new month modal state
  const [showStartMonthModal, setShowStartMonthModal] = useState(false);
  const [nextMonthDate, setNextMonthDate] = useState("");

  // ── Data Queries ──────────────────────────────────────────────────────────
  const { data: activeMonth, isLoading: monthLoading } = useActiveMonth();
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: mealCost, isLoading: costLoading } = useMealCost();

  // Conditional queries — only fetch when we have a month
  const { data: depositsData, isLoading: depositsLoading } = useDeposits(
    isManager && activeMonth?.id ? { month_id: activeMonth.id } : undefined
  );
  const { data: summaryData, isLoading: summaryLoading } = useExpenseSummaryByMembers(
    !isManager && activeMonth?.id ? activeMonth.id : undefined
  );

  const isLoading =
    monthLoading || membersLoading || costLoading || (isManager ? depositsLoading : summaryLoading);

  const totalDeposits = depositsData?.reduce((sum, d) => sum + d.amount, 0) ?? 0;
  const memberSummary = summaryData?.member_summaries?.[0] ?? null;

  // ── Mutation ──────────────────────────────────────────────────────────────
  const startNewMonthMutation = useStartNewMonth();

  const handleStartNewMonth = async () => {
    if (!nextMonthDate) return;
    await startNewMonthMutation.mutateAsync({ month_year: nextMonthDate });
    setShowStartMonthModal(false);
  };

  const openStartMonthModal = () => {
    if (activeMonth) {
      const currentDate = new Date(activeMonth.month_year);
      currentDate.setMonth(currentDate.getMonth() + 1);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      setNextMonthDate(`${year}-${month}-01`);
    }
    setShowStartMonthModal(true);
  };

  const getMonthName = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </MainLayout>
    );
  }

  const currentMonthName = activeMonth ? getMonthName(activeMonth.month_year) : "No Active Month";

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
              {isManager ? "🎯 You are the mess manager" : "👥 You are a mess member"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="primary" size="lg">{currentMonthName}</Badge>
            {isManager && activeMonth && (
              <Button variant="outline" size="sm" onClick={openStartMonthModal}>
                Start New Month
              </Button>
            )}
          </div>
        </div>

        {/* Month Status Banner */}
        {!activeMonth && (
          <Card className="bg-warning/10 border-warning">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-warning">No Active Month</p>
                <p className="text-sm text-neutral-600">Please start a new month to begin tracking meals and expenses.</p>
              </div>
              {isManager && <Button size="sm" onClick={openStartMonthModal}>Start Now</Button>}
            </div>
          </Card>
        )}

        {/* KPI Cards */}
        {isManager ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">🍽️</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Total Meals</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{mealCost?.total_meal ?? 0}</h3>
                <Badge variant="primary" size="sm" className="bg-primary/10 text-primary border-primary/20">Current Month</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">💸</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Meal Rate</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{formatCurrency(mealCost?.meal_rate ?? 0)}</h3>
                <Badge variant="warning" size="sm" className="bg-warning/10 text-warning border-warning/20">Per Meal</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">💰</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Total Expenses</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{formatCurrency(mealCost?.total_cost ?? 0)}</h3>
                <Badge variant="success" size="sm" className="bg-success/10 text-success border-success/20">Current Month</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">💵</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Total Deposits</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{formatCurrency(totalDeposits)}</h3>
                <Badge variant="success" size="sm" className="bg-success/10 text-success border-success/20">This Month</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">👥</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">Members</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{members.length}</h3>
                <Badge variant="default" size="sm">Active</Badge>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">🍽️</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">My Meals (Est.)</p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 truncate">
                  {mealCost?.meal_rate ? "Rate: " + formatCurrency(mealCost.meal_rate) : "0"}
                </h3>
                <Badge variant="primary" size="sm" className="bg-primary/10 text-primary border-primary/20">Current Month</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">🏠</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">My Rent Share</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{formatCurrency(memberSummary?.home_rent_share ?? 0)}</h3>
                <Badge variant="warning" size="sm" className="bg-warning/10 text-warning border-warning/20">Home Rent</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">⚡</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">My Utility Share</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{formatCurrency(memberSummary?.utility_share ?? 0)}</h3>
                <Badge variant="success" size="sm" className="bg-success/10 text-success border-success/20">Utilities</Badge>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">🧾</div>
              <div className="relative z-10">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">My Total Due Share</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">{formatCurrency(memberSummary?.total_share ?? 0)}</h3>
                <Badge variant="default" size="sm">Rent + Utility</Badge>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Summary */}
          <Card className="lg:col-span-2 border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
            <div className="mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Monthly Summary</h2>
                <Button variant="outline" size="sm" onClick={() => navigate("/reports")} className="hidden sm:flex text-sm">
                  View Full Report
                </Button>
              </div>
            </div>

            {activeMonth ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800 rounded-xl border border-neutral-200/40 dark:border-neutral-700/40">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 font-medium">Opening Balance</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(activeMonth.opening_balance)}</p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800 rounded-xl border border-neutral-200/40 dark:border-neutral-700/40">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 font-medium">Closing Balance</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(activeMonth.closing_balance)}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800/80 divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-neutral-600 dark:text-neutral-400">Total Meals Consumed</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{activeMonth.total_meal}</span>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <span className="text-neutral-600 dark:text-neutral-400">Total Mess Cost</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(activeMonth.total_cost)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <span className="text-neutral-600 dark:text-neutral-400">Current Meal Rate</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(activeMonth.meal_rate)}</span>
                  </div>
                </div>

                <div className="sm:hidden mt-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/reports")}>
                    View Full Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <div className="text-4xl mb-3 opacity-20">📊</div>
                <p>No active month data available</p>
              </div>
            )}
          </Card>

          {/* Quick Actions — Manager only */}
          {isManager && (
            <Card className="border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
              <div className="mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Add Meal", path: "/meals", icon: "🍽️", color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" },
                  { label: "Add Expense", path: "/expense-summary", icon: "💰", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
                  { label: "Add Deposit", path: "/deposits", icon: "💵", color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
                  { label: "View Members", path: "/members", icon: "👥", color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="w-full p-3 text-left rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors font-medium flex items-center gap-4 group border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-transform group-hover:scale-110 ${action.color}`}>
                      {action.icon}
                    </div>
                    <span className="text-neutral-700 dark:text-neutral-200">{action.label}</span>
                    <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Start New Month Modal */}
      <Modal isOpen={showStartMonthModal} onClose={() => setShowStartMonthModal(false)} title="Start New Month">
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
                    <p className="font-medium">{formatCurrency(activeMonth.total_cost)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Meal Rate</p>
                    <p className="font-medium">{formatCurrency(activeMonth.meal_rate)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Closing Balance</p>
                    <p className="font-medium">{formatCurrency(activeMonth.closing_balance)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-warning/10 rounded-lg">
              <p className="text-sm text-warning">
                <strong>Warning:</strong> Starting a new month will close the current month and calculate final settlements. This action cannot be undone.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Month Start Date</label>
              <input
                type="date"
                value={nextMonthDate}
                onChange={(e) => setNextMonthDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">Select the 1st day of the new month</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowStartMonthModal(false)}>Cancel</Button>
          <Button onClick={handleStartNewMonth} isLoading={startNewMonthMutation.isPending}>Start New Month</Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
