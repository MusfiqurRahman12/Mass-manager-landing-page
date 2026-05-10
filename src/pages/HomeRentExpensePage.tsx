import { format, parseISO } from "date-fns";
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  Home,
  Percent,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  HomeRentExpense,
  ShareType,
  AddHomeRentPayload,
} from "../services";
import { expenseApi, type Member } from "../services";
import { formatCurrency } from "../utils/format.utils";
import { cn } from "../utils";
import { useHomeRentExpenses, useAddHomeRent, useDeleteHomeRent, useUpdateHomeRent } from "../hooks/queries/useExpenseQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import { useMonthHistory } from "../hooks/queries/useMonthQueries";


interface HomeRentFormValues {
  total_amount: string;
  share_type: string;
  expense_date: string;
  description: string;
}



const ITEMS_PER_PAGE = 10;

export function HomeRentExpensePage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  // UI-only state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<HomeRentExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<HomeRentExpense | null>(null);
  const [previewData, setPreviewData] = useState<{
    total_amount: number;
    share_type: ShareType;
    member_shares: { member_id: string; member_name: string; amount: number; percentage: number | null }[];
  } | null>(null);
  const [memberShares, setMemberShares] = useState<Record<string, { amount: string; percentage: string }>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // ── Data Queries ──────────────────────────────────────────────────────────
  const { data: allMembers = [] as Member[], isLoading: membersLoading } = useMembers();
  const members = allMembers.filter(m => m.is_active);
  const { data: rentExpenses = [] as HomeRentExpense[], isLoading: rentLoading } = useHomeRentExpenses();
  const isLoading = membersLoading || rentLoading;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addHomeRent = useAddHomeRent();
  const updateHomeRent = useUpdateHomeRent();
  const deleteHomeRent = useDeleteHomeRent();

  // For Import from Previous Month
  const { data: monthHistory = [] } = useMonthHistory(5, 0);
  const pastMonths = monthHistory.filter(m => !m.is_active);
  const previousMonthId = pastMonths.length > 0 ? pastMonths[0].id : undefined;
  
  // We unconditionally call the hook. React Query handles the disabled/enabled internally, 
  // or we can just fetch if we have a previousMonthId
  const { data: previousMonthExpenses = [], isLoading: previousMonthLoading } = useHomeRentExpenses(previousMonthId);

  // Initialise member shares when members load
  useEffect(() => {
    if (members.length > 0) {
      const initialShares: Record<string, { amount: string; percentage: string }> = {};
      const equalPercentage = (100 / members.length).toFixed(2);
      members.forEach(member => {
        initialShares[member.user_id] = { amount: "", percentage: equalPercentage };
      });
      setMemberShares(initialShares);
    }
  }, [members.length]);



  // Paginated expenses
  const totalPages = Math.ceil(rentExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = rentExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const rentForm = useForm<HomeRentFormValues>({
    initialValues: {
      total_amount: "",
      share_type: "equal",
      expense_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.total_amount) errors.total_amount = "Please enter total amount";
      const amount = parseFloat(values.total_amount);
      if (isNaN(amount) || amount <= 0) errors.total_amount = "Amount must be greater than 0";
      if (!values.share_type) errors.share_type = "Please select a share type";
      if (!values.expense_date) errors.expense_date = "Please select a date";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) { toast.error("Only managers can add home rent"); return; }
      const payload: AddHomeRentPayload = {
        total_amount: parseFloat(values.total_amount),
        share_type: values.share_type as ShareType,
        expense_date: values.expense_date,
      };
      if (values.description?.trim()) {
        payload.description = values.description.trim();
      }
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
      await addHomeRent.mutateAsync(payload);
      rentForm.resetForm();
      setIsPreviewModalOpen(false);
    },
  });

  // Edit form setup
  const editForm = useForm<HomeRentFormValues>({
    initialValues: {
      total_amount: "",
      share_type: "equal",
      expense_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.total_amount) errors.total_amount = "Please enter total amount";
      const amount = parseFloat(values.total_amount);
      if (isNaN(amount) || amount <= 0) errors.total_amount = "Amount must be greater than 0";
      if (!values.share_type) errors.share_type = "Please select a share type";
      if (!values.expense_date) errors.expense_date = "Please select a date";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager || !selectedExpense) return;
      const payload: Partial<AddHomeRentPayload> = {
        total_amount: parseFloat(values.total_amount),
        share_type: values.share_type as ShareType,
        expense_date: values.expense_date,
      };
      if (values.description?.trim()) {
        payload.description = values.description.trim();
      }
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
      await updateHomeRent.mutateAsync({ id: selectedExpense.id, payload });
      setIsEditModalOpen(false);
      setSelectedExpense(null);
    },
  });

  const handleEdit = (expense: HomeRentExpense) => {
    setSelectedExpense(expense);
    editForm.setValues({
      total_amount: expense.total_amount.toString(),
      share_type: expense.share_type,
      expense_date: expense.expense_date,
      description: expense.description || "",
    });
    
    // Set member shares
    const newShares: Record<string, { amount: string; percentage: string }> = {};
    const equalPercentage = (100 / members.length).toFixed(2);
    
    members.forEach(member => {
      const memberShare = expense.member_shares.find(s => s.member_id === member.user_id);
      newShares[member.user_id] = {
        amount: memberShare ? memberShare.amount.toString() : "",
        percentage: memberShare && memberShare.percentage ? memberShare.percentage.toString() : equalPercentage,
      };
    });
    setMemberShares(newShares);
    setIsEditModalOpen(true);
  };

  const handleImportExpense = (expense: HomeRentExpense) => {
    rentForm.setValues({
      total_amount: expense.total_amount.toString(),
      share_type: expense.share_type,
      expense_date: format(new Date(), "yyyy-MM-dd"), // Use today's date for imported
      description: (expense.description || "Rent") + " (Imported)",
    });

    // Populate shares based on the imported expense
    const newShares: Record<string, { amount: string; percentage: string }> = {};
    const equalPercentage = (100 / members.length).toFixed(2);
    
    members.forEach(member => {
      const memberShare = expense.member_shares.find(s => s.member_id === member.user_id);
      newShares[member.user_id] = {
        amount: memberShare ? memberShare.amount.toString() : "",
        percentage: memberShare && memberShare.percentage ? memberShare.percentage.toString() : equalPercentage,
      };
    });
    setMemberShares(newShares);
    setIsImportModalOpen(false);
    toast.success("Form populated with selected expense. Please review and add.");
  };


  // Preview handler
  const handlePreview = async () => {
    if (!rentForm.validateForm()) {
      return;
    }

    const totalAmount = parseFloat(rentForm.values.total_amount);
    const shareType = rentForm.values.share_type as ShareType;

    try {
      let preview;

      if (shareType === "equal") {
        preview = await expenseApi.getHomeRentPreview({
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
        preview = await expenseApi.getHomeRentPreview({
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
      toast.error(error instanceof Error ? error.message : "Failed to preview rent division");
      console.error(error);
    }
  };

  const handleDelete = (expense: HomeRentExpense) => {
    if (!isManager) { toast.error("Only managers can delete home rent"); return; }
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !expenseToDelete) return;
    await deleteHomeRent.mutateAsync(expenseToDelete.id);
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  const confirmAndSubmit = () => {
    if (rentForm.values.share_type !== "equal" && previewData) {
      setIsPreviewModalOpen(false);
      rentForm.handleSubmit();
    } else {
      rentForm.handleSubmit();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Home Rent Expense
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage rent with flexible division options
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && rentExpenses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/5">
              <CardBody className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 shadow-sm shadow-blue-500/20">
                    <Home className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Total Rent
                    </p>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">
                      {formatCurrency(
                        rentExpenses.reduce((sum, e) => sum + e.total_amount, 0)
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/10 to-transparent dark:from-green-500/5">
              <CardBody className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 shadow-sm shadow-green-500/20">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Active Members
                    </p>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">
                      {members.length}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500/10 to-transparent dark:from-purple-500/5">
              <CardBody className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 shadow-sm shadow-purple-500/20">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Rent Entries
                    </p>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">
                      {rentExpenses.length}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

        )}

        {/* Add Rent Form */}
        {isManager && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Add Home Rent
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  disabled={pastMonths.length === 0}
                >
                  Import from Previous Month
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <Input
                    label="Total Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter total rent"
                    value={rentForm.values.total_amount}
                    onChange={rentForm.handleChange}
                    onBlur={rentForm.handleBlur}
                    name="total_amount"
                    error={
                      rentForm.touched.total_amount
                        ? rentForm.errors.total_amount
                        : undefined
                    }
                  />
                  <Select
                    label="Division Method"
                    placeholder="Select method"
                    value={rentForm.values.share_type}
                    onChange={(value) =>
                      rentForm.setValues({ ...rentForm.values, share_type: value })
                    }
                    options={[
                      { value: "equal", label: "Equal Division" },
                      { value: "percentage", label: "Percentage Based" },
                      { value: "manual", label: "Manual Amounts" },
                    ]}
                    error={
                      rentForm.touched.share_type
                        ? rentForm.errors.share_type
                        : undefined
                    }
                  />
                  <DatePicker
                    label="Date"
                    value={rentForm.values.expense_date}
                    onChange={(date) =>
                      rentForm.setValues({ ...rentForm.values, expense_date: date })
                    }
                    error={
                      rentForm.touched.expense_date
                        ? rentForm.errors.expense_date
                        : undefined
                    }
                  />
                  <Input
                    label="Description"
                    placeholder="e.g., May 2025 Rent"
                    value={rentForm.values.description}
                    onChange={rentForm.handleChange}
                    onBlur={rentForm.handleBlur}
                    name="description"
                    error={
                      rentForm.touched.description
                        ? rentForm.errors.description
                        : undefined
                    }
                  />
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      isLoading={addHomeRent.isPending}
                      className="w-full"
                      variant="primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Preview & Add
                    </Button>
                  </div>
                </div>

                {/* Division Details (Manual/Percentage) */}
                {rentForm.values.share_type !== "equal" && (
                  <div className="mt-6 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        {rentForm.values.share_type === "percentage" ? (
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
                        rentForm.values.share_type === "percentage" 
                          ? (Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.percentage || "0"), 0) === 100 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")
                          : (Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0) === parseFloat(rentForm.values.total_amount || "0") ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")
                      )}>
                        {rentForm.values.share_type === "percentage" 
                          ? `Total: ${Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.percentage || "0"), 0).toFixed(1)}% / 100%`
                          : `Total: ${formatCurrency(Object.values(memberShares).reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0))} / ${formatCurrency(parseFloat(rentForm.values.total_amount || "0"))}`
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
                              {rentForm.values.share_type === "percentage" ? (
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
                {rentForm.values.share_type === "equal" && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300">
                          Equal Division
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          Rent will be divided equally among {members.length} active members.
                          {rentForm.values.total_amount && (
                            <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 font-bold">
                              {formatCurrency(parseFloat(rentForm.values.total_amount) / members.length)} / each
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

        {/* Rent List */}
        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Home Rent Records
            </h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : paginatedExpenses.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No home rent records found
                </p>
                {isManager && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Add your first home rent above
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
                          Description
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Division
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Total Amount
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Members
                        </th>
                        {isManager && (
                          <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        >
                          <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                            {format(parseISO(expense.expense_date), "MMM dd, yyyy")}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white max-w-xs truncate">
                            {expense.description}
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium capitalize",
                              expense.share_type === "equal" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                              expense.share_type === "percentage" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                              expense.share_type === "manual" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            )}>
                              {expense.share_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right font-medium">
                            {formatCurrency(expense.total_amount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 text-right">
                            {expense.member_shares.length} members
                          </td>
                          {isManager && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(expense)}
                                >
                                  <Trash2 className="h-4 w-4 text-error" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
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
                        rentExpenses.length,
                      )}{" "}
                      of {rentExpenses.length} entries
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
        title="Preview Rent Division"
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
                      <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white underline decoration-primary underline-offset-4">Total Rent</td>
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
            isLoading={addHomeRent.isPending}
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
        title="Delete Home Rent"
        description="Are you sure you want to delete this home rent record? This will also delete all member shares."
      >
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setExpenseToDelete(null);
            }}
            disabled={deleteHomeRent.isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            isLoading={deleteHomeRent.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedExpense(null); }}
        title="Edit Home Rent"
      >
        <ModalBody>
          <form id="edit-rent-form" onSubmit={editForm.handleSubmit} className="space-y-4">
            <Input
              label="Total Amount"
              type="number"
              step="0.01"
              min="0"
              name="total_amount"
              value={editForm.values.total_amount}
              onChange={editForm.handleChange}
              onBlur={editForm.handleBlur}
              error={editForm.touched.total_amount ? editForm.errors.total_amount : undefined}
            />
            <Select
              label="Division Method"
              placeholder="Select method"
              value={editForm.values.share_type}
              onChange={(value) => editForm.setValues({ ...editForm.values, share_type: value })}
              options={[
                { value: "equal", label: "Equal Division" },
                { value: "percentage", label: "Percentage Based" },
                { value: "manual", label: "Manual Amounts" },
              ]}
              error={editForm.touched.share_type ? editForm.errors.share_type : undefined}
            />
            <DatePicker
              label="Date"
              value={editForm.values.expense_date}
              onChange={(date) => editForm.setValues({ ...editForm.values, expense_date: date })}
              error={editForm.touched.expense_date ? editForm.errors.expense_date : undefined}
            />
            <Input
              label="Description"
              name="description"
              value={editForm.values.description}
              onChange={editForm.handleChange}
              onBlur={editForm.handleBlur}
              error={editForm.touched.description ? editForm.errors.description : undefined}
            />

            {/* Division Details for Edit */}
            {editForm.values.share_type !== "equal" && (
              <div className="mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="text-sm font-semibold mb-3">Member Shares</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between gap-3 p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                      <span className="text-sm font-medium">{member.full_name}</span>
                      <div className="w-24">
                        {editForm.values.share_type === "percentage" ? (
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-sm outline-none"
                              placeholder="0"
                              value={memberShares[member.user_id]?.percentage || ""}
                              onChange={(e) => setMemberShares({
                                ...memberShares,
                                [member.user_id]: { ...memberShares[member.user_id], percentage: e.target.value }
                              })}
                            />
                            <span className="absolute right-2 top-1 text-xs text-neutral-400">%</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-2 top-1 text-xs text-neutral-400">৳</span>
                            <input
                              type="number"
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded pl-5 pr-2 py-1 text-sm outline-none"
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
                  ))}
                </div>
              </div>
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setIsEditModalOpen(false); setSelectedExpense(null); }}>Cancel</Button>
          <Button type="submit" form="edit-rent-form" isLoading={updateHomeRent.isPending}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import from Previous Month"
        description={pastMonths.length > 0 ? `Showing expenses from ${pastMonths[0].month_year}` : "No previous month found"}
      >
        <ModalBody>
          {previousMonthLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : previousMonthExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No home rent expenses found in the previous month.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {previousMonthExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary cursor-pointer transition-colors"
                  onClick={() => handleImportExpense(expense)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-white truncate pr-2">{expense.description}</h4>
                    <span className="font-bold text-primary">{formatCurrency(expense.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span className="capitalize bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">{expense.share_type}</span>
                    <span>{expense.member_shares.length} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

    </MainLayout>
  );
}
