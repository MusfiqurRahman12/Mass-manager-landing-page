import { format, parseISO } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Droplets,
  Edit,
  Flame,
  MoreHorizontal,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Wrench,
  Zap,
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
import type { Expense, ExpenseCategory } from "../services";
import { expenseService } from "../services";
import { cn } from "../utils";
import { formatCurrency, formatNumber } from "../utils/format.utils";

// Types
interface ExpenseFormValues {
  category: string;
  amount: string;
  expense_date: string;
  description: string;
}

// Constants
const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
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
    value: "groceries",
    label: "Groceries",
    icon: ShoppingCart,
    color: "text-green-500 bg-green-100 dark:bg-green-900/30",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    icon: Wrench,
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    value: "cleaning",
    label: "Cleaning",
    icon: Droplets,
    color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    value: "water",
    label: "Water",
    icon: Droplets,
    color: "text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    value: "gas",
    label: "Gas",
    icon: Flame,
    color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-500 bg-gray-100 dark:bg-gray-900/30",
  },
];

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({
  value: c.value,
  label: c.label,
}));

const ITEMS_PER_PAGE = 10;

export function ExpensesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const expensesData = await expenseService.getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      toast.error("Failed to load expenses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered and paginated expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (filterCategory) {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }

    if (filterStartDate) {
      filtered = filtered.filter((e) => e.expense_date >= filterStartDate);
    }

    if (filterEndDate) {
      filtered = filtered.filter((e) => e.expense_date <= filterEndDate);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.expense_date).getTime();
        const dateB = new Date(b.expense_date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return filtered;
  }, [
    expenses,
    filterCategory,
    filterStartDate,
    filterEndDate,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Summary calculations
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [expenses]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [categoryTotals]);

  const thisMonthExpenses = useMemo(() => {
    const currentMonth = format(new Date(), "yyyy-MM");
    return expenses.filter((e) => e.expense_date.startsWith(currentMonth));
  }, [expenses]);

  const thisMonthTotal = useMemo(() => {
    return thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [thisMonthExpenses]);

  // Forms
  const expenseForm = useForm<ExpenseFormValues>({
    initialValues: {
      category: "",
      amount: "",
      expense_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.category) errors.category = "Please select a category";
      if (!values.amount) errors.amount = "Please enter an amount";
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be greater than 0";
      }
      if (!values.expense_date) errors.expense_date = "Please select a date";
      if (!values.description.trim()) {
        errors.description = "Please enter a description";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) {
        toast.error("Only managers can add expenses");
        return;
      }
      setIsSubmitting(true);
      try {
        await expenseService.addExpense({
          category: values.category as ExpenseCategory,
          amount: parseFloat(values.amount),
          expense_date: values.expense_date,
          description: values.description.trim(),
        });
        toast.success("Expense added successfully");
        await fetchData();
        expenseForm.resetForm();
        expenseForm.setValues({
          category: "",
          amount: "",
          expense_date: format(new Date(), "yyyy-MM-dd"),
          description: "",
        });
      } catch (error) {
        toast.error("Failed to add expense");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const editForm = useForm<ExpenseFormValues>({
    initialValues: {
      category: "",
      amount: "",
      expense_date: "",
      description: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.category) errors.category = "Please select a category";
      if (!values.amount) errors.amount = "Please enter an amount";
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be greater than 0";
      }
      if (!values.expense_date) errors.expense_date = "Please select a date";
      if (!values.description.trim()) {
        errors.description = "Please enter a description";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager || !selectedExpense) return;
      setIsSubmitting(true);
      try {
        await expenseService.updateExpense(selectedExpense.id, {
          category: values.category as ExpenseCategory,
          amount: parseFloat(values.amount),
          expense_date: values.expense_date,
          description: values.description.trim(),
        });
        toast.success("Expense updated successfully");
        await fetchData();
        setIsEditModalOpen(false);
        setSelectedExpense(null);
      } catch (error) {
        toast.error("Failed to update expense");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handlers
  const handleEdit = (expense: Expense) => {
    if (!isManager) {
      toast.error("Only managers can edit expenses");
      return;
    }
    setSelectedExpense(expense);
    editForm.setValues({
      category: expense.category,
      amount: expense.amount.toString(),
      expense_date: expense.expense_date,
      description: expense.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    if (!isManager) {
      toast.error("Only managers can delete expenses");
      return;
    }
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !expenseToDelete) return;
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      toast.success("Expense deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error(error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    if (!cat) return MoreHorizontal;
    return cat.icon;
  };

  const getCategoryColor = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    if (!cat) return "text-gray-500 bg-gray-100 dark:bg-gray-900/30";
    return cat.color;
  };

  const getCategoryLabel = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    return cat?.label || category;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Expense Management
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track and manage mess expenses
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(totalExpenses)
                    )}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(thisMonthTotal)
                    )}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Top Category
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : topCategory ? (
                      getCategoryLabel(topCategory[0])
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Expense Count
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      formatNumber(expenses.length)
                    )}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Category Breakdown */}
        {!isLoading && Object.keys(categoryTotals).length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Category Breakdown
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const amount = categoryTotals[cat.value] || 0;
                  if (amount === 0) return null;
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.value}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg inline-flex mb-2",
                          cat.color,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {cat.label}
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Expense Entry Form */}
        {isManager && (
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Add Expense
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={expenseForm.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Select
                    label="Category"
                    placeholder="Select category"
                    value={expenseForm.values.category}
                    onChange={(value) =>
                      expenseForm.setValues({
                        ...expenseForm.values,
                        category: value,
                      })
                    }
                    error={
                      expenseForm.touched.category
                        ? expenseForm.errors.category
                        : undefined
                    }
                    options={CATEGORY_OPTIONS}
                  />
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={expenseForm.values.amount}
                    onChange={expenseForm.handleChange}
                    onBlur={expenseForm.handleBlur}
                    name="amount"
                    error={
                      expenseForm.touched.amount
                        ? expenseForm.errors.amount
                        : undefined
                    }
                  />
                  <DatePicker
                    label="Date"
                    value={expenseForm.values.expense_date}
                    onChange={(date) =>
                      expenseForm.setValues({
                        ...expenseForm.values,
                        expense_date: date,
                      })
                    }
                    error={
                      expenseForm.touched.expense_date
                        ? expenseForm.errors.expense_date
                        : undefined
                    }
                  />
                  <Input
                    label="Description"
                    placeholder="Enter description"
                    value={expenseForm.values.description}
                    onChange={expenseForm.handleChange}
                    onBlur={expenseForm.handleBlur}
                    name="description"
                    error={
                      expenseForm.touched.description
                        ? expenseForm.errors.description
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
                      Add Expense
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Expense List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Expense Records
              </h2>
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select
                  placeholder="Filter by category"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={[
                    { value: "", label: "All Categories" },
                    ...CATEGORY_OPTIONS,
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
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split(
                      "-",
                    ) as ["date" | "amount", "asc" | "desc"];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="px-3 py-2 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
                {(filterCategory || filterStartDate || filterEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterCategory("");
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
            ) : paginatedExpenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No expenses found
                </p>
                {isManager && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Add your first expense above
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
                          Category
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Description
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
                      {paginatedExpenses.map((expense) => {
                        const Icon = getCategoryIcon(expense.category);
                        const colorClass = getCategoryColor(expense.category);
                        return (
                          <tr
                            key={expense.id}
                            className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                              {format(
                                parseISO(expense.expense_date),
                                "MMM dd, yyyy",
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn("p-1.5 rounded", colorClass)}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm text-neutral-900 dark:text-white capitalize">
                                  {getCategoryLabel(expense.category)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white max-w-xs truncate">
                              {expense.description}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right font-medium">
                              {formatCurrency(expense.amount)}
                            </td>
                            {isManager && (
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(expense)}
                                  >
                                    <Edit className="h-4 w-4" />
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
                        filteredExpenses.length,
                      )}{" "}
                      of {filteredExpenses.length} expenses
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
          setSelectedExpense(null);
        }}
        title="Edit Expense"
      >
        <ModalBody>
          <form id="edit-form" onSubmit={editForm.handleSubmit}>
            <div className="space-y-4">
              <Select
                label="Category"
                value={editForm.values.category}
                onChange={(value) =>
                  editForm.setValues({ ...editForm.values, category: value })
                }
                error={
                  editForm.touched.category
                    ? editForm.errors.category
                    : undefined
                }
                options={CATEGORY_OPTIONS}
              />
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
                value={editForm.values.expense_date}
                onChange={(date) =>
                  editForm.setValues({ ...editForm.values, expense_date: date })
                }
                error={
                  editForm.touched.expense_date
                    ? editForm.errors.expense_date
                    : undefined
                }
              />
              <Input
                label="Description"
                name="description"
                value={editForm.values.description}
                onChange={editForm.handleChange}
                onBlur={editForm.handleBlur}
                error={
                  editForm.touched.description
                    ? editForm.errors.description
                    : undefined
                }
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedExpense(null);
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
          setExpenseToDelete(null);
        }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
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
