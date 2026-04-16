import { useEffect, useState } from "react";
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
import { depositService, Deposit } from "../services/depositService";
import { expenseService, Expense } from "../services/expenseService";
import { mealService, Meal } from "../services/mealService";
import { Member, memberService } from "../services/memberService";
import { Month, monthService } from "../services/monthService";
import { pdfService } from "../services/pdfService";

interface MemberSummary {
  member: Member;
  totalMeals: number;
  mealCost: number;
  totalDeposits: number;
  balance: number;
}

interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export function ReportsPage() {
  const { isReady, user } = useRequireAuth();
  const { user: authUser } = useAuth();
  const [activeMonth, setActiveMonth] = useState<Month | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Member detail modal
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(
    null
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
        const [mealsData, expensesData, depositsData] = await Promise.all([
          mealService.getMeals(),
          expenseService.getExpenses({ month_id: monthData.id }),
          depositService.getDeposits({ month_id: monthData.id }),
        ]);
        setMeals(mealsData);
        setExpenses(expensesData);
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

  const memberSummaries: MemberSummary[] = members.map((member) => {
    const totalMeals = getMemberMeals(member.user_id);
    const mealCost = totalMeals * (activeMonth?.meal_rate || 0);
    const totalDeposits = getMemberDeposits(member.user_id);
    const balance = totalDeposits - mealCost;

    return {
      member,
      totalMeals,
      mealCost,
      totalDeposits,
      balance,
    };
  });

  const totalMeals = memberSummaries.reduce((sum, m) => sum + m.totalMeals, 0);
  const totalDeposits = memberSummaries.reduce(
    (sum, m) => sum + m.totalDeposits,
    0
  );
  const totalMealCost = memberSummaries.reduce(
    (sum, m) => sum + m.mealCost,
    0
  );

  // Expense breakdown by category
  const expenseByCategory: ExpenseByCategory[] = (() => {
    const categories: Record<string, number> = {};
    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  })();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      electricity: "⚡",
      groceries: "🛒",
      maintenance: "🔧",
      cleaning: "🧹",
      water: "💧",
      gas: "🔥",
      other: "📦",
    };
    return icons[category] || "📦";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electricity: "bg-yellow-100 text-yellow-800",
      groceries: "bg-green-100 text-green-800",
      maintenance: "bg-blue-100 text-blue-800",
      cleaning: "bg-purple-100 text-purple-800",
      water: "bg-cyan-100 text-cyan-800",
      gas: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

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
        { month: "long", year: "numeric" }
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
        activeMonth.id
      );
      const member = members.find((m) => m.user_id === memberId);
      const monthName = new Date(activeMonth.month_year).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      );
      pdfService.triggerDownload(
        blob,
        `member_statement_${member?.full_name || "unknown"}_${monthName}.pdf`
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
            <Button onClick={() => (window.location.href = "/dashboard")}>
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
                <p className="text-neutral-500 text-sm mb-2">Total Deposits</p>
                <h3 className="text-3xl font-bold mb-2">
                  {formatCurrency(totalDeposits)}
                </h3>
                <Badge variant="success">Collected</Badge>
              </Card>
            </div>

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
                        <th className="pb-3 font-medium text-right">Cost</th>
                        <th className="pb-3 font-medium text-right">
                          Deposits
                        </th>
                        <th className="pb-3 font-medium text-right">Balance</th>
                        <th className="pb-3 font-medium text-right">Action</th>
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
                              {summary.member.role === "manager" && (
                                <Badge size="sm" variant="success">
                                  M
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            {summary.totalMeals}
                          </td>
                          <td className="py-3 text-right">
                            {formatCurrency(summary.mealCost)}
                          </td>
                          <td className="py-3 text-right">
                            {formatCurrency(summary.totalDeposits)}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={
                                summary.balance >= 0
                                  ? "text-success"
                                  : "text-error"
                              }
                            >
                              {formatCurrency(summary.balance)}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadMemberPDF(summary.member.user_id);
                              }}
                            >
                              PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="font-semibold">
                      <tr className="border-t-2 border-neutral-200 dark:border-neutral-700">
                        <td className="py-3">Total</td>
                        <td className="py-3 text-right">{totalMeals}</td>
                        <td className="py-3 text-right">
                          {formatCurrency(totalMealCost)}
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(totalDeposits)}
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(totalDeposits - totalMealCost)}
                        </td>
                        <td></td>
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
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {expenses.slice(0, 10).map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                      >
                        <td className="py-3">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                              expense.category
                            )}`}
                          >
                            {getCategoryIcon(expense.category)}
                            <span className="capitalize">
                              {expense.category}
                            </span>
                          </span>
                        </td>
                        <td className="py-3">{expense.description}</td>
                        <td className="py-3 text-right">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {expenses.length === 0 && (
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
        <Modal onClose={() => setShowMemberModal(false)}>
          <ModalHeader>Member Statement - {selectedMember.member.full_name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Meals</p>
                  <p className="text-2xl font-bold">{selectedMember.totalMeals}</p>
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
                      selectedMember.balance >= 0 ? "text-success" : "text-error"
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
                      ⚠️ Needs to pay {formatCurrency(Math.abs(selectedMember.balance))}
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
