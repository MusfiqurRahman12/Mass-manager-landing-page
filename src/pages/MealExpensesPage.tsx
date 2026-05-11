import { format, parseISO } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  Utensils,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
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
  Skeleton,
  Badge,
} from "../components/common";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context";
import { useForm } from "../hooks/useForm";
import type {
  MealExpense,
  AddMealExpensePayload,
  Member,
} from "../services";

import { expenseApi } from "../services";
import { formatCurrency } from "../utils/format.utils";
import { useMealExpenses, useAddMealExpense, useUpdateMealExpense, useDeleteMealExpense } from "../hooks/queries/useExpenseQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import { useQueryClient } from "@tanstack/react-query";


interface MealExpenseFormValues {
  amount: string;
  expense_date: string;
  description: string;
  member_id?: string;
  add_deposit?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function MealExpensesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const qc = useQueryClient();

  // UI-only state
  const [selectedExpense, setSelectedExpense] = useState<MealExpense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<MealExpense | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [expenseToApprove, setExpenseToApprove] = useState<MealExpense | null>(null);
  const [addDeposit, setAddDeposit] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [spentByFilter, setSpentByFilter] = useState<string>("");

  // ── Data Queries ──────────────────────────────────────────────────────────
  const { data: mealData, isLoading } = useMealExpenses();
  const { data: members = [] as Member[] } = useMembers();

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addMealExpense = useAddMealExpense();
  const updateMealExpense = useUpdateMealExpense();
  const deleteMealExpense = useDeleteMealExpense();



  const expenses = mealData?.expenses || [];
  
  const filteredExpenses = spentByFilter
    ? expenses.filter(e => e.created_by === spentByFilter)
    : expenses;

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const addForm = useForm<MealExpenseFormValues>({
    initialValues: {
      amount: "",
      expense_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      member_id: "",
      add_deposit: true,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.amount) errors.amount = "Please enter an amount";
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) errors.amount = "Amount must be greater than 0";
      if (!values.expense_date) errors.expense_date = "Please select a date";
      if (!values.description.trim()) errors.description = "Please enter a description";
      return errors;
    },
    onSubmit: async (values) => {
      const payload: AddMealExpensePayload = {
        amount: parseFloat(values.amount),
        description: values.description.trim(),
        expense_date: values.expense_date,
      };
      if (isManager && values.member_id) {
        payload.member_id = values.member_id;
        payload.add_deposit = values.add_deposit;
      }
      await addMealExpense.mutateAsync(payload);
      addForm.resetForm();
    },
  });

  const editForm = useForm<MealExpenseFormValues>({
    initialValues: { amount: "", expense_date: "", description: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.amount) errors.amount = "Please enter an amount";
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) errors.amount = "Amount must be greater than 0";
      if (!values.expense_date) errors.expense_date = "Please select a date";
      if (!values.description.trim()) errors.description = "Please enter a description";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager || !selectedExpense) return;
      await updateMealExpense.mutateAsync({
        id: selectedExpense.id,
        payload: {
          amount: parseFloat(values.amount),
          description: values.description.trim(),
          expense_date: values.expense_date,
        },
      });
      setIsEditModalOpen(false);
      setSelectedExpense(null);
    },
  });

  const handleEdit = (expense: MealExpense) => {
    if (!isManager) { toast.error("Only managers can edit meal expenses"); return; }
    setSelectedExpense(expense);
    editForm.setValues({ amount: expense.amount.toString(), expense_date: expense.expense_date, description: expense.description });
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: MealExpense) => {
    if (!isManager) { toast.error("Only managers can delete meal expenses"); return; }
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !expenseToDelete) return;
    await deleteMealExpense.mutateAsync(expenseToDelete.id);
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  const openApproveModal = (expense: MealExpense) => {
    if (!isManager) return;
    setExpenseToApprove(expense);
    setAddDeposit(true);
    setIsApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!isManager || !expenseToApprove) return;
    try {
      await expenseApi.approveMealExpense(expenseToApprove.id, addDeposit);
      toast.success(addDeposit ? "Expense approved & reimbursement deposit added" : "Expense approved (no deposit added)");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setIsApproveModalOpen(false);
      setExpenseToApprove(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve meal expense");
    }
  };

  const handleReject = async (expense: MealExpense) => {
    if (!isManager) return;
    try {
      await expenseApi.rejectMealExpense(expense.id);
      toast.success("Meal expense rejected successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject meal expense");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Meal Expenses
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track grocery and meal costs
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Meal Expenses
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(mealData?.total_meal_expenses || 0)
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
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Meals
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      mealData?.total_meals || 0
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Meal Rate
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      formatCurrency(mealData?.meal_rate || 0)
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Expense Count
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      expenses.length
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Add Expense Form */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-4 border-b border-primary/10">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Meal Expense
            </h2>
          </CardHeader>
          <CardBody className="pt-6">
            <form onSubmit={addForm.handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Amount (BDT)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={addForm.values.amount}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    name="amount"
                    error={addForm.touched.amount ? addForm.errors.amount : undefined}
                  />
                  <DatePicker
                    label="Expense Date"
                    value={addForm.values.expense_date}
                    onChange={(date) => addForm.setValues({ ...addForm.values, expense_date: date })}
                    error={addForm.touched.expense_date ? addForm.errors.expense_date : undefined}
                  />
                  <Input
                    label="Description"
                    placeholder="e.g., Grocery shopping"
                    value={addForm.values.description}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    name="description"
                    error={addForm.touched.description ? addForm.errors.description : undefined}
                  />
                  
                  {isManager && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Spent By
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-white transition-all"
                        value={addForm.values.member_id}
                        onChange={addForm.handleChange}
                        name="member_id"
                      >
                        <option value="">Myself (Manager)</option>
                        {members.map((m) => (
                          <option key={m.user_id} value={m.user_id}>
                            {m.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {isManager && addForm.values.member_id && (
                  <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2 md:w-1/2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="add_deposit"
                        checked={addForm.values.add_deposit}
                        onChange={(e) => addForm.setValues({ ...addForm.values, add_deposit: e.target.checked })}
                        className="w-5 h-5 mt-0.5 text-primary bg-neutral-100 border-neutral-300 rounded-md focus:ring-primary dark:focus:ring-primary dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600 transition-all"
                      />
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                          Add as Deposit
                        </span>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Member will be credited for this amount automatically.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                
                <div className="flex justify-center pt-2">
                  <Button
                    type="submit"
                    isLoading={addMealExpense.isPending}
                    className="w-full md:w-1/3 py-3 text-base font-bold shadow-lg shadow-primary/20"
                    variant="primary"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Record Expense
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Expense List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Meal Expense Records
              </h2>
              <select
                className="w-full sm:w-48 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-white transition-all"
                value={spentByFilter}
                onChange={(e) => {
                  setSpentByFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Members</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
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
                <Utensils className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No meal expenses found
                </p>
                {isManager && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Add your first meal expense above
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
                          Spent By
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Amount
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Status
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
                          <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                            {members.find(m => m.user_id === expense.created_by)?.full_name || expense.created_by || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right font-medium">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={
                                expense.status === "approved"
                                  ? "success"
                                  : expense.status === "pending"
                                  ? "warning"
                                  : "error"
                              }
                            >
                              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                            </Badge>
                          </td>
                          {isManager && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                {expense.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openApproveModal(expense)}
                                      title="Approve"
                                      className="text-success hover:text-success/80 hover:bg-success/10"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReject(expense)}
                                      title="Reject"
                                      className="text-error hover:text-error/80 hover:bg-error/10"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
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
                        filteredExpenses.length,
                      )}{" "}
                      of {filteredExpenses.length} expenses
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

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Edit Meal Expense"
      >
        <ModalBody>
          <form id="edit-form" onSubmit={editForm.handleSubmit}>
            <div className="space-y-4">
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
          <Button type="submit" form="edit-form" isLoading={updateMealExpense.isPending}>
            Update
          </Button>
        </ModalFooter>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setExpenseToApprove(null);
        }}
        title="Approve Meal Expense"
      >
        <ModalBody>
          {expenseToApprove && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 space-y-1">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Description</p>
                <p className="font-medium text-neutral-900 dark:text-white">{expenseToApprove.description}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Amount</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", currencyDisplay: "narrowSymbol" }).format(expenseToApprove.amount)}
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    id="add-deposit-checkbox"
                    type="checkbox"
                    checked={addDeposit}
                    onChange={(e) => setAddDeposit(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      addDeposit
                        ? "bg-primary border-primary"
                        : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                    }`}
                    onClick={() => setAddDeposit((v) => !v)}
                  >
                    {addDeposit && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white text-sm">
                    Add reimbursement deposit to member's account
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {addDeposit
                      ? "A deposit will be credited to the member for this amount."
                      : "No deposit will be added. Member paid out of pocket."}
                  </p>
                </div>
              </label>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsApproveModalOpen(false);
              setExpenseToApprove(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={confirmApprove}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
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
        title="Delete Meal Expense"
        description="Are you sure you want to delete this meal expense? This action cannot be undone."
      >
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setExpenseToDelete(null);
            }}
            disabled={deleteMealExpense.isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            isLoading={deleteMealExpense.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
