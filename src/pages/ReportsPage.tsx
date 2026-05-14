import { useState } from "react";
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
  Skeleton,
} from "../components/common";
import { MainLayout } from "../components/layout";

import { useRequireAuth } from "../hooks";
import { pdfService } from "../services/pdfService";
import { type Member } from "../services/memberService";
import { formatCurrency } from "../utils/format.utils";

import { useActiveMonth } from "../hooks/queries/useMonthQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import { useMealExpenses, useExpenseSummaryByMembers, useDeposits } from "../hooks/queries/useExpenseQueries";
import { useMeals } from "../hooks/queries/useMealQueries";
import {
  TrendingDown,
  TrendingUp,
  Utensils,
  Home,
  Zap,
  Wallet,
  CircleDollarSign,
  Calculator,
} from "lucide-react";
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

export function ReportsPage() {
  const { user, isReady } = useRequireAuth();
  const isManager = user?.role === "manager";
  const navigate = useNavigate();
  const { data: activeMonth, isLoading: monthLoading } = useActiveMonth();
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: mealSummaryData, isLoading: mealExpensesLoading } = useMealExpenses(activeMonth?.id);
  const { data: expenseSummary, isLoading: summaryLoading } = useExpenseSummaryByMembers(activeMonth?.id);
  const { data: meals = [], isLoading: mealsLoading } = useMeals({ month_id: activeMonth?.id });
  const { data: deposits = [], isLoading: depositsLoading } = useDeposits({ month_id: activeMonth?.id });

  const mealSummary = mealSummaryData ? {
    total_meal_expenses: mealSummaryData.total_meal_expenses,
    total_meals: mealSummaryData.total_meals,
    meal_rate: mealSummaryData.meal_rate,
  } : null;

  const memberExpenseSummaries = expenseSummary?.member_summaries || [];
  const rentExpenses = expenseSummary?.home_rent_expenses || [];
  const utilityExpenses = expenseSummary?.utility_expenses || [];
  const mealExpenses = mealSummaryData?.expenses || [];

  const isLoading = monthLoading || membersLoading || mealExpensesLoading || summaryLoading || mealsLoading || depositsLoading;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Member detail modal
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

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

    const balance = totalDeposits - (mealCost + homeRentShare + utilityShare);

    return {
      member,
      totalMeals,
      mealCost,
      homeRentShare,
      utilityShare,
      totalDeposits,
      balance,
    };
  });


  const totalMeals = memberSummaries.reduce((sum, m) => sum + m.totalMeals, 0);
  // Always show all-members total meals from the API summary
  const allMembersTotalMeals = mealSummary?.total_meals || 0;
  const totalDeposits = memberSummaries.reduce(
    (sum, m) => sum + m.totalDeposits,
    0,
  );
  const totalMealCost = memberSummaries.reduce((sum, m) => sum + m.mealCost, 0);

  const totalExpenses = (mealSummary?.total_meal_expenses || 0) +
    rentExpenses.reduce((sum, e) => sum + e.total_amount, 0) +
    utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0);

  const expenseByCategory: ExpenseByCategory[] = [
    { category: "Meals", amount: mealSummary?.total_meal_expenses || 0, percentage: totalExpenses > 0 ? ((mealSummary?.total_meal_expenses || 0) / totalExpenses) * 100 : 0 },
    { category: "Home Rent", amount: rentExpenses.reduce((sum, e) => sum + e.total_amount, 0), percentage: totalExpenses > 0 ? (rentExpenses.reduce((sum, e) => sum + e.total_amount, 0) / totalExpenses) * 100 : 0 },
    { category: "Utilities", amount: utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0), percentage: totalExpenses > 0 ? (utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0) / totalExpenses) * 100 : 0 },
  ].sort((a, b) => b.amount - a.amount);


  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Meals": "🍲",
      "Home Rent": "🏠",
      "Utilities": "💡",
      electricity: "⚡",
      water: "💧",
      gas: "🔥",
      internet: "🌐",
      other: "📦",
    };
    return icons[category] || "📦";
  };

  // unused: getCategoryColor

  const handleDownloadPDF = async () => {
    if (!activeMonth) {
      toast.error("No active month to download");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const blob = await pdfService.downloadMonthPDF(activeMonth.id);
      const monthName = new Date(activeMonth.month_year).toLocaleDateString(
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

  const handleDownloadMemberPDF = async (memberId: string) => {
    if (!activeMonth) {
      toast.error("No active month to download");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const blob = await pdfService.downloadMemberStatementPDF(
        memberId,
        activeMonth.id,
      );
      const member = members.find((m) => m.user_id === memberId);
      const monthName = new Date(activeMonth.month_year).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" },
      );
      pdfService.triggerDownload(
        blob,
        `member_statement_${member?.full_name || "unknown"}_${monthName}.pdf`,
      );
      toast.success("Member statement downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download member statement");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const openMemberDetails = (summary: MemberSummary) => {
    setSelectedMember(summary);
    setShowMemberModal(true);
  };

  if (!isReady) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading reports..." />
      </MainLayout>
    );
  }

  const currentMonthName = activeMonth
    ? new Date(activeMonth.month_year).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "No Active Month";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Monthly Report - {currentMonthName}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Complete mess statement and member breakdown
            </p>
          </div>
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

        {!activeMonth ? (
          <Card className="text-center py-12">
            <p className="text-neutral-500 mb-4">
              No active month found. Please start a new month.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Total Meals</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  {mealExpensesLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : allMembersTotalMeals}
                </h3>
                <Badge variant="primary">All Members</Badge>
              </Card>

              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Meal Rate</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  {monthLoading ? <Skeleton className="h-9 w-24 mx-auto" /> : formatCurrency(activeMonth?.meal_rate || 0)}
                </h3>
                <Badge variant="warning">Per Meal</Badge>
              </Card>

              {isManager && (
                <Card className="text-center p-6">
                  <p className="text-neutral-500 text-sm mb-2">Total Expenses</p>
                  <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    {summaryLoading || mealExpensesLoading ? <Skeleton className="h-9 w-28 mx-auto" /> : formatCurrency(totalExpenses)}
                  </h3>
                  <Badge variant="error">Costs</Badge>
                </Card>
              )}

              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Meal Expenses</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  {mealExpensesLoading ? <Skeleton className="h-9 w-28 mx-auto" /> : formatCurrency(mealSummary?.total_meal_expenses || 0)}
                </h3>
                <Badge variant="success">This Month</Badge>
              </Card>
            </div>

            {/* Financial Overview */}

            {/* Member-wise Breakdown — Manager sees full table, Member sees personal statement */}
            {isManager ? (
              <Card>
                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Member-wise Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                        <th className="pb-3 font-medium">Member</th>
                        <th className="pb-3 font-medium text-right">Meals</th>
                        <th className="pb-3 font-medium text-right">Meal Cost</th>
                        <th className="pb-3 font-medium text-right">Rent</th>
                        <th className="pb-3 font-medium text-right">Utils</th>
                        <th className="pb-3 font-medium text-right">Deposits</th>
                        <th className="pb-3 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-neutral-100 dark:divide-neutral-800">
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="py-8">
                            <div className="space-y-4">
                              <Skeleton className="h-10 w-full" count={3} />
                            </div>
                          </td>
                        </tr>
                      ) : (
                        memberSummaries.map((summary) => (
                          <tr
                            key={summary.member.user_id}
                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                            onClick={() => openMemberDetails(summary)}
                          >
                            <td className="py-3 font-medium text-neutral-900 dark:text-white">{summary.member.full_name}</td>
                            <td className="py-3 text-right">{summary.totalMeals}</td>
                            <td className="py-3 text-right">{formatCurrency(summary.mealCost)}</td>
                            <td className="py-3 text-right">{formatCurrency(summary.homeRentShare)}</td>
                            <td className="py-3 text-right">{formatCurrency(summary.utilityShare)}</td>
                            <td className="py-3 text-right text-success font-medium">{formatCurrency(summary.totalDeposits)}</td>
                            <td className={`py-3 text-right font-bold ${summary.balance >= 0 ? "text-success" : "text-error"}`}>
                              {formatCurrency(summary.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="font-bold border-t-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <tr>
                        <td className="py-3">Totals</td>
                        <td className="py-3 text-right">{totalMeals}</td>
                        <td className="py-3 text-right">{formatCurrency(totalMealCost)}</td>
                        <td className="py-3 text-right">{formatCurrency(rentExpenses.reduce((sum, e) => sum + e.total_amount, 0))}</td>
                        <td className="py-3 text-right">{formatCurrency(utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0))}</td>
                        <td className="py-3 text-right">{formatCurrency(totalDeposits)}</td>
                        <td className={`py-3 text-right ${totalDeposits - totalExpenses >= 0 ? "text-success" : "text-error"}`}>
                          {formatCurrency(totalDeposits - totalExpenses)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            ) : (
              /* ── Member Personal Statement ── */
              memberSummaries[0] && (
                <div className="space-y-4">
                  {/* Greeting banner */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-white shadow-lg shadow-primary/20">
                    <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
                    <div className="relative z-10">
                      <p className="text-sm font-medium text-primary-foreground/80 mb-1">My Statement —&nbsp;
                        <span className="font-bold text-white">{currentMonthName}</span>
                      </p>
                      <h2 className="text-2xl font-black tracking-tight">{memberSummaries[0].member.full_name}</h2>
                      <div className="mt-4 flex items-end gap-2">
                        <span className="text-4xl font-black">{formatCurrency(memberSummaries[0].balance < 0 ? Math.abs(memberSummaries[0].balance) : memberSummaries[0].balance)}</span>
                        <span className={`mb-1 text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                          memberSummaries[0].balance >= 0
                            ? "bg-green-400/20 text-green-100"
                            : "bg-red-400/20 text-red-100"
                        }`}>
                          {memberSummaries[0].balance >= 0 ? "✓ Surplus" : "⚠ Due"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/70">Net balance after all deductions</p>
                    </div>
                  </div>

                  {/* Expense breakdown cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60">
                      <Utensils className="absolute -right-3 -bottom-3 h-16 w-16 text-orange-500 opacity-5" />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Utensils className="h-3.5 w-3.5 text-orange-600" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Meals</span>
                        </div>
                        <p className="text-xl font-black text-neutral-900 dark:text-white">{memberSummaries[0].totalMeals}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{formatCurrency(memberSummaries[0].mealCost)} cost</p>
                      </div>
                    </Card>

                    <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60">
                      <Home className="absolute -right-3 -bottom-3 h-16 w-16 text-blue-500 opacity-5" />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Home className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Rent Share</span>
                        </div>
                        <p className="text-xl font-black text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].homeRentShare)}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">My portion</p>
                      </div>
                    </Card>

                    <Card className="relative overflow-hidden group border border-neutral-200/60 dark:border-neutral-800/60">
                      <Zap className="absolute -right-3 -bottom-3 h-16 w-16 text-yellow-500 opacity-5" />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Zap className="h-3.5 w-3.5 text-yellow-600" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Utilities</span>
                        </div>
                        <p className="text-xl font-black text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].utilityShare)}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">My portion</p>
                      </div>
                    </Card>
                  </div>

                  {/* Financial summary */}
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
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Utensils className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">Meal Cost</p>
                            <p className="text-xs text-neutral-400">{memberSummaries[0].totalMeals} meals × {formatCurrency(mealSummary?.meal_rate || 0)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].mealCost)}</span>
                      </div>

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
                        <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].homeRentShare)}</span>
                      </div>

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
                        <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(memberSummaries[0].utilityShare)}</span>
                      </div>

                      <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50 dark:bg-neutral-800/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700">
                            <CircleDollarSign className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                          </div>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white">Total Expenses</p>
                        </div>
                        <span className="font-black text-lg text-neutral-900 dark:text-white">
                          {formatCurrency(memberSummaries[0].mealCost + memberSummaries[0].homeRentShare + memberSummaries[0].utilityShare)}
                        </span>
                      </div>

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
                        <span className="font-bold text-green-600">{formatCurrency(memberSummaries[0].totalDeposits)}</span>
                      </div>

                      <div className={`flex items-center justify-between px-5 py-4 rounded-b-xl ${
                        memberSummaries[0].balance >= 0
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            memberSummaries[0].balance >= 0
                              ? "bg-green-200 dark:bg-green-800"
                              : "bg-red-200 dark:bg-red-800"
                          }`}>
                            {memberSummaries[0].balance >= 0
                              ? <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-300" />
                              : <TrendingDown className="h-4 w-4 text-red-700 dark:text-red-300" />
                            }
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${
                              memberSummaries[0].balance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                            }`}>
                              {memberSummaries[0].balance >= 0 ? "You have a surplus" : "Amount due"}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {memberSummaries[0].balance >= 0
                                ? "Your deposits exceed your expenses"
                                : "Your expenses exceed your deposits"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xl font-black ${
                          memberSummaries[0].balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
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
              <Card className="bg-primary/5 border-primary/20">
                <div className="mb-4 pb-4 border-b border-primary/20">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Settlement Summary</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-success">Members to Receive</h3>
                    <div className="space-y-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-full" count={2} />
                      ) : (
                        <>
                          {memberSummaries.filter((m) => m.balance > 0).sort((a, b) => b.balance - a.balance).map((summary) => (
                            <div key={summary.member.user_id} className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                              <span>{summary.member.full_name}</span>
                              <span className="font-medium text-success">{formatCurrency(summary.balance)}</span>
                            </div>
                          ))}
                          {memberSummaries.filter((m) => m.balance > 0).length === 0 && (
                            <p className="text-neutral-500 text-sm">No members to receive</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-error">Members to Pay</h3>
                    <div className="space-y-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-full" count={2} />
                      ) : (
                        <>
                          {memberSummaries.filter((m) => m.balance < 0).sort((a, b) => a.balance - b.balance).map((summary) => (
                            <div key={summary.member.user_id} className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                              <span>{summary.member.full_name}</span>
                              <span className="font-medium text-error">{formatCurrency(Math.abs(summary.balance))}</span>
                            </div>
                          ))}
                          {memberSummaries.filter((m) => m.balance < 0).length === 0 && (
                            <p className="text-neutral-500 text-sm">No members to pay</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Financial Overview — Manager only, after Settlement Summary */}
            {isManager && (
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Financial Overview</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <span className="text-neutral-600 dark:text-neutral-400">Opening Balance</span>
                        <span className="font-semibold">{formatCurrency(activeMonth?.opening_balance || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
                        <span className="text-success">Total Deposits</span>
                        <span className="font-semibold text-success">+{formatCurrency(totalDeposits)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-error/10 rounded-lg">
                        <span className="text-error">Total Meal Cost</span>
                        <span className="font-semibold text-error">-{formatCurrency(totalMealCost)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-t-2 border-primary">
                        <span className="font-semibold">Closing Balance</span>
                        <span className={`font-bold text-lg ${(activeMonth?.closing_balance || 0) >= 0 ? "text-success" : "text-error"}`}>
                          {formatCurrency(activeMonth?.closing_balance || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="font-semibold mb-4">Expense Breakdown</h3>
                      <div className="space-y-3">
                        {expenseByCategory.length === 0 ? (
                          <p className="text-neutral-500 text-center py-8">No expenses recorded this month</p>
                        ) : (
                          <>
                            {expenseByCategory.map((item) => (
                              <div key={item.category}>
                                <div className="flex justify-between mb-1">
                                  <span className="capitalize flex items-center gap-2"><span>{getCategoryIcon(item.category)}</span>{item.category}</span>
                                  <span className="text-neutral-600 dark:text-neutral-400">{formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                                </div>
                              </div>
                            ))}
                            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                              <div className="flex justify-between font-semibold">
                                <span>Total Expenses</span>
                                <span>{formatCurrency(totalExpenses)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Expenses */}
            <Card>
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Recent Expenses</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8">
                          <div className="space-y-4">
                            <Skeleton className="h-10 w-full" count={3} />
                          </div>
                        </td>
                      </tr>
                    ) : (
                      [
                        ...mealExpenses.map(e => ({ ...e, type: "Meal", date: e.expense_date })),
                        ...rentExpenses.map(e => ({ ...e, type: "Rent", date: e.expense_date })),
                        ...utilityExpenses.map(e => ({ ...e, type: "Utility", date: e.expense_date }))
                      ]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((expense, idx) => (
                          <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                            <td className="py-3">{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${expense.type === "Meal" ? "bg-orange-100 text-orange-800" :
                                  expense.type === "Rent" ? "bg-blue-100 text-blue-800" :
                                    "bg-purple-100 text-purple-800"
                                }`}>
                                {expense.type}
                              </span>
                            </td>
                            <td className="py-3">{expense.description}</td>
                            <td className="py-3 text-right font-medium">
                              {formatCurrency("total_amount" in expense ? expense.total_amount : expense.amount)}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
                {mealExpenses.length === 0 && rentExpenses.length === 0 && utilityExpenses.length === 0 && (
                  <p className="text-center text-neutral-500 py-8">No expenses recorded this month</p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Member Detail Modal */}
      {showMemberModal && selectedMember && (
        <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}>
          <ModalHeader>
            Member Statement - {selectedMember.member.full_name}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Meals</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {selectedMember.totalMeals}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Meal Cost</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(selectedMember.mealCost)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Rent Share</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(selectedMember.homeRentShare)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Utility Share</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(selectedMember.utilityShare)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm text-neutral-500">Total Cost</p>
                  <p className="text-xl font-bold text-error">
                    {formatCurrency(selectedMember.mealCost + selectedMember.homeRentShare + selectedMember.utilityShare)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm text-neutral-500">Total Deposits</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(selectedMember.totalDeposits)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex justify-between items-center border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Final Balance</p>
                <p
                  className={`text-2xl font-bold ${selectedMember.balance >= 0
                      ? "text-success"
                      : "text-error"
                    }`}
                >
                  {formatCurrency(selectedMember.balance)}
                </p>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="font-medium mb-2">Status</h4>
                <p className="text-sm">
                  {selectedMember.balance >= 0 ? (
                    <span className="text-success">
                      ✅ Will receive {formatCurrency(selectedMember.balance)}
                    </span>
                  ) : (
                    <span className="text-error">
                      ⚠️ Needs to pay{" "}
                      {formatCurrency(Math.abs(selectedMember.balance))}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowMemberModal(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleDownloadMemberPDF(selectedMember.member.user_id);
                setShowMemberModal(false);
              }}
              isLoading={isGeneratingPDF}
            >
              Download PDF
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </MainLayout>
  );
}
