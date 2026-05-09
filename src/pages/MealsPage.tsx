import { format, parseISO } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Utensils,
  ChevronDown,
  Check,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { useMeals, useMealCost, useAddMealBatch, useUpdateMeal, useDeleteMeal, useSetMealCost } from "../hooks/queries/useMealQueries";
import { useMembers } from "../hooks/queries/useMemberQueries";
import type { Meal } from "../services";
import type { Member } from "../services/memberService";
import { cn } from "../utils";
import { formatCurrency, formatNumber } from "../utils/format.utils";

// Types
interface MealFormValues {
  member_id: string;
  meal_date: string;
  end_date: string;
  meal_count: string;
}

interface MealCostFormValues {
  total_cost: string;
}

// Constants
const ITEMS_PER_PAGE = 10;

export function MealsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  // Modal / UI state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedBulkMembers, setSelectedBulkMembers] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMember, setFilterMember] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // ── Data Queries ──────────────────────────────────────────────────────────
  const { data: meals = [] as Meal[], isLoading: mealsLoading } = useMeals();
  const { data: members = [] as Member[], isLoading: membersLoading } = useMembers();
  const { data: mealCost, isLoading: costLoading } = useMealCost();
  const isLoading = mealsLoading || membersLoading || costLoading;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addMealBatch = useAddMealBatch();
  const updateMeal = useUpdateMeal();
  const deleteMeal = useDeleteMeal();
  const setMealCost = useSetMealCost();

  // Filtered and paginated meals
  const filteredMeals = useMemo(() => {
    let filtered = [...meals];
    if (filterMember) filtered = filtered.filter((m) => m.member_id === filterMember);
    if (filterStartDate) filtered = filtered.filter((m) => m.meal_date >= filterStartDate);
    if (filterEndDate) filtered = filtered.filter((m) => m.meal_date <= filterEndDate);
    filtered.sort((a, b) => new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime());
    return filtered;
  }, [meals, filterMember, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filteredMeals.length / ITEMS_PER_PAGE);
  const paginatedMeals = filteredMeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Member lookup helpers
  const memberOptions = useMemo(
    () => members.map((m) => ({ value: m.user_id, label: m.full_name })),
    [members],
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, typeof members[0]>();
    members.forEach((m) => map.set(m.user_id, m));
    return map;
  }, [members]);

  // Summary calculations
  const todayMeals = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return meals
      .filter((m) => m.meal_date === today)
      .reduce((sum, m) => sum + m.meal_count, 0);
  }, [meals]);

  const myTotalMeals = useMemo(() => {
    if (!user) return 0;
    return meals.filter((m) => m.member_id === user.id).reduce((sum, m) => sum + m.meal_count, 0);
  }, [meals, user]);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const mealForm = useForm<MealFormValues>({
    initialValues: {
      member_id: "",
      meal_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      meal_count: "1",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!isBulkMode && !values.member_id) errors.member_id = "Please select a member";
      if (isBulkMode && selectedBulkMembers.length === 0) errors.member_id = "Please select at least one member";
      if (!values.meal_date) errors.meal_date = "Please select a date";
      if (values.end_date && values.end_date < values.meal_date)
        errors.end_date = "End date must be after start date";
      if (!values.meal_count) errors.meal_count = "Please enter meal count";
      const count = parseFloat(values.meal_count);
      if (isNaN(count) || count < 0 || count > 10)
        errors.meal_count = "Meal count must be between 0 and 10";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) return;
      await addMealBatch.mutateAsync({
        member_id: isBulkMode ? undefined : values.member_id,
        member_ids: isBulkMode ? selectedBulkMembers : undefined,
        meal_date: values.meal_date,
        end_date: values.end_date || undefined,
        meal_count: parseFloat(values.meal_count),
      });
      mealForm.resetForm();
      mealForm.setValues({
        member_id: isBulkMode ? "" : values.member_id,
        meal_date: values.meal_date,
        end_date: "",
        meal_count: values.meal_count,
      });
    },
  });

  const editForm = useForm<{ meal_count: string }>({
    initialValues: { meal_count: "1" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.meal_count) errors.meal_count = "Please enter meal count";
      const count = parseFloat(values.meal_count);
      if (isNaN(count) || count < 0 || count > 10)
        errors.meal_count = "Meal count must be between 0 and 10";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager || !selectedMeal) return;
      await updateMeal.mutateAsync({
        id: selectedMeal.id,
        payload: { meal_count: parseFloat(values.meal_count) },
      });
      setIsEditModalOpen(false);
      setSelectedMeal(null);
    },
  });

  const costForm = useForm<MealCostFormValues>({
    initialValues: { total_cost: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.total_cost) errors.total_cost = "Please enter total cost";
      const cost = parseFloat(values.total_cost);
      if (isNaN(cost) || cost < 0) errors.total_cost = "Cost must be a positive number";
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) return;
      await setMealCost.mutateAsync({ total_cost: parseFloat(values.total_cost) });
      setIsCostModalOpen(false);
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    editForm.setValues({ meal_count: meal.meal_count.toString() });
    setIsEditModalOpen(true);
  };

  const handleDelete = (meal: Meal) => {
    setMealToDelete(meal);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!mealToDelete) return;
    await deleteMeal.mutateAsync(mealToDelete.id);
    setIsDeleteModalOpen(false);
    setMealToDelete(null);
  };

  const openCostModal = () => {
    costForm.setValues({ total_cost: mealCost?.total_cost.toString() || "" });
    setIsCostModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Meal Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Track daily meals and manage meal rates</p>
          </div>
          {false && (
            <Button variant="primary" onClick={openCostModal}>
              <DollarSign className="h-4 w-4 mr-2" />
              Set Meal Cost
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">My Total Meals</p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : formatNumber(myTotalMeals)}
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
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Meals</p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : formatNumber(mealCost?.total_meal || 0)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Meal Rate</p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : formatCurrency(mealCost?.meal_rate || 0)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Cost</p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : formatCurrency(mealCost?.total_cost || 0)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Today's Meals</p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : todayMeals}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Meal Entry Form */}
        {isManager && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Add Meal Entry</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Bulk Entry</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newBulkMode = !isBulkMode;
                      setIsBulkMode(newBulkMode);
                      if (newBulkMode && selectedBulkMembers.length === 0) {
                        setSelectedBulkMembers(members.map((m) => m.user_id));
                      }
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      isBulkMode ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-700",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        isBulkMode ? "translate-x-6" : "translate-x-1",
                      )}
                    />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={mealForm.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {!isBulkMode && (
                    <Select
                      label="Member"
                      placeholder="Select member"
                      value={mealForm.values.member_id}
                      onChange={(value) => mealForm.setValues({ ...mealForm.values, member_id: value })}
                      error={mealForm.touched.member_id ? mealForm.errors.member_id : undefined}
                      options={memberOptions}
                    />
                  )}
                  {isBulkMode && (
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">
                        Members
                      </label>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-full px-4 py-2.5 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-left flex items-center justify-between",
                              mealForm.touched.member_id && mealForm.errors.member_id && "border-error"
                            )}
                          >
                            <span className="truncate">
                              {selectedBulkMembers.length === members.length
                                ? `All Members (${members.length})`
                                : `${selectedBulkMembers.length} Selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 text-neutral-400" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[200px] w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50"
                            align="start"
                          >
                            <DropdownMenu.Item
                              onSelect={(e) => {
                                e.preventDefault();
                                if (selectedBulkMembers.length === members.length) {
                                  setSelectedBulkMembers([]);
                                } else {
                                  setSelectedBulkMembers(members.map((m) => m.user_id));
                                }
                              }}
                              className="px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-700 outline-none text-neutral-900 dark:text-white font-semibold border-b border-neutral-100 dark:border-neutral-700"
                            >
                              <span>Select All</span>
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center",
                                  selectedBulkMembers.length === members.length
                                    ? "bg-primary border-primary"
                                    : "border-neutral-300 dark:border-neutral-600"
                                )}
                              >
                                {selectedBulkMembers.length === members.length && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </DropdownMenu.Item>
                            {members.map((member) => {
                              const isSelected = selectedBulkMembers.includes(member.user_id);
                              return (
                                <DropdownMenu.Item
                                  key={member.user_id}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    if (isSelected) {
                                      setSelectedBulkMembers((prev) =>
                                        prev.filter((id) => id !== member.user_id)
                                      );
                                    } else {
                                      setSelectedBulkMembers((prev) => [...prev, member.user_id]);
                                    }
                                  }}
                                  className="px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-700 outline-none text-neutral-900 dark:text-white"
                                >
                                  <span>{member.full_name}</span>
                                  <div
                                    className={cn(
                                      "w-4 h-4 rounded border flex items-center justify-center",
                                      isSelected
                                        ? "bg-primary border-primary"
                                        : "border-neutral-300 dark:border-neutral-600"
                                    )}
                                  >
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                </DropdownMenu.Item>
                              );
                            })}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                      {mealForm.touched.member_id && mealForm.errors.member_id && (
                        <p className="mt-1.5 text-sm font-medium text-error">{mealForm.errors.member_id}</p>
                      )}
                    </div>
                  )}
                  <DatePicker
                    label="Date"
                    value={mealForm.values.meal_date}
                    onChange={(date) => mealForm.setValues({ ...mealForm.values, meal_date: date })}
                    error={mealForm.touched.meal_date ? mealForm.errors.meal_date : undefined}
                  />
                  <DatePicker
                    label="End Date (Optional)"
                    value={mealForm.values.end_date}
                    onChange={(date) => mealForm.setValues({ ...mealForm.values, end_date: date })}
                    error={mealForm.touched.end_date ? mealForm.errors.end_date : undefined}
                  />
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    label="Meal Count"
                    placeholder="Enter meal count"
                    name="meal_count"
                    value={mealForm.values.meal_count}
                    onChange={mealForm.handleChange}
                    onBlur={mealForm.handleBlur}
                    error={mealForm.touched.meal_count ? mealForm.errors.meal_count : undefined}
                  />
                  <div className="flex items-end">
                    <Button type="submit" isLoading={addMealBatch.isPending} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      {isBulkMode ? "Add for All" : "Add Meal"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Meal List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Meal Records</h2>
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {isManager && (
                  <Select
                    placeholder="Filter by member"
                    value={filterMember}
                    onChange={setFilterMember}
                    options={[{ value: "", label: "All Members" }, ...memberOptions]}
                    className="w-40"
                  />
                )}
                <DatePicker placeholder="Start date" value={filterStartDate} onChange={setFilterStartDate} className="w-40" />
                <DatePicker placeholder="End date" value={filterEndDate} onChange={setFilterEndDate} className="w-40" />
                {(filterMember || filterStartDate || filterEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setFilterMember(""); setFilterStartDate(""); setFilterEndDate(""); setCurrentPage(1); }}
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
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : paginatedMeals.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">No meals found</p>
                {isManager && <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Add your first meal entry above</p>}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Member</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Meals</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Cost</th>
                        {isManager && <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMeals.map((meal) => {
                        const member = memberMap.get(meal.member_id);
                        const cost = meal.meal_count * (mealCost?.meal_rate || 0);
                        return (
                          <tr key={meal.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                              {format(parseISO(meal.meal_date), "MMM dd, yyyy")}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">{member?.full_name || "Unknown"}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{meal.meal_count} meals</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right">{formatCurrency(cost)}</td>
                            {isManager && (
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(meal)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(meal)}>
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredMeals.length)} of {filteredMeals.length} meals
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Page {currentPage} of {totalPages}</span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
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
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMeal(null); }} title="Edit Meal Entry">
        <ModalBody>
          <form id="edit-form" onSubmit={editForm.handleSubmit}>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="10"
              label="Meal Count"
              name="meal_count"
              value={editForm.values.meal_count}
              onChange={editForm.handleChange}
              onBlur={editForm.handleBlur}
              error={editForm.touched.meal_count ? editForm.errors.meal_count : undefined}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setIsEditModalOpen(false); setSelectedMeal(null); }}>Cancel</Button>
          <Button type="submit" form="edit-form" isLoading={updateMeal.isPending}>Update</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setMealToDelete(null); }}
        title="Delete Meal Entry"
        description="Are you sure you want to delete this meal entry? This action cannot be undone."
      >
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setIsDeleteModalOpen(false); setMealToDelete(null); }}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={deleteMeal.isPending}>Delete</Button>
        </ModalFooter>
      </Modal>

      {/* Set Meal Cost Modal */}
      <Modal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        title="Set Monthly Meal Cost"
        description="Update the total cost for this month. This will recalculate the meal rate."
      >
        <ModalBody>
          <form id="cost-form" onSubmit={costForm.handleSubmit}>
            <Input
              label="Total Cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter total monthly cost"
              value={costForm.values.total_cost}
              onChange={costForm.handleChange}
              onBlur={costForm.handleBlur}
              name="total_cost"
              error={costForm.touched.total_cost ? costForm.errors.total_cost : undefined}
            />
            {mealCost && mealCost.total_meal > 0 && (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Estimated meal rate:{" "}
                {formatCurrency(parseFloat(costForm.values.total_cost || "0") / mealCost.total_meal)}
              </p>
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCostModalOpen(false)}>Cancel</Button>
          <Button type="submit" form="cost-form" isLoading={setMealCost.isPending}>Update Cost</Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
