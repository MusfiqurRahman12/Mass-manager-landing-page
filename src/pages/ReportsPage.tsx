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

import { useRequireAuth } from "../hooks";
import { depositService, type Deposit } from "../services/depositService";
import { mealService, type Meal } from "../services/mealService";
import { expenseApi, type HomeRentExpense, type UtilityExpense, type MemberSummary as ExpenseMemberSummary, type MealExpense } from "../services/expenseApi";
import { pdfService } from "../services/pdfService";
import { memberService, type Member } from "../services/memberService";
import { monthService, type Month } from "../services/monthService";
import { formatCurrency } from "../utils/format.utils";




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
  const [activeMonth, setActiveMonth] = useState<Month | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealExpenses, setMealExpenses] = useState<MealExpense[]>([]);
  const [rentExpenses, setRentExpenses] = useState<HomeRentExpense[]>([]);
  const [utilityExpenses, setUtilityExpenses] = useState<UtilityExpense[]>([]);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [memberExpenseSummaries, setMemberExpenseSummaries] = useState<ExpenseMemberSummary[]>([]);
  const [mealSummary, setMealSummary] = useState<{ total_meal_expenses: number; total_meals: number; meal_rate: number } | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);



  // Member detail modal
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(
    null,
  );
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    if (isReady) {
      loadReportData();
    }
  }, [isReady]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [monthData, membersData] = await Promise.all([
        monthService.getActiveMonth().catch(() => null),
        memberService.getMembers(),
      ]);

      setActiveMonth(monthData);
      setMembers(membersData);

      if (monthData) {
        const [mealSummaryData, expenseSummary, mealsData, depositsData] = await Promise.all([
          expenseApi.getMealExpenses(monthData.id),
          expenseApi.getSummaryByMembers(monthData.id),
          mealService.getMeals({ month_id: monthData.id }),
          depositService.getDeposits({ month_id: monthData.id }),
        ]);
        setMealSummary({
          total_meal_expenses: mealSummaryData.total_meal_expenses,
          total_meals: mealSummaryData.total_meals,
          meal_rate: mealSummaryData.meal_rate
        });
        setMealExpenses(mealSummaryData.expenses);
        setRentExpenses(expenseSummary.home_rent_expenses);
        setUtilityExpenses(expenseSummary.utility_expenses);
        setMemberExpenseSummaries(expenseSummary.member_summaries);
        setMeals(mealsData);
        setDeposits(depositsData);
      }



    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

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
      toast.error("Failed to download PDF");
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
      toast.error("Failed to download member statement");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const openMemberDetails = (summary: MemberSummary) => {
    setSelectedMember(summary);
    setShowMemberModal(true);
  };

  if (!isReady || isLoading) {
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
            <h1 className="text-3xl font-bold mb-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Total Meals</p>
                <h3 className="text-3xl font-bold mb-2">{totalMeals}</h3>
                <Badge variant="primary">All Members</Badge>
              </Card>

              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Meal Rate</p>
                <h3 className="text-3xl font-bold mb-2">
                  {formatCurrency(activeMonth?.meal_rate || 0)}
                </h3>
                <Badge variant="warning">Per Meal</Badge>
              </Card>

              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Total Expenses</p>
                <h3 className="text-3xl font-bold mb-2">
                  {formatCurrency(totalExpenses)}
                </h3>
                <Badge variant="error">Costs</Badge>
              </Card>

              <Card className="text-center p-6">
                <p className="text-neutral-500 text-sm mb-2">Closing Balance</p>
                <h3
                  className={`text-3xl font-bold mb-2 ${activeMonth?.closing_balance && activeMonth.closing_balance >= 0 ? "text-success" : "text-error"}`}
                >
                  {formatCurrency(activeMonth?.closing_balance || 0)}
                </h3>
                <Badge variant="success">Remaining</Badge>
              </Card>
            </div>

            {/* Financial Overview */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold">Financial Overview</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Opening Balance
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(activeMonth?.opening_balance || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
                      <span className="text-success">Total Deposits</span>
                      <span className="font-semibold text-success">
                        +{formatCurrency(totalDeposits)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-error/10 rounded-lg">
                      <span className="text-error">Total Cost</span>
                      <span className="font-semibold text-error">
                        -{formatCurrency(totalMealCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-t-2 border-primary">
                      <span className="font-semibold">Closing Balance</span>
                      <span
                        className={`font-bold text-lg ${(activeMonth?.closing_balance || 0) >= 0 ? "text-success" : "text-error"}`}
                      >
                        {formatCurrency(activeMonth?.closing_balance || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-4">Expense Breakdown</h3>
                    <div className="space-y-3">
                      {expenseByCategory.length === 0 ? (
                        <p className="text-neutral-500 text-center py-8">
                          No expenses recorded this month
                        </p>
                      ) : (
                        <>
                          {expenseByCategory.map((item) => (
                            <div key={item.category}>
                              <div className="flex justify-between mb-1">
                                <span className="capitalize flex items-center gap-2">
                                  <span>{getCategoryIcon(item.category)}</span>
                                  {item.category}
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  {formatCurrency(item.amount)} (
                                  {item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member Summary Table */}
              <Card className="lg:col-span-2">
                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-xl font-bold">Member-wise Breakdown</h2>
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
                    <tbody className="text-sm">
                      {memberSummaries.map((summary) => (
                        <tr
                          key={summary.member.user_id}
                          className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                          onClick={() => openMemberDetails(summary)}
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {summary.member.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right">{summary.totalMeals}</td>
                          <td className="py-3 text-right">{formatCurrency(summary.mealCost)}</td>
                          <td className="py-3 text-right">{formatCurrency(summary.homeRentShare)}</td>
                          <td className="py-3 text-right">{formatCurrency(summary.utilityShare)}</td>
                          <td className="py-3 text-right text-success font-medium">{formatCurrency(summary.totalDeposits)}</td>
                          <td className={`py-3 text-right font-bold ${summary.balance >= 0 ? "text-success" : "text-error"}`}>
                            {formatCurrency(summary.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="font-bold border-t-2 border-neutral-200 dark:border-neutral-700">
                      <tr>
                        <td className="py-3">Totals</td>
                        <td className="py-3 text-right">{totalMeals}</td>
                        <td className="py-3 text-right">{formatCurrency(totalMealCost)}</td>
                        <td className="py-3 text-right">{formatCurrency(rentExpenses.reduce((sum, e) => sum + e.total_amount, 0))}</td>
                        <td className="py-3 text-right">{formatCurrency(utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0))}</td>
                        <td className="py-3 text-right">{formatCurrency(totalDeposits)}</td>
                        <td className={`py-3 text-right ${totalDeposits - totalExpenses >= 0 ? "text-success" : "text-error"}`}>
                          {formatCurrency(totalDeposits - (totalMealCost + rentExpenses.reduce((sum, e) => sum + e.total_amount, 0) + utilityExpenses.reduce((sum, e) => sum + e.total_amount, 0)))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </Card>

              {/* Expense Distribution */}
              <Card>
                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-xl font-bold">Expense Distribution</h2>
                </div>

                <div className="space-y-4">
                  {expenseByCategory.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(item.category)}</span>
                          <span className="capitalize">{item.category}</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        {item.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  ))}

                  {expenseByCategory.length === 0 && (
                    <p className="text-center text-neutral-500 py-8">
                      No expenses recorded this month
                    </p>
                  )}

                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Expenses</span>
                      <span className="font-bold">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Expenses */}
            <Card>
              <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold">Recent Expenses</h2>
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
                    {[
                      ...mealExpenses.map(e => ({ ...e, type: "Meal", date: e.expense_date })),
                      ...rentExpenses.map(e => ({ ...e, type: "Rent", date: e.expense_date })),
                      ...utilityExpenses.map(e => ({ ...e, type: "Utility", date: e.expense_date }))
                    ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((expense, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                      >
                        <td className="py-3">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              expense.type === "Meal" ? "bg-orange-100 text-orange-800" :
                              expense.type === "Rent" ? "bg-blue-100 text-blue-800" :
                              "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {expense.type}
                          </span>
                        </td>
                        <td className="py-3">{expense.description}</td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency("total_amount" in expense ? expense.total_amount : expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {mealExpenses.length === 0 && rentExpenses.length === 0 && utilityExpenses.length === 0 && (
                  <p className="text-center text-neutral-500 py-8">
                    No expenses recorded this month
                  </p>
                )}
              </div>

            </Card>

            {/* Settlement Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <div className="mb-4 pb-4 border-b border-primary/20">
                <h2 className="text-xl font-bold">Settlement Summary</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-success">
                    Members to Receive
                  </h3>
                  <div className="space-y-2">
                    {memberSummaries
                      .filter((m) => m.balance > 0)
                      .sort((a, b) => b.balance - a.balance)
                      .map((summary) => (
                        <div
                          key={summary.member.user_id}
                          className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
                        >
                          <span>{summary.member.full_name}</span>
                          <span className="font-medium text-success">
                            {formatCurrency(summary.balance)}
                          </span>
                        </div>
                      ))}
                    {memberSummaries.filter((m) => m.balance > 0).length ===
                      0 && (
                      <p className="text-neutral-500 text-sm">
                        No members to receive
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-error">
                    Members to Pay
                  </h3>
                  <div className="space-y-2">
                    {memberSummaries
                      .filter((m) => m.balance < 0)
                      .sort((a, b) => a.balance - b.balance)
                      .map((summary) => (
                        <div
                          key={summary.member.user_id}
                          className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
                        >
                          <span>{summary.member.full_name}</span>
                          <span className="font-medium text-error">
                            {formatCurrency(Math.abs(summary.balance))}
                          </span>
                        </div>
                      ))}
                    {memberSummaries.filter((m) => m.balance < 0).length ===
                      0 && (
                      <p className="text-neutral-500 text-sm">
                        No members to pay
                      </p>
                    )}
                  </div>
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Meals</p>
                  <p className="text-2xl font-bold">
                    {selectedMember.totalMeals}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Meal Cost</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedMember.mealCost)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Deposits</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(selectedMember.totalDeposits)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Balance</p>
                  <p
                    className={`text-2xl font-bold ${
                      selectedMember.balance >= 0
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {formatCurrency(selectedMember.balance)}
                  </p>
                </div>
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
