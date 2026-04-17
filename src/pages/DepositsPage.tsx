import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Select,
  Skeleton,
} from "../components/common";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context";
import { useForm } from "../hooks/useForm";
import type { Deposit, MealCost, Member } from "../services";
import { depositService, mealService, memberService } from "../services";
import { cn } from "../utils";
import { formatCurrency } from "../utils/format.utils";

// Types
interface DepositFormValues {
  member_id: string;
  amount: string;
  deposit_date: string;
  note: string;
}

const ITEMS_PER_PAGE = 10;

export function DepositsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  // State
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealCost, setMealCost] = useState<MealCost | null>(null);
  const [meals, setMeals] = useState<
    { member_id: string; meal_count: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMember, setFilterMember] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [depositsData, membersData, costData, mealsData] =
        await Promise.all([
          depositService.getDeposits(),
          memberService.getMembers(),
          mealService.getMealCost().catch(() => null),
          mealService.getMeals(),
        ]);
      setDeposits(depositsData);
      setMembers(membersData);
      setMealCost(costData);
      setMeals(
        mealsData.map((m) => ({
          member_id: m.member_id,
          meal_count: m.meal_count,
        })),
      );
    } catch (error) {
      toast.error("Failed to load deposit data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Member options for select
  const memberOptions = useMemo(
    () =>
      members.map((m) => ({
        value: m.user_id,
        label: m.full_name,
      })),
    [members],
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.user_id, m));
    return map;
  }, [members]);

  // Filtered and paginated deposits
  const filteredDeposits = useMemo(() => {
    let filtered = [...deposits];

    if (filterMember) {
      filtered = filtered.filter((d) => d.member_id === filterMember);
    }

    if (filterStartDate) {
      filtered = filtered.filter((d) => d.deposit_date >= filterStartDate);
    }

    if (filterEndDate) {
      filtered = filtered.filter((d) => d.deposit_date <= filterEndDate);
    }

    // Sort by date descending
    filtered.sort(
      (a, b) =>
        new Date(b.deposit_date).getTime() - new Date(a.deposit_date).getTime(),
    );

    return filtered;
  }, [deposits, filterMember, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Summary calculations
  const totalDeposits = useMemo(() => {
    return deposits.reduce((sum, d) => sum + d.amount, 0);
  }, [deposits]);

  const totalMealCost = useMemo(() => {
    if (!mealCost) return 0;
    return mealCost.total_meal * mealCost.meal_rate;
  }, [mealCost]);

  const currentBalance = useMemo(() => {
    return totalDeposits - (mealCost?.total_cost || 0);
  }, [totalDeposits, mealCost]);

  // Member-wise calculations
  const memberBalances = useMemo(() => {
    const balances: Record<
      string,
      {
        member: Member;
        totalDeposits: number;
        totalMeals: number;
        mealCost: number;
        dueAmount: number;
      }
    > = {};

    // Initialize with all members
    members.forEach((member) => {
      balances[member.user_id] = {
        member,
        totalDeposits: 0,
        totalMeals: 0,
        mealCost: 0,
        dueAmount: 0,
      };
    });

    // Calculate deposits per member
    deposits.forEach((deposit) => {
      if (balances[deposit.member_id]) {
        balances[deposit.member_id].totalDeposits += deposit.amount;
      }
    });

    // Calculate meals per member
    const mealRate = mealCost?.meal_rate || 0;
    meals.forEach((meal) => {
      if (balances[meal.member_id]) {
        balances[meal.member_id].totalMeals += meal.meal_count;
        balances[meal.member_id].mealCost += meal.meal_count * mealRate;
      }
    });

    // Calculate due amount (positive = owes money, negative = has credit)
    Object.keys(balances).forEach((memberId) => {
      const balance = balances[memberId];
      balance.dueAmount = balance.mealCost - balance.totalDeposits;
    });

    return Object.values(balances).sort((a, b) => b.dueAmount - a.dueAmount);
  }, [members, deposits, meals, mealCost]);

  // Forms
  const depositForm = useForm<DepositFormValues>({
    initialValues: {
      member_id: "",
      amount: "",
      deposit_date: format(new Date(), "yyyy-MM-dd"),
      note: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.member_id) errors.member_id = "Please select a member";
      if (!values.amount) errors.amount = "Please enter an amount";
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be greater than 0";
      }
      if (!values.deposit_date) errors.deposit_date = "Please select a date";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) {
        toast.error("Only managers can add deposits");
        return;
      }
      setIsSubmitting(true);
      try {
        await depositService.addDeposit({
          member_id: values.member_id,
          amount: parseFloat(values.amount),
          deposit_date: values.deposit_date,
          note: values.note.trim() || undefined,
        });
        toast.success("Deposit added successfully");
        await fetchData();
        depositForm.resetForm();
        depositForm.setValues({
          member_id: "",
          amount: "",
          deposit_date: format(new Date(), "yyyy-MM-dd"),
          note: "",
        });
      } catch (error) {
        toast.error("Failed to add deposit");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const editForm = useForm<DepositFormValues>({
    initialValues: {
      member_id: "",
      amount: "",
      deposit_date: "",
      note: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.amount) errors.amount = "Please enter an amount";
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be greater than 0";
      }
      if (!values.deposit_date) errors.deposit_date = "Please select a date";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager || !selectedDeposit) return;
      setIsSubmitting(true);
      try {
        await depositService.updateDeposit(selectedDeposit.id, {
          amount: parseFloat(values.amount),
          deposit_date: values.deposit_date,
          note: values.note.trim() || undefined,
        });
        toast.success("Deposit updated successfully");
        await fetchData();
        setIsEditModalOpen(false);
        setSelectedDeposit(null);
      } catch (error) {
        toast.error("Failed to update deposit");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handlers
  const handleEdit = (deposit: Deposit) => {
    if (!isManager) {
      toast.error("Only managers can edit deposits");
      return;
    }
    setSelectedDeposit(deposit);
    editForm.setValues({
      member_id: deposit.member_id,
      amount: deposit.amount.toString(),
      deposit_date: deposit.deposit_date,
      note: deposit.note || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (deposit: Deposit) => {
    if (!isManager) {
      toast.error("Only managers can delete deposits");
      return;
    }
    setDepositToDelete(deposit);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !depositToDelete) return;
    try {
      await depositService.deleteDeposit(depositToDelete.id);
      toast.success("Deposit deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setDepositToDelete(null);
    } catch (error) {
      toast.error("Failed to delete deposit");
      console.error(error);
    }
  };

  const membersWithDue = memberBalances.filter((m) => m.dueAmount > 0);
  const membersWithCredit = memberBalances.filter((m) => m.dueAmount < 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Deposits & Balance
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage member deposits and track balances
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Deposits
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(totalDeposits)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Expenses
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(mealCost?.total_cost || 0)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    currentBalance >= 0
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600",
                  )}
                >
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Current Balance
                  </p>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      currentBalance >= 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(currentBalance)
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
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Members
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      members.length
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Member Balance Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Member Balance Summary
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : memberBalances.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No member data available
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Member
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Deposits
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Meals
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Meal Cost
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Due / Credit
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberBalances.map((balance) => {
                      const isDue = balance.dueAmount > 0;
                      const isCredit = balance.dueAmount < 0;
                      return (
                        <tr
                          key={balance.member.user_id}
                          className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                {balance.member.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                {balance.member.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-white">
                            {formatCurrency(balance.totalDeposits)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-white">
                            {balance.totalMeals}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-white">
                            {formatCurrency(balance.mealCost)}
                          </td>
                          <td
                            className={cn(
                              "py-3 px-4 text-sm text-right font-semibold",
                              isDue && "text-red-600",
                              isCredit && "text-green-600",
                              !isDue &&
                                !isCredit &&
                                "text-neutral-900 dark:text-white",
                            )}
                          >
                            {isDue
                              ? `+${formatCurrency(balance.dueAmount)}`
                              : isCredit
                                ? formatCurrency(balance.dueAmount)
                                : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isDue ? (
                              <Badge variant="error">Due</Badge>
                            ) : isCredit ? (
                              <Badge variant="success">Credit</Badge>
                            ) : (
                              <Badge variant="neutral">Settled</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Due Summary */}
        {!isLoading && membersWithDue.length > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-red-600">
                  Members with Outstanding Dues
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {membersWithDue.map((member) => (
                  <div
                    key={member.member.user_id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {member.member.full_name}
                    </span>
                    <span className="font-bold text-red-600">
                      Due: {formatCurrency(member.dueAmount)}
                    </span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      Total Outstanding
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(
                        membersWithDue.reduce((sum, m) => sum + m.dueAmount, 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Credit Summary */}
        {!isLoading && membersWithCredit.length > 0 && (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-green-600">
                  Members with Credit
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {membersWithCredit.map((member) => (
                  <div
                    key={member.member.user_id}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {member.member.full_name}
                    </span>
                    <span className="font-bold text-green-600">
                      Credit: {formatCurrency(Math.abs(member.dueAmount))}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Deposit Entry Form */}
        {isManager && (
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Add Deposit
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={depositForm.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    label="Member"
                    placeholder="Select member"
                    value={depositForm.values.member_id}
                    onChange={(value) =>
                      depositForm.setValues({
                        ...depositForm.values,
                        member_id: value,
                      })
                    }
                    error={
                      depositForm.touched.member_id
                        ? depositForm.errors.member_id
                        : undefined
                    }
                    options={memberOptions}
                  />
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={depositForm.values.amount}
                    onChange={depositForm.handleChange}
                    onBlur={depositForm.handleBlur}
                    name="amount"
                    error={
                      depositForm.touched.amount
                        ? depositForm.errors.amount
                        : undefined
                    }
                  />
                  <DatePicker
                    label="Date"
                    value={depositForm.values.deposit_date}
                    onChange={(date) =>
                      depositForm.setValues({
                        ...depositForm.values,
                        deposit_date: date,
                      })
                    }
                    error={
                      depositForm.touched.deposit_date
                        ? depositForm.errors.deposit_date
                        : undefined
                    }
                  />
                  <Input
                    label="Note (Optional)"
                    placeholder="Add a note"
                    value={depositForm.values.note}
                    onChange={depositForm.handleChange}
                    onBlur={depositForm.handleBlur}
                    name="note"
                  />
                </div>
                <div className="mt-4">
                  <Button type="submit" isLoading={isSubmitting}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deposit
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Deposit History */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Deposit History
              </h2>
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select
                  placeholder="Filter by member"
                  value={filterMember}
                  onChange={setFilterMember}
                  options={[
                    { value: "", label: "All Members" },
                    ...memberOptions,
                  ]}
                  className="w-40"
                />
                <DatePicker
                  placeholder="Start date"
                  value={filterStartDate}
                  onChange={setFilterStartDate}
                  className="w-40"
                />
                <DatePicker
                  placeholder="End date"
                  value={filterEndDate}
                  onChange={setFilterEndDate}
                  className="w-40"
                />
                {(filterMember || filterStartDate || filterEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterMember("");
                      setFilterStartDate("");
                      setFilterEndDate("");
                      setCurrentPage(1);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : paginatedDeposits.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No deposits found
                </p>
                {isManager && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Add your first deposit above
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Member
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Note
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Amount
                        </th>
                        {isManager && (
                          <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDeposits.map((deposit) => {
                        const member = memberMap.get(deposit.member_id);
                        return (
                          <tr
                            key={deposit.id}
                            className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                              {format(
                                parseISO(deposit.deposit_date),
                                "MMM dd, yyyy",
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                                  {member?.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </div>
                                <span className="text-sm text-neutral-900 dark:text-white">
                                  {member?.full_name || "Unknown"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white max-w-xs truncate">
                              {deposit.note || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                              +{formatCurrency(deposit.amount)}
                            </td>
                            {isManager && (
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(deposit)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(deposit)}
                                  >
                                    <Trash2 className="h-4 w-4 text-error" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredDeposits.length,
                      )}{" "}
                      of {filteredDeposits.length} deposits
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDeposit(null);
        }}
        title="Edit Deposit"
      >
        <ModalBody>
          <form id="edit-form" onSubmit={editForm.handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Member
                </label>
                <p className="text-neutral-900 dark:text-white">
                  {selectedDeposit
                    ? memberMap.get(selectedDeposit.member_id)?.full_name
                    : ""}
                </p>
              </div>
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={editForm.values.amount}
                onChange={editForm.handleChange}
                onBlur={editForm.handleBlur}
                error={
                  editForm.touched.amount ? editForm.errors.amount : undefined
                }
              />
              <DatePicker
                label="Date"
                value={editForm.values.deposit_date}
                onChange={(date) =>
                  editForm.setValues({
                    ...editForm.values,
                    deposit_date: date,
                  })
                }
                error={
                  editForm.touched.deposit_date
                    ? editForm.errors.deposit_date
                    : undefined
                }
              />
              <Input
                label="Note (Optional)"
                name="note"
                value={editForm.values.note}
                onChange={editForm.handleChange}
                onBlur={editForm.handleBlur}
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedDeposit(null);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" form="edit-form" isLoading={isSubmitting}>
            Update
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDepositToDelete(null);
        }}
        title="Delete Deposit"
        description="Are you sure you want to delete this deposit? This action cannot be undone."
      >
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setDepositToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
