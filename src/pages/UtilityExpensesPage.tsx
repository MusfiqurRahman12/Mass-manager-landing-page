import { format, parseISO } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Plus,
  Trash2,
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
} from "../services";
import { expenseApi } from "../services";
import { formatCurrency } from "../utils/format.utils";
import { cn } from "../utils";

interface UtilityFormValues {
  utility_type: string;
  total_amount: string;
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
  const [utilities, setUtilities] = useState<UtilityExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<UtilityExpense | null>(null);

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
      const data = await expenseApi.getUtilityExpenses(params);
      setUtilities(data);
    } catch (error) {
      toast.error("Failed to load utility expenses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
          description: values.description.trim(),
          expense_date: values.expense_date,
        };
        await expenseApi.addUtilityExpense(payload);
        toast.success("Utility expense added successfully");
        await fetchData();
        utilityForm.resetForm();
      } catch (error) {
        toast.error("Failed to add utility expense");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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
      toast.error("Failed to delete utility expense");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
                  <Zap className="h-5 w-5" />
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

          {UTILITY_OPTIONS.slice(0, 4).map((util) => {
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
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
              <form onSubmit={utilityForm.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Utility
                    </Button>
                  </div>
                </div>
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
