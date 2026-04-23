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
  MemberShareInput,
  ShareType,
  AddHomeRentPayload,
} from "../services";
import { expenseApi, memberService, type Member } from "../services";
import { formatCurrency } from "../utils/format.utils";
import { cn } from "../utils";

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

  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [rentExpenses, setRentExpenses] = useState<HomeRentExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<HomeRentExpense | null>(null);
  const [previewData, setPreviewData] = useState<{
    total_amount: number;
    share_type: ShareType;
    member_shares: { member_id: string; member_name: string; amount: number; percentage: number | null }[];
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, rentData] = await Promise.all([
        memberService.getMembers(),
        expenseApi.getHomeRentExpenses(),
      ]);
      setMembers(membersData.filter(m => m.is_active));
      setRentExpenses(rentData);
    } catch (error) {
      toast.error("Failed to load home rent data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Paginated expenses
  const totalPages = Math.ceil(rentExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = rentExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Forms
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
        toast.error("Only managers can add home rent");
        return;
      }
      setIsSubmitting(true);
      try {
        const payload: AddHomeRentPayload = {
          total_amount: parseFloat(values.total_amount),
          share_type: values.share_type as ShareType,
          description: values.description.trim(),
          expense_date: values.expense_date,
        };

        // Add member shares for percentage or manual
        if (values.share_type === "percentage" || values.share_type === "manual") {
          payload.member_shares = calculateMemberShares(
            members,
            parseFloat(values.total_amount),
            values.share_type as ShareType
          );
        }

        await expenseApi.addHomeRent(payload);
        toast.success("Home rent added successfully");
        await fetchData();
        rentForm.resetForm();
        setIsPreviewModalOpen(false);
      } catch (error) {
        toast.error("Failed to add home rent");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Calculate member shares based on type
  const calculateMemberShares = (
    members: Member[],
    totalAmount: number,
    shareType: ShareType
  ): MemberShareInput[] => {
    const equalShare = totalAmount / members.length;

    return members.map((member) => {
      if (shareType === "equal") {
        return { member_id: member.user_id, amount: equalShare };
      } else if (shareType === "percentage") {
        // Default to equal percentage
        return { member_id: member.user_id, percentage: 100 / members.length };
      } else {
        // Manual - default to equal
        return { member_id: member.user_id, amount: equalShare };
      }
    });
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
        const memberShares = calculateMemberShares(members, totalAmount, shareType);
        preview = await expenseApi.getHomeRentPreview({
          total_amount: totalAmount,
          share_type: shareType,
          member_shares: memberShares,
        });
      }

      setPreviewData({
        total_amount: preview.total_amount,
        share_type: preview.share_type,
        member_shares: preview.member_shares,
      });
      setIsPreviewModalOpen(true);
    } catch (error) {
      toast.error("Failed to preview rent division");
      console.error(error);
    }
  };

  const handleDelete = (expense: HomeRentExpense) => {
    if (!isManager) {
      toast.error("Only managers can delete home rent");
      return;
    }
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !expenseToDelete) return;
    try {
      await expenseApi.deleteHomeRent(expenseToDelete.id);
      toast.success("Home rent deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      toast.error("Failed to delete home rent");
      console.error(error);
    }
  };

  const confirmAndSubmit = () => {
    if (rentForm.values.share_type !== "equal" && previewData) {
      // For percentage/manual, user needs to confirm the preview first
      setIsPreviewModalOpen(false);
      rentForm.handleSubmit();
    } else {
      // For equal, submit directly
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
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Rent
                    </p>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(
                        rentExpenses.reduce((sum, e) => sum + e.total_amount, 0)
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Active Members
                    </p>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {members.length}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Rent Entries
                    </p>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
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
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Add Home Rent
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      isLoading={isSubmitting}
                      className="w-full"
                      variant="primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Preview & Add
                    </Button>
                  </div>
                </div>

                {/* Share Type Info */}
                {rentForm.values.share_type && (
                  <div className="mt-4 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <div className="flex items-start gap-3">
                      {rentForm.values.share_type === "equal" && (
                        <>
                          <Users className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              Equal Division
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Rent will be divided equally among {members.length} active members.
                              {rentForm.values.total_amount && (
                                <span className="block mt-1">
                                  Each member:{" "}
                                  <span className="font-semibold">
                                    {formatCurrency(parseFloat(rentForm.values.total_amount) / members.length)}
                                  </span>
                                </span>
                              )}
                            </p>
                          </div>
                        </>
                      )}
                      {rentForm.values.share_type === "percentage" && (
                        <>
                          <Percent className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              Percentage Based
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Each member gets a percentage share. Default is equal percentage.
                              You can adjust percentages in the preview.
                            </p>
                          </div>
                        </>
                      )}
                      {rentForm.values.share_type === "manual" && (
                        <>
                          <Calculator className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              Manual Amounts
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Specify exact amount for each member.
                              Total must match the rent amount.
                            </p>
                          </div>
                        </>
                      )}
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

              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                  Member-wise Breakdown
                </h3>
                <div className="space-y-2">
                  {previewData.member_shares.map((share) => (
                    <div
                      key={share.member_id}
                      className="flex justify-between items-center p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {share.member_name}
                        </p>
                        {share.percentage !== null && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {share.percentage.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(share.amount)}
                      </p>
                    </div>
                  ))}
                </div>
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
