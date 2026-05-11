import { format, parseISO } from "date-fns";
import {
  Calculator,
  DollarSign,
  Home,
  Receipt,
  Utensils,
  Zap,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
} from "../components/common";
import { MainLayout } from "../components/layout";
import type {
  Meal,
} from "../services";

import { formatCurrency } from "../utils/format.utils";
import { cn } from "../utils";
import { useExpenseSummaryByMembers, useExpenseSummaryTotals, useMealExpenses } from "../hooks/queries/useExpenseQueries";
import { useMeals } from "../hooks/queries/useMealQueries";

export function ExpenseSummaryPage() {
  const { data: membersSummary, isLoading: membersLoading } = useExpenseSummaryByMembers();
  const { data: totals, isLoading: totalsLoading } = useExpenseSummaryTotals();
  const { data: mealExpenses, isLoading: mealExpensesLoading } = useMealExpenses();
  const { data: meals = [] as Meal[], isLoading: mealsLoading } = useMeals();
  const isLoading = membersLoading || totalsLoading || mealExpensesLoading || mealsLoading;


  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Expense Summary
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Complete breakdown of all expenses by member
            </p>
          </div>
        </div>

        {/* Total Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Meal Expenses
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(totals?.meal_expenses || 0)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Home Rent
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(totals?.home_rent || 0)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Utilities
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(totals?.utilities || 0)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Grand Total
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      formatCurrency(totals?.grand_total || 0)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Meal Rate Info */}
        {!isLoading && mealExpenses && (
          <Card className="border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10">
            <CardHeader className="border-b border-green-200 dark:border-green-900/30 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-bold text-green-800 dark:text-green-300">
                  Meal Rate Information
                </h2>
              </div>
            </CardHeader>
            <CardBody className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-green-100 dark:border-green-900/20 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    Total Grocery
                  </p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">
                    {formatCurrency(mealExpenses.total_meal_expenses)}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-green-100 dark:border-green-900/20 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    Total Meals
                  </p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">
                    {mealExpenses.total_meals}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
                  <p className="text-xs font-bold text-green-100 uppercase tracking-wider mb-1">
                    Final Meal Rate
                  </p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black">
                      {formatCurrency(mealExpenses.meal_rate)}
                    </p>
                    <p className="text-green-100 text-sm font-medium">/ meal</p>
                  </div>
                </div>
              </div>
              {mealExpenses.monthly_meal_cost_set !== null && (
                <div className="mt-6 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800/50">
                  <Calculator className="h-4 w-4" />
                  <p>
                    <span className="font-bold">Note:</span> Monthly meal cost has been manually adjusted to{" "}
                    <span className="font-black underline decoration-green-500/50 underline-offset-4">{formatCurrency(mealExpenses.monthly_meal_cost_set)}</span>
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        )}


        {/* Member-wise Breakdown */}
        {!isLoading && membersSummary && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Member-wise Expense Breakdown
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Member
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Home Rent Share
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Utility Share
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Subtotal
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Total (with meals)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersSummary.member_summaries.map((member) => {
                      const memberMeals = meals
                        .filter((m) => m.member_id === member.member_id)
                        .reduce((sum, m) => sum + m.meal_count, 0);
                      const mealCost = memberMeals * (mealExpenses?.meal_rate || 0);
                      const totalWithMeals = member.total_share + mealCost;

                      return (
                        <tr
                          key={member.member_id}
                          className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <p className="font-bold text-neutral-900 dark:text-white">
                              {member.member_name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {memberMeals} meals recorded
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                              {formatCurrency(member.home_rent_share)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                              {formatCurrency(member.utility_share)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <p className="text-neutral-900 dark:text-white font-bold">
                                {formatCurrency(member.total_share)}
                              </p>
                              <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">Rent + Utils</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <p className="text-xl font-black text-primary">
                                {formatCurrency(totalWithMeals)}
                              </p>
                              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">
                                Inc. {formatCurrency(mealCost)} meals
                              </p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  <tfoot>
                    <tr className="border-t-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                      <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white">
                        Total
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(membersSummary.home_rent_total)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(membersSummary.utilities_total)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(membersSummary.grand_total)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-primary">
                        {formatCurrency(
                          membersSummary.grand_total + (mealExpenses?.total_meal_expenses || 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Home Rent Details */}
        {!isLoading && membersSummary && membersSummary.home_rent_expenses.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Home Rent History
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {membersSummary.home_rent_expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {expense.description}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {format(parseISO(expense.expense_date), "MMMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {formatCurrency(expense.total_amount)}
                        </p>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium capitalize",
                          expense.share_type === "equal" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                          expense.share_type === "percentage" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                          expense.share_type === "manual" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        )}>
                          {expense.share_type}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {expense.member_shares.map((share) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                              {share.member_name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[80px]">
                              {share.member_name}
                            </span>
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">
                            {formatCurrency(share.amount)}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Utility Details */}
        {!isLoading && membersSummary && membersSummary.utility_expenses.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Utility Expenses History
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {membersSummary.utility_expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white capitalize">
                          {expense.utility_type}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {expense.description}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {format(parseISO(expense.expense_date), "MMMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {formatCurrency(expense.total_amount)}
                        </p>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium capitalize",
                          expense.share_type === "equal" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                          expense.share_type === "percentage" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                          expense.share_type === "manual" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          !expense.share_type && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                          {expense.share_type || "equal"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {expense.member_shares.map((share) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xs font-bold text-yellow-600">
                              {share.member_name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[80px]">
                              {share.member_name}
                            </span>
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">
                            {formatCurrency(share.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
