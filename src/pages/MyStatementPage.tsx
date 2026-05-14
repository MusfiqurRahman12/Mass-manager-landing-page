import {
  TrendingDown,
  TrendingUp,
  Utensils,
  Home,
  Zap,
  Wallet,
  CircleDollarSign,
  Calculator,
  FileText,
} from "lucide-react";
import { Card, CardBody, LoadingSpinner, Skeleton } from "../components/common";
import { MainLayout } from "../components/layout";
import { useRequireAuth } from "../hooks";
import { formatCurrency } from "../utils/format.utils";
import { useActiveMonth } from "../hooks/queries/useMonthQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import { useMealExpenses, useExpenseSummaryByMembers, useDeposits } from "../hooks/queries/useExpenseQueries";
import { useMeals } from "../hooks/queries/useMealQueries";

export function MyStatementPage() {
  const { user, isReady } = useRequireAuth();

  const { data: activeMonth, isLoading: monthLoading } = useActiveMonth();
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: mealSummaryData, isLoading: mealExpensesLoading } = useMealExpenses(activeMonth?.id);
  const { data: expenseSummary, isLoading: summaryLoading } = useExpenseSummaryByMembers(activeMonth?.id);
  const { data: meals = [], isLoading: mealsLoading } = useMeals({ month_id: activeMonth?.id });
  const { data: deposits = [], isLoading: depositsLoading } = useDeposits({ month_id: activeMonth?.id });

  const isLoading = monthLoading || membersLoading || mealExpensesLoading || summaryLoading || mealsLoading || depositsLoading;

  const mealRate = mealSummaryData?.meal_rate || 0;

  const memberExpenseSummaries = expenseSummary?.member_summaries || [];

  // Filter only the current manager's own member record
  const myMember = members.find((m) => m.user_id === user?.id);

  const myMeals = myMember
    ? meals.filter((m) => m.member_id === myMember.user_id).reduce((sum, m) => sum + m.meal_count, 0)
    : 0;

  const myDeposits = myMember
    ? deposits.filter((d) => d.member_id === myMember.user_id).reduce((sum, d) => sum + d.amount, 0)
    : 0;

  const myExpSummary = myMember
    ? memberExpenseSummaries.find((s) => s.member_id === myMember.user_id)
    : null;

  const myMealCost = myMeals * mealRate;
  const myRentShare = myExpSummary?.home_rent_share || 0;
  const myUtilityShare = myExpSummary?.utility_share || 0;
  const myTotalExpenses = myMealCost + myRentShare + myUtilityShare;
  const myBalance = myDeposits - myTotalExpenses;

  const currentMonthName = activeMonth
    ? new Date(activeMonth.month_year).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "No Active Month";

  if (!isReady) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading statement..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="xl:ml-[300px] max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Financial Statement</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your personal mess account for {currentMonthName}
            </p>
          </div>
        </div>

        {!activeMonth ? (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-neutral-500">No active month found. Please start a new month from the dashboard.</p>
            </CardBody>
          </Card>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : !myMember ? (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-neutral-500">Your member profile was not found in this mess.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Hero Balance Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-white shadow-lg shadow-primary/20">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-white/80 mb-1">
                  My Statement —&nbsp;
                  <span className="font-bold text-white">{currentMonthName}</span>
                </p>
                <h2 className="text-2xl font-black tracking-tight">{myMember.full_name}</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-black">
                    {formatCurrency(Math.abs(myBalance))}
                  </span>
                  <span
                    className={`mb-1 text-sm font-semibold px-2.5 py-0.5 rounded-full ${myBalance >= 0
                      ? "bg-green-400/20 text-green-100"
                      : "bg-red-400/20 text-red-100"
                      }`}
                  >
                    {myBalance >= 0 ? "✓ Surplus" : "⚠ Due"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/70">Net balance after all deductions</p>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Card className="relative overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60">
                <Utensils className="absolute -right-3 -bottom-3 h-16 w-16 text-orange-500 opacity-5" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Utensils className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Meals
                    </span>
                  </div>
                  <p className="text-xl font-black text-neutral-900 dark:text-white">{myMeals}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{formatCurrency(myMealCost)} cost</p>
                </div>
              </Card>

              <Card className="relative overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60">
                <Home className="absolute -right-3 -bottom-3 h-16 w-16 text-blue-500 opacity-5" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Home className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Rent Share
                    </span>
                  </div>
                  <p className="text-xl font-black text-neutral-900 dark:text-white">{formatCurrency(myRentShare)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">My portion</p>
                </div>
              </Card>

              <Card className="relative overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60">
                <Zap className="absolute -right-3 -bottom-3 h-16 w-16 text-yellow-500 opacity-5" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Zap className="h-3.5 w-3.5 text-yellow-600" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Utilities
                    </span>
                  </div>
                  <p className="text-xl font-black text-neutral-900 dark:text-white">{formatCurrency(myUtilityShare)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">My portion</p>
                </div>
              </Card>
            </div>

            {/* Detailed Financial Summary */}
            <Card className="border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-neutral-900 dark:text-white">My Financial Summary</h3>
                </div>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {/* Meal Cost */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Utensils className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Meal Cost</p>
                      <p className="text-xs text-neutral-400">
                        {myMeals} meals × {formatCurrency(mealRate)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(myMealCost)}</span>
                </div>

                {/* Rent Share */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Home className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Home Rent Share</p>
                      <p className="text-xs text-neutral-400">Equal split</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(myRentShare)}</span>
                </div>

                {/* Utility Share */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Zap className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Utility Share</p>
                      <p className="text-xs text-neutral-400">Equal split</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(myUtilityShare)}</span>
                </div>

                {/* Total Expenses */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50 dark:bg-neutral-800/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700">
                      <CircleDollarSign className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Total Expenses</p>
                  </div>
                  <span className="font-black text-lg text-neutral-900 dark:text-white">
                    {formatCurrency(myTotalExpenses)}
                  </span>
                </div>

                {/* My Deposits */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Wallet className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">My Deposits</p>
                      <p className="text-xs text-neutral-400">Total paid in</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(myDeposits)}</span>
                </div>

                {/* Net Balance */}
                <div
                  className={`flex items-center justify-between px-5 py-4 rounded-b-xl ${myBalance >= 0
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${myBalance >= 0
                        ? "bg-green-200 dark:bg-green-800"
                        : "bg-red-200 dark:bg-red-800"
                        }`}
                    >
                      {myBalance >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-300" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-700 dark:text-red-300" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${myBalance >= 0
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                          }`}
                      >
                        {myBalance >= 0 ? "You have a surplus" : "Amount due"}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {myBalance >= 0
                          ? "Your deposits exceed your expenses"
                          : "Your expenses exceed your deposits"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xl font-black ${myBalance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {formatCurrency(Math.abs(myBalance))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
