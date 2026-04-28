import { format, parseISO } from "date-fns";
import {
  Calculator,
  DollarSign,
  Home,
  Receipt,
  Utensils,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
} from "../components/common";
import { MainLayout } from "../components/layout";
import type {
  ExpenseSummaryMembersResponse,
  ExpenseSummaryTotalsResponse,
  MealExpensesResponse,
} from "../services";
import { expenseApi } from "../services";
import { formatCurrency } from "../utils/format.utils";
import { cn } from "../utils";

export function ExpenseSummaryPage() {

  // State
  const [membersSummary, setMembersSummary] = useState<ExpenseSummaryMembersResponse | null>(null);
  const [totals, setTotals] = useState<ExpenseSummaryTotalsResponse | null>(null);
  const [mealExpenses, setMealExpenses] = useState<MealExpensesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, totalsData, mealData] = await Promise.all([
        expenseApi.getSummaryByMembers(),
        expenseApi.getSummaryTotals(),
        expenseApi.getMealExpenses(),
      ]);
      setMembersSummary(membersData);
      setTotals(totalsData);
      setMealExpenses(mealData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load expense summary");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Meal Rate Information
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Meal Expenses
                  </p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(mealExpenses.total_meal_expenses)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Meals
                  </p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {mealExpenses.total_meals}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Current Meal Rate
                  </p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(mealExpenses.meal_rate)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    per meal
                  </p>
                </div>
              </div>
              {mealExpenses.monthly_meal_cost_set !== null && (
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="font-medium">Note:</span> Monthly meal cost has been manually set to{" "}
                  <span className="font-semibold">{formatCurrency(mealExpenses.monthly_meal_cost_set)}</span>
                </p>
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

                      const totalWithMeals = member.total_share;

                      return (
                        <tr
                          key={member.member_id}
                          className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        >
                          <td className="py-4 px-4">
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {member.member_name}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-neutral-900 dark:text-white font-medium">
                              {formatCurrency(member.home_rent_share)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-neutral-900 dark:text-white font-medium">
                              {formatCurrency(member.utility_share)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-neutral-900 dark:text-white font-semibold">
                              {formatCurrency(member.total_share)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(totalWithMeals)}
                            </p>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {expense.member_shares.map((share) => (
                        <div
                          key={share.id}
                          className="p-2 rounded bg-neutral-100 dark:bg-neutral-800"
                        >
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {share.member_name}
                          </p>
                          <p className="font-medium text-neutral-900 dark:text-white">
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
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatCurrency(expense.total_amount / expense.member_shares.length)} / member
                        </p>
                      </div>
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
