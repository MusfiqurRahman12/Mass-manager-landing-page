import { format, parseISO } from "date-fns";
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Percent,
  Plus,
  Trash2,
  Users,
  Wifi,
  Zap,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
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
import type {
  UtilityExpense,
  UtilityType,
  AddUtilityPayload,
  ShareType,
} from "../services";
import { expenseApi, memberService, type Member } from "../services";
import { formatCurrency } from "../utils/format.utils";
import { cn } from "../utils";

interface UtilityFormValues {
  utility_type: string;
  total_amount: string;
  share_type: string;
  expense_date: string;
  description: string;
}

const UTILITY_OPTIONS: {
  value: UtilityType;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    value: "electricity",
    label: "Electricity",
    icon: Zap,
    color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    value: "gas",
    label: "Gas",
    icon: Flame,
    color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    value: "water",
    label: "Water",
    icon: Droplets,
    color: "text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    value: "internet",
    label: "Internet",
    icon: Wifi,
    color: "text-green-500 bg-green-100 dark:bg-green-900/30",
  },
  {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-500 bg-gray-100 dark:bg-gray-900/30",
  },
];

const ITEMS_PER_PAGE = 10;

export function UtilityExpensesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [utilities, setUtilities] = useState<UtilityExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<UtilityExpense | null>(null);
  const [previewData, setPreviewData] = useState<{
    total_amount: number;
    share_type: ShareType;
    member_shares: { member_id: string; member_name: string; amount: number; percentage: number | null }[];
  } | null>(null);
  const [memberShares, setMemberShares] = useState<Record<string, { amount: string; percentage: string }>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("");

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: { month_id?: string; utility_type?: UtilityType } = {};
      if (filterType) {
        params.utility_type = filterType as UtilityType;
      }
      const [membersData, data] = await Promise.all([
        memberService.getMembers(),
        expenseApi.getUtilityExpenses(params),
      ]);
      setMembers(membersData.filter(m => m.is_active));
      setUtilities(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load utility expenses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (members.length > 0) {
      const initialShares: Record<string, { amount: string; percentage: string }> = {};
      const equalPercentage = (100 / members.length).toFixed(2);
      
      members.forEach(member => {
        initialShares[member.user_id] = {
          amount: "",
          percentage: equalPercentage
        };
      });
      setMemberShares(initialShares);
    }
  }, [members]);

  useEffect(() => {
    fetchData();
  }, [filterType]);

  // Filtered and paginated expenses
  const filteredUtilities = useMemo(() => {
    if (!filterType) return utilities;
    return utilities.filter((u) => u.utility_type === filterType);
  }, [utilities, filterType]);

  const totalPages = Math.ceil(filteredUtilities.length / ITEMS_PER_PAGE);
  const paginatedUtilities = filteredUtilities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Summary calculations
  const totalUtilities = useMemo(() => {
    return utilities.reduce((sum, u) => sum + u.total_amount, 0);
  }, [utilities]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    utilities.forEach((u) => {
      totals[u.utility_type] = (totals[u.utility_type] || 0) + u.total_amount;
    });
    return totals;
  }, [utilities]);

  // Forms
  const utilityForm = useForm<UtilityFormValues>({
    initialValues: {
      utility_type: "electricity",
      total_amount: "",
      share_type: "equal",
      expense_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.utility_type) errors.utility_type = "Please select a utility type";
      if (!values.total_amount) errors.total_amount = "Please enter an amount";
      const amount = parseFloat(values.total_amount);
      if (isNaN(amount) || amount <= 0) {
        errors.total_amount = "Amount must be greater than 0";
      }
      if (!values.share_type) errors.share_type = "Please select a share type";
      if (!values.expense_date) errors.expense_date = "Please select a date";
      if (!values.description.trim()) {
        errors.description = "Please enter a description";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) {
        toast.error("Only managers can add utility expenses");
        return;
      }
      setIsSubmitting(true);
      try {
        const payload: AddUtilityPayload = {
          utility_type: values.utility_type as UtilityType,
          total_amount: parseFloat(values.total_amount),
          share_type: values.share_type as ShareType,
          description: values.description.trim(),
          expense_date: values.expense_date,
        };

        if (values.share_type === "percentage" || values.share_type === "manual") {
          payload.member_shares = members.map(m => {
            const share = memberShares[m.user_id];
            return {
              member_id: m.user_id,
              amount: values.share_type === "manual" ? parseFloat(share.amount || "0") : undefined,
              percentage: values.share_type === "percentage" ? parseFloat(share.percentage || "0") : undefined,
            };
          });
        }

        await expenseApi.addUtilityExpense(payload);
        toast.success("Utility expense added successfully");
        await fetchData();
        utilityForm.resetForm();
        setIsPreviewModalOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add utility expense");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Preview handler
  const handlePreview = async () => {
    if (!utilityForm.validateForm()) {
      return;
    }

    const totalAmount = parseFloat(utilityForm.values.total_amount);
    const shareType = utilityForm.values.share_type as ShareType;

    try {
      let preview;

      if (shareType === "equal") {
        preview = await expenseApi.getUtilityPreview({
          total_amount: totalAmount,
          share_type: shareType,
        });
      } else {
        const memberSharesPayload = members.map(m => {
          const share = memberShares[m.user_id];
          return {
            member_id: m.user_id,
            amount: shareType === "manual" ? parseFloat(share.amount || "0") : undefined,
            percentage: shareType === "percentage" ? parseFloat(share.percentage || "0") : undefined,
          };
        });
        preview = await expenseApi.getUtilityPreview({
          total_amount: totalAmount,
          share_type: shareType,
          member_shares: memberSharesPayload,
        });
      }

      setPreviewData({
        total_amount: preview.total_amount,
        share_type: preview.share_type,
        member_shares: preview.member_shares,
      });
      setIsPreviewModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to preview division");
      console.error(error);
    }
  };

  const confirmAndSubmit = () => {
    if (utilityForm.values.share_type !== "equal" && previewData) {
      setIsPreviewModalOpen(false);
      utilityForm.handleSubmit();
    } else {
      utilityForm.handleSubmit();
    }
  };

  // Handlers
  const handleDelete = (expense: UtilityExpense) => {
    if (!isManager) {
      toast.error("Only managers can delete utility expenses");
      return;
    }
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !expenseToDelete) return;
    try {
      await expenseApi.deleteUtilityExpense(expenseToDelete.id);
      toast.success("Utility expense deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete utility expense");
      console.error(error);
    }
  };

  const getUtilityIcon = (type: string) => {
    const util = UTILITY_OPTIONS.find((u) => u.value === type);
    if (!util) return MoreHorizontal;
    return util.icon;
  };

  const getCategoryColor = (type: string) => {
    const util = UTILITY_OPTIONS.find((u) => u.value === type);
    if (!util) return "text-gray-500 bg-gray-100 dark:bg-gray-900/30";
    return util.color;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Utility Expenses
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage electricity, gas, water, and internet bills
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Utilities
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(totalUtilities)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {UTILITY_OPTIONS.map((util) => {
            const Icon = util.icon;
            const amount = categoryTotals[util.value] || 0;
            return (
              <Card key={util.value}>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-lg", util.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {util.label}
                      </p>
                      <div className="text-xl font-bold text-neutral-900 dark:text-white">
                        {isLoading ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          formatCurrency(amount)
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Add Utility Form */}
        {isManager && (
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Add Utility Expense
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <Select
                    label="Utility Type"
                    placeholder="Select type"
                    value={utilityForm.values.utility_type}
                    onChange={(value) =>
                      utilityForm.setValues({ ...utilityForm.values, utility_type: value })
                    }
                    options={[
                      { value: "electricity", label: "Electricity" },
                      { value: "gas", label: "Gas" },
                      { value: "water", label: "Water" },
                      { value: "internet", label: "Internet" },
                      { value: "other", label: "Other" },
                    ]}
                    error={
                      utilityForm.touched.utility_type
                        ? utilityForm.errors.utility_type
                        : undefined
                    }
                  />
                  <Input
                    label="Total Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter total bill"
                    value={utilityForm.values.total_amount}
                    onChange={utilityForm.handleChange}
                    onBlur={utilityForm.handleBlur}
                    name="total_amount"
                    error={
                      utilityForm.touched.total_amount
                        ? utilityForm.errors.total_amount
                        : undefined
                    }
                  />
                  <Select
                    label="Division Method"
                    placeholder="Select method"
                    value={utilityForm.values.share_type}
                    onChange={(value) =>
                      utilityForm.setValues({ ...utilityForm.values, share_type: value })
                    }
                    options={[
                      { value: "equal", label: "Equal Division" },
                      { value: "percentage", label: "Percentage Based" },
                      { value: "manual", label: "Manual Amounts" },
                    ]}
                    error={
                      utilityForm.touched.share_type
                        ? utilityForm.errors.share_type
                        : undefined
                    }
                  />
                  <DatePicker
                    label="Date"
                    value={utilityForm.values.expense_date}
                    onChange={(date) =>
                      utilityForm.setValues({ ...utilityForm.values, expense_date: date })
                    }
                    error={
                      utilityForm.touched.expense_date
                        ? utilityForm.errors.expense_date
                        : undefined
                    }
                  />
                  <Input
                    label="Description"
                    placeholder="e.g., May 2025 bill"
                    value={utilityForm.values.description}
                    onChange={utilityForm.handleChange}
                    onBlur={utilityForm.handleBlur}
                    name="description"
                    error={
                      utilityForm.touched.description
                        ? utilityForm.errors.description
                        : undefined
                    }
                  />
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full"
                      variant="primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Preview & Add
                    </Button>
                  </div>
                </div>

                {/* Division Details (Manual/Percentage) */}
                {utilityForm.values.share_type !== "equal" && (
                  <div className="mt-6 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        {utilityForm.values.share_type === "percentage" ? (
                          <>
                            <Percent className="h-5 w-5 text-purple-500" />
                            Percentage Division Details
                          </>
                        ) : (
                          <>
                            <Calculator className="h-5 w-5 text-green-500" />
                            Manual Amount Details
                          </>
                        )}
                      </h3>
                      
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        utilityForm.values.share_type === "percentage" 
                          ? (Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.percentage || "0"), 0) === 100 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")
                          : (Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0) === parseFloat(utilityForm.values.total_amount || "0") ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")
                      )}>
                        {utilityForm.values.share_type === "percentage" 
                          ? `Total: ${Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.percentage || "0"), 0).toFixed(1)}% / 100%`
                          : `Total: ${formatCurrency(Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0))} / ${formatCurrency(parseFloat(utilityForm.values.total_amount || "0"))}`
                        }
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map((member) => (
                        <div 
                          key={member.user_id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md"
                        >
                          <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-500">
                            {member.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {member.full_name}
                            </p>
                            <div className="mt-1">
                              {utilityForm.values.share_type === "percentage" ? (
                                <div className="relative">
                                  <input
                                    type="number"
                                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-purple-500 outline-none text-sm py-1 pr-6 transition-colors"
                                    placeholder="0"
                                    value={memberShares[member.user_id]?.percentage || ""}
                                    onChange={(e) => setMemberShares({
                                      ...memberShares,
                                      [member.user_id]: { ...memberShares[member.user_id], percentage: e.target.value }
                                    })}
                                  />
                                  <span className="absolute right-0 top-1 text-xs text-neutral-400">%</span>
                                </div>
                              ) : (
                                <div className="relative">
                                  <span className="absolute left-0 top-1 text-xs text-neutral-400">৳</span>
                                  <input
                                    type="number"
                                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-green-500 outline-none text-sm py-1 pl-4 transition-colors"
                                    placeholder="0"
                                    value={memberShares[member.user_id]?.amount || ""}
                                    onChange={(e) => setMemberShares({
                                      ...memberShares,
                                      [member.user_id]: { ...memberShares[member.user_id], amount: e.target.value }
                                    })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equal Division Info */}
                {utilityForm.values.share_type === "equal" && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300">
                          Equal Division
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          Utility will be divided equally among {members.length} active members.
                          {utilityForm.values.total_amount && (
                            <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 font-bold">
                              {formatCurrency(parseFloat(utilityForm.values.total_amount) / members.length)} / each
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </CardBody>
          </Card>
        )}

        {/* Utility List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Utility Records
              </h2>
              {/* Filter */}
              <Select
                placeholder="Filter by type"
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: "", label: "All Types" },
                  { value: "electricity", label: "Electricity" },
                  { value: "gas", label: "Gas" },
                  { value: "water", label: "Water" },
                  { value: "internet", label: "Internet" },
                  { value: "other", label: "Other" },
                ]}
                className="w-40"
              />
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : paginatedUtilities.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No utility expenses found
                </p>
                {isManager && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Add your first utility expense above
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
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Description
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Division
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Members
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Total Amount
                        </th>
                        {isManager && (
                          <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUtilities.map((expense) => {
                        const Icon = getUtilityIcon(expense.utility_type);
                        const colorClass = getCategoryColor(expense.utility_type);
                        return (
                          <tr
                            key={expense.id}
                            className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                              {format(parseISO(expense.expense_date), "MMM dd, yyyy")}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded", colorClass)}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm text-neutral-900 dark:text-white capitalize">
                                  {expense.utility_type}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white max-w-xs truncate">
                              {expense.description}
                            </td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                "px-2 py-1 rounded text-xs font-medium capitalize",
                                (!expense.share_type || expense.share_type === "equal") && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                expense.share_type === "percentage" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                expense.share_type === "manual" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              )}>
                                {expense.share_type || "equal"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {expense.member_shares.length} members
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right font-medium">
                              {formatCurrency(expense.total_amount)}
                            </td>
                            {isManager && (
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(expense)}
                                >
                                  <Trash2 className="h-4 w-4 text-error" />
                                </Button>
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
                        filteredUtilities.length,
                      )}{" "}
                      of {filteredUtilities.length} expenses
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Preview Utility Division"
      >
        <ModalBody>
          {previewData && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(previewData.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Division Method:
                  </span>
                  <span className="capitalize font-medium text-neutral-900 dark:text-white">
                    {previewData.share_type}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Member</th>
                      <th className="px-4 py-3 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Share</th>
                      <th className="px-4 py-3 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {previewData.member_shares.map((share) => (
                      <tr key={share.member_id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-neutral-900 dark:text-white">{share.member_name}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                            {share.percentage !== null ? `${share.percentage.toFixed(1)}%` : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-neutral-900 dark:text-white">
                          {formatCurrency(share.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-100/50 dark:bg-neutral-800/50 border-t-2 border-neutral-200 dark:border-neutral-700">
                    <tr>
                      <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white underline decoration-primary underline-offset-4">Total Amount</td>
                      <td className="px-4 py-3 text-right"></td>
                      <td className="px-4 py-3 text-right font-black text-xl text-primary">
                        {formatCurrency(previewData.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsPreviewModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            onClick={confirmAndSubmit}
          >
            Confirm & Add
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        title="Delete Utility Expense"
        description="Are you sure you want to delete this utility expense? This will also delete all member shares."
      >
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setExpenseToDelete(null);
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
