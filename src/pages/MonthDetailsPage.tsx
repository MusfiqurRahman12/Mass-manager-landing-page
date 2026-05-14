import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge, Button, Card, LoadingSpinner } from "../components/common";
import { MainLayout } from "../components/layout";
import { useRequireAuth } from "../hooks";
import { pdfService } from "../services/pdfService";
import { type Member } from "../services/memberService";
import { formatCurrency } from "../utils/format.utils";
import {
  TrendingDown, TrendingUp, Utensils, Home, Zap,
  Wallet, CircleDollarSign, Calculator, CalendarDays,
} from "lucide-react";

import { useMonthDetails } from "../hooks/queries/useMonthQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import { useMealExpenses, useExpenseSummaryByMembers, useDeposits } from "../hooks/queries/useExpenseQueries";
import { useMeals } from "../hooks/queries/useMealQueries";
interface MemberSummary {
  member: Member;
  totalMeals: number;
  mealCost: number;
  homeRentShare: number;
  utilityShare: number;
  totalDeposits: number;
  balance: number;
}


interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export function MonthDetailsPage() {
  const { user, isReady } = useRequireAuth();
  const isManager = user?.role === "manager";
  const navigate = useNavigate();
  const { monthId } = useParams<{ monthId: string }>();
  const { data: month, isLoading: monthLoading } = useMonthDetails(monthId!);
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: meals = [], isLoading: mealsLoading } = useMeals({ month_id: monthId });
  const { data: mealSummaryData, isLoading: mealExpensesLoading } = useMealExpenses(monthId);
  const { data: expenseSummary, isLoading: summaryLoading } = useExpenseSummaryByMembers(monthId);
  const { data: deposits = [], isLoading: depositsLoading } = useDeposits({ month_id: monthId });

  const mealSummary = mealSummaryData ? {
    total_meal_expenses: mealSummaryData.total_meal_expenses,
    total_meals: mealSummaryData.total_meals,
    meal_rate: mealSummaryData.meal_rate
  } : null;

  const mealExpenses = mealSummaryData?.expenses || [];
  const rentExpenses = expenseSummary?.home_rent_expenses || [];
  const utilityExpenses = expenseSummary?.utility_expenses || [];
  const memberExpenseSummaries = expenseSummary?.member_summaries || [];

  const isLoading = monthLoading || membersLoading || mealsLoading || mealExpensesLoading || summaryLoading || depositsLoading;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);



  const getMemberMeals = (memberId: string) => {
    return meals
      .filter((m) => m.member_id === memberId)
      .reduce((sum, m) => sum + m.meal_count, 0);
  };

  const getMemberDeposits = (memberId: string) => {
    return deposits
      .filter((d) => d.member_id === memberId)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const displayedMembers = isManager ? members : members.filter(m => m.user_id === user?.id);

  const memberSummaries: MemberSummary[] = displayedMembers.map((member) => {
    const totalMeals = getMemberMeals(member.user_id);
    const mealCost = totalMeals * (mealSummary?.meal_rate || 0);
    const totalDeposits = getMemberDeposits(member.user_id);
    
    const expSummary = memberExpenseSummaries.find(s => s.member_id === member.user_id);
    const homeRentShare = expSummary?.home_rent_share || 0;
    const utilityShare = expSummary?.utility_share || 0;

    return {
      member,
      totalMeals,
      mealCost,
      homeRentShare,
      utilityShare,
      totalDeposits,
      balance: totalDeposits - (mealCost + homeRentShare + utilityShare),
    };
  });


  const totalMealCost = memberSummaries.reduce((sum, m) => sum + m.mealCost, 0);
  const totalDepositsSum = deposits.reduce((sum, d) => sum + d.amount, 0);


  const totalExpenses = (mealSummary?.total_meal_expenses || 0) + 
                        rentExpenses.reduce((sum, e) => sum + e.total_amount, 0) + 
                        utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0);

  const expensesByCategory: ExpenseByCategory[] = [
    { category: "Meals", amount: mealSummary?.total_meal_expenses || 0, percentage: totalExpenses > 0 ? ((mealSummary?.total_meal_expenses || 0) / totalExpenses) * 100 : 0 },
    { category: "Home Rent", amount: rentExpenses.reduce((sum, e) => sum + e.total_amount, 0), percentage: totalExpenses > 0 ? (rentExpenses.reduce((sum, e) => sum + e.total_amount, 0) / totalExpenses) * 100 : 0 },
    { category: "Utilities", amount: utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0), percentage: totalExpenses > 0 ? (utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0) / totalExpenses) * 100 : 0 },
  ].sort((a, b) => b.amount - a.amount);


  const handleDownloadPDF = async () => {
    if (!month || !monthId) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await pdfService.downloadMonthPDF(monthId);
      const monthName = new Date(month.month_year).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" },
      );
      pdfService.triggerDownload(blob, `mess_statement_${monthName}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      electricity: "Electricity",
      gas: "Gas",
      water: "Water",
      rent: "Rent",
      groceries: "Groceries",
      misc: "Miscellaneous",
      salary: "Salary",
      maintenance: "Maintenance",
    };
    return labels[category] || category;
  };

  if (!isReady || isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading month details..." />
      </MainLayout>
    );
  }

  if (!month) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-neutral-500 mb-4">Month not found</p>
          <Button onClick={() => navigate("/month-history")}>
            Back to Month History
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {getMonthName(month.month_year)}
              </h1>
              {month.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="default">Closed</Badge>
              )}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Monthly statement and financial overview
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/month-history")}
            >
              Back to History
            </Button>
            <Button
              onClick={handleDownloadPDF}
              isLoading={isGeneratingPDF}
              variant="outline"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60 hover:shadow-md transition-shadow">
            <Utensils className="absolute -right-4 -bottom-4 h-24 w-24 text-primary opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110" />
            <div className="p-6 relative z-10">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">Total Meals</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{month.total_meal}</p>
            </div>
          </Card>
          <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60 hover:shadow-md transition-shadow">
            <CalendarDays className="absolute -right-4 -bottom-4 h-24 w-24 text-purple-600 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110" />
            <div className="p-6 relative z-10">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">Meal Rate</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(month.meal_rate)}</p>
            </div>
          </Card>
          {isManager && (
            <>
              <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60 hover:shadow-md transition-shadow">
                <Utensils className="absolute -right-4 -bottom-4 h-24 w-24 text-green-600 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110" />
                <div className="p-6 relative z-10">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">Total Meal Cost</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCurrency(month.total_cost)}</p>
                </div>
              </Card>
              <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60 hover:shadow-md transition-shadow">
                <CircleDollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-orange-600 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110" />
                <div className="p-6 relative z-10">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">Closing Balance</p>
                  <p className={`text-2xl font-bold ${month.closing_balance >= 0 ? "text-success" : "text-error"}`}>
                    {formatCurrency(month.closing_balance)}
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Member Summary — manager sees full table, member sees personal statement */}
        {isManager ? (
          <Card className="overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Member Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-neutral-500">
                    Member
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">
                    Meals
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">
                    Meal Cost
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">
                    Rent
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">
                    Utils
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">
                    Deposits
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-500">
                    Balance
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {memberSummaries.map((summary) => (
                  <tr
                    key={summary.member.user_id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {summary.member.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {summary.member.full_name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {summary.member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {summary.totalMeals}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(summary.mealCost)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(summary.homeRentShare)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(summary.utilityShare)}
                    </td>
                    <td className="px-6 py-4 text-right text-success">
                      {formatCurrency(summary.totalDeposits)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${
                        summary.balance >= 0 ? "text-success" : "text-error"
                      }`}
                    >
                      {formatCurrency(summary.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {isManager && (
              <tfoot className="bg-neutral-50 dark:bg-neutral-800 font-medium">
                <tr>
                  <td className="px-6 py-4">Total</td>
                  <td className="px-6 py-4 text-right">{month.total_meal}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totalMealCost)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(rentExpenses.reduce((sum, e) => sum + e.total_amount, 0))}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0))}</td>
                  <td className="px-6 py-4 text-right text-success">{formatCurrency(totalDepositsSum)}</td>
                  <td className={`px-6 py-4 text-right ${totalDepositsSum - totalExpenses >= 0 ? "text-success" : "text-error"}`}>
                    {formatCurrency(totalDepositsSum - totalExpenses)}
                  </td>
                </tr>
              </tfoot>
              )}

            </table>
          </div>
        </Card>
        ) : (
          /* Member Personal Statement */
          memberSummaries[0] && (
            <div className="space-y-4">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-white shadow-lg shadow-primary/20">
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
                <div className="relative z-10">
                  <p className="text-sm font-medium text-white/80 mb-1">My Statement &mdash;&nbsp;<span className="font-bold">{getMonthName(month.month_year)}</span></p>
                  <h2 className="text-2xl font-black tracking-tight">{memberSummaries[0].member.full_name}</h2>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-black">{formatCurrency(Math.abs(memberSummaries[0].balance))}</span>
                    <span className={`mb-1 text-sm font-semibold px-2.5 py-0.5 rounded-full ${memberSummaries[0].balance >= 0 ? "bg-green-400/20 text-green-100" : "bg-red-400/20 text-red-100"}`}>
                      {memberSummaries[0].balance >= 0 ? "✓ Surplus" : "⚠ Due"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/70">Net balance after all deductions</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card className="relative overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60">
                  <Utensils className="absolute -right-3 -bottom-3 h-16 w-16 text-orange-500 opacity-5" />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Utensils className="h-3.5 w-3.5 text-orange-600" /></div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Meals</span>
                    </div>
                    <p className="text-xl font-black text-neutral-900 dark:text-white">{memberSummaries[0].totalMeals}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatCurrency(memberSummaries[0].mealCost)} cost</p>
                  </div>
                </Card>
                <Card className="relative overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60">
                  <Home className="absolute -right-3 -bottom-3 h-16 w-16 text-blue-500 opacity-5" />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Home className="h-3.5 w-3.5 text-blue-600" /></div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Rent Share</span>
                    </div>
                    <p className="text-xl font-black text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].homeRentShare)}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">My portion</p>
                  </div>
                </Card>
                <Card className="relative overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60">
                  <Zap className="absolute -right-3 -bottom-3 h-16 w-16 text-yellow-500 opacity-5" />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30"><Zap className="h-3.5 w-3.5 text-yellow-600" /></div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Utilities</span>
                    </div>
                    <p className="text-xl font-black text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].utilityShare)}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">My portion</p>
                  </div>
                </Card>
              </div>

              {/* Financial Summary Card */}
              <Card className="border border-neutral-200/60 dark:border-neutral-800/60">
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-neutral-900 dark:text-white">My Financial Summary</h3>
                  </div>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Utensils className="h-4 w-4 text-orange-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Meal Cost</p>
                        <p className="text-xs text-neutral-400">{memberSummaries[0].totalMeals} meals × {formatCurrency(mealSummary?.meal_rate || 0)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].mealCost)}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Home className="h-4 w-4 text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Home Rent Share</p>
                        <p className="text-xs text-neutral-400">Equal split</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].homeRentShare)}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30"><Zap className="h-4 w-4 text-yellow-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Utility Share</p>
                        <p className="text-xs text-neutral-400">Equal split</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].utilityShare)}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50 dark:bg-neutral-800/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700"><CircleDollarSign className="h-4 w-4 text-neutral-600 dark:text-neutral-400" /></div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">Total Expenses</p>
                    </div>
                    <span className="font-black text-lg text-neutral-900 dark:text-white">
                      {formatCurrency(memberSummaries[0].mealCost + memberSummaries[0].homeRentShare + memberSummaries[0].utilityShare)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><Wallet className="h-4 w-4 text-green-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">My Deposits</p>
                        <p className="text-xs text-neutral-400">Total paid in</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(memberSummaries[0].totalDeposits)}</span>
                  </div>
                  <div className={`flex items-center justify-between px-5 py-4 rounded-b-xl ${memberSummaries[0].balance >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${memberSummaries[0].balance >= 0 ? "bg-green-200 dark:bg-green-800" : "bg-red-200 dark:bg-red-800"}`}>
                        {memberSummaries[0].balance >= 0
                          ? <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-300" />
                          : <TrendingDown className="h-4 w-4 text-red-700 dark:text-red-300" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${memberSummaries[0].balance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                          {memberSummaries[0].balance >= 0 ? "You have a surplus" : "Amount due"}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {memberSummaries[0].balance >= 0 ? "Your deposits exceed your expenses" : "Your expenses exceed your deposits"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xl font-black ${memberSummaries[0].balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(Math.abs(memberSummaries[0].balance))}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )
        )}

        {/* Settlement Summary — Manager only */}
        {isManager && (
          <Card className="overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Settlement Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Members who need to pay (negative balance) */}
              <div>
                <h3 className="text-sm font-medium text-error mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Need to Pay
                </h3>
                <div className="space-y-3">
                  {memberSummaries
                    .filter((m) => m.balance < 0)
                    .sort((a, b) => a.balance - b.balance)
                    .map((summary) => (
                      <div
                        key={summary.member.user_id}
                        className="flex items-center justify-between p-3 bg-error/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center text-sm font-medium text-error">
                            {summary.member.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)}
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {summary.member.full_name}
                          </span>
                        </div>
                        <span className="font-bold text-error">
                          {formatCurrency(Math.abs(summary.balance))}
                        </span>
                      </div>
                    ))}
                  {memberSummaries.filter((m) => m.balance < 0).length ===
                    0 && (
                    <p className="text-neutral-500 text-center py-4">
                      No pending payments
                    </p>
                  )}
                </div>
              </div>

              {/* Members who should receive (positive balance) */}
              <div>
                <h3 className="text-sm font-medium text-success mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  To Receive
                </h3>
                <div className="space-y-3">
                  {memberSummaries
                    .filter((m) => m.balance > 0)
                    .sort((a, b) => b.balance - a.balance)
                    .map((summary) => (
                      <div
                        key={summary.member.user_id}
                        className="flex items-center justify-between p-3 bg-success/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-sm font-medium text-success">
                            {summary.member.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)}
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {summary.member.full_name}
                          </span>
                        </div>
                        <span className="font-bold text-success">
                          {formatCurrency(summary.balance)}
                        </span>
                      </div>
                    ))}
                  {memberSummaries.filter((m) => m.balance > 0).length ===
                    0 && (
                    <p className="text-neutral-500 text-center py-4">
                      No receivables
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Settlement Summary Footer */}
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-wrap justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Total Payable:</span>
                  <span className="font-bold text-error">
                    {formatCurrency(
                      Math.abs(
                        memberSummaries
                          .filter((m) => m.balance < 0)
                          .reduce((sum, m) => sum + m.balance, 0),
                      ),
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Total Receivable:</span>
                  <span className="font-bold text-success">
                    {formatCurrency(
                      memberSummaries
                        .filter((m) => m.balance > 0)
                        .reduce((sum, m) => sum + m.balance, 0),
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Net Balance:</span>
                  <span
                    className={`font-bold ${
                      month.closing_balance >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {formatCurrency(month.closing_balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        )}

        {/* Expense Breakdown — Manager only */}
        {isManager && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Expense Breakdown</h2>
            </div>
            <div className="p-6">
              {expensesByCategory.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No expenses recorded
                </p>
              ) : (
                <div className="space-y-4">
                  {expensesByCategory.map((expense) => (
                    <div key={expense.category}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {getCategoryLabel(expense.category)}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {formatCurrency(expense.amount)} (
                          {expense.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${expense.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between font-semibold">
                      <span>Total Expenses</span>
                      <span>{formatCurrency(totalExpenses)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {[
              ...mealExpenses.map(e => ({ ...e, type: "Meal", date: e.expense_date, amount: e.amount, desc: e.description })),
              ...rentExpenses.map(e => ({ ...e, type: "Rent", date: e.expense_date, amount: e.total_amount, desc: e.description })),
              ...utilityExpenses.map(e => ({ ...e, type: "Utility", date: e.expense_date, amount: e.total_amount, desc: e.description })),
              ...deposits.map(d => ({ ...d, type: "Deposit", date: d.deposit_date, amount: d.amount, desc: d.note }))
            ]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((transaction, index) => {
                const isExpense = transaction.type !== "Deposit";
                return (
                  <div
                    key={`${transaction.type}-${index}`}
                    className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isExpense
                            ? "bg-error/10 text-error"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {isExpense ? (
                          <span className="text-lg">
                            {transaction.type === "Meal" ? "🍲" : transaction.type === "Rent" ? "🏠" : "💡"}
                          </span>
                        ) : (
                          <span className="text-lg">💵</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {transaction.type}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {transaction.desc || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${isExpense ? "text-error" : "text-success"}`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
