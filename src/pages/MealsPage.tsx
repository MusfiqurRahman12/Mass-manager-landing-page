import { format, parseISO } from "date-fns";
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
import {
  Meal,
  MealCost,
  mealService,
  Member,
  memberService,
} from "../services";
import { cn } from "../utils";
import { formatCurrency, formatNumber } from "../utils/format.utils";

// Types
interface MealFormValues {
  member_id: string;
  meal_date: string;
  meal_count: string;
}

interface MealCostFormValues {
  total_cost: string;
}

// Constants
const MEAL_OPTIONS = [
  { value: "0", label: "0 meals" },
  { value: "0.5", label: "0.5 meals" },
  { value: "1", label: "1 meal" },
  { value: "1.5", label: "1.5 meals" },
  { value: "2", label: "2 meals" },
  { value: "2.5", label: "2.5 meals" },
  { value: "3", label: "3 meals" },
];

const ITEMS_PER_PAGE = 10;

export function MealsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  // State
  const [meals, setMeals] = useState<Meal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealCost, setMealCost] = useState<MealCost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
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

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mealsData, membersData, costData] = await Promise.all([
        mealService.getMeals(),
        memberService.getMembers(),
        mealService.getMealCost(),
      ]);
      setMeals(mealsData);
      setMembers(membersData);
      setMealCost(costData);
    } catch (error) {
      toast.error("Failed to load meal data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered and paginated meals
  const filteredMeals = useMemo(() => {
    let filtered = [...meals];

    if (filterMember) {
      filtered = filtered.filter((m) => m.member_id === filterMember);
    }

    if (filterStartDate) {
      filtered = filtered.filter((m) => m.meal_date >= filterStartDate);
    }

    if (filterEndDate) {
      filtered = filtered.filter((m) => m.meal_date <= filterEndDate);
    }

    // Sort by date descending
    filtered.sort(
      (a, b) =>
        new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime(),
    );

    return filtered;
  }, [meals, filterMember, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filteredMeals.length / ITEMS_PER_PAGE);
  const paginatedMeals = filteredMeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  // Forms
  const mealForm = useForm<MealFormValues>({
    initialValues: {
      member_id: "",
      meal_date: format(new Date(), "yyyy-MM-dd"),
      meal_count: "1",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.member_id) errors.member_id = "Please select a member";
      if (!values.meal_date) errors.meal_date = "Please select a date";
      if (!values.meal_count) errors.meal_count = "Please enter meal count";
      const count = parseFloat(values.meal_count);
      if (isNaN(count) || count < 0 || count > 10) {
        errors.meal_count = "Meal count must be between 0 and 10";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) {
        toast.error("Only managers can add meals");
        return;
      }
      setIsSubmitting(true);
      try {
        if (isBulkMode) {
          // Add meals for all members
          await Promise.all(
            members.map((member) =>
              mealService.addMeal({
                member_id: member.user_id,
                meal_date: values.meal_date,
                meal_count: parseFloat(values.meal_count),
              }),
            ),
          );
          toast.success(`Meals added for all ${members.length} members`);
        } else {
          await mealService.addMeal({
            member_id: values.member_id,
            meal_date: values.meal_date,
            meal_count: parseFloat(values.meal_count),
          });
          toast.success("Meal added successfully");
        }
        await fetchData();
        mealForm.resetForm();
        mealForm.setValues({
          member_id: isBulkMode ? "" : values.member_id,
          meal_date: values.meal_date,
          meal_count: values.meal_count,
        });
      } catch (error) {
        toast.error("Failed to add meal");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const editForm = useForm<{ meal_count: string }>({
    initialValues: { meal_count: "1" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.meal_count) errors.meal_count = "Please enter meal count";
      const count = parseFloat(values.meal_count);
      if (isNaN(count) || count < 0 || count > 10) {
        errors.meal_count = "Meal count must be between 0 and 10";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager || !selectedMeal) return;
      setIsSubmitting(true);
      try {
        await mealService.updateMeal(selectedMeal.id, {
          meal_count: parseFloat(values.meal_count),
        });
        toast.success("Meal updated successfully");
        await fetchData();
        setIsEditModalOpen(false);
        setSelectedMeal(null);
      } catch (error) {
        toast.error("Failed to update meal");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const costForm = useForm<MealCostFormValues>({
    initialValues: { total_cost: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.total_cost) errors.total_cost = "Please enter total cost";
      const cost = parseFloat(values.total_cost);
      if (isNaN(cost) || cost < 0) {
        errors.total_cost = "Cost must be a positive number";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (!isManager) return;
      setIsSubmitting(true);
      try {
        await mealService.setMealCost({
          total_cost: parseFloat(values.total_cost),
        });
        toast.success("Meal cost updated successfully");
        await fetchData();
        setIsCostModalOpen(false);
      } catch (error) {
        toast.error("Failed to update meal cost");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handlers
  const handleEdit = (meal: Meal) => {
    if (!isManager) {
      toast.error("Only managers can edit meals");
      return;
    }
    setSelectedMeal(meal);
    editForm.setValues({ meal_count: meal.meal_count.toString() });
    setIsEditModalOpen(true);
  };

  const handleDelete = (meal: Meal) => {
    if (!isManager) {
      toast.error("Only managers can delete meals");
      return;
    }
    setMealToDelete(meal);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isManager || !mealToDelete) return;
    try {
      await mealService.deleteMeal(mealToDelete.id);
      toast.success("Meal deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setMealToDelete(null);
    } catch (error) {
      toast.error("Failed to delete meal");
      console.error(error);
    }
  };

  const openCostModal = () => {
    if (!isManager) {
      toast.error("Only managers can update meal cost");
      return;
    }
    costForm.setValues({
      total_cost: mealCost?.total_cost.toString() || "",
    });
    setIsCostModalOpen(true);
  };

  // Summary calculations
  const todayMeals = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return meals.filter((m) => m.meal_date === today).length;
  }, [meals]);

  const projectedCost = useMemo(() => {
    if (!mealCost) return 0;
    return mealCost.total_meal * mealCost.meal_rate;
  }, [mealCost]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Meal Management
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track daily meals and manage meal rates
            </p>
          </div>
          {isManager && (
            <Button variant="primary" onClick={openCostModal}>
              <DollarSign className="h-4 w-4 mr-2" />
              Set Meal Cost
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      formatNumber(mealCost?.total_meal || 0)
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
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Meal Rate
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      formatCurrency(mealCost?.meal_rate || 0)
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
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total Cost
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      formatCurrency(mealCost?.total_cost || 0)
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
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Today's Meals
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : todayMeals}
                  </p>
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
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Add Meal Entry
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Bulk Entry
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      isBulkMode
                        ? "bg-primary"
                        : "bg-neutral-200 dark:bg-neutral-700",
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
                      onChange={(value) =>
                        mealForm.setValues({
                          ...mealForm.values,
                          member_id: value,
                        })
                      }
                      error={
                        mealForm.touched.member_id
                          ? mealForm.errors.member_id
                          : undefined
                      }
                      options={memberOptions}
                    />
                  )}
                  {isBulkMode && (
                    <div className="flex items-center">
                      <Badge variant="primary">
                        All Members ({members.length})
                      </Badge>
                    </div>
                  )}
                  <DatePicker
                    label="Date"
                    value={mealForm.values.meal_date}
                    onChange={(date) =>
                      mealForm.setValues({
                        ...mealForm.values,
                        meal_date: date,
                      })
                    }
                    error={
                      mealForm.touched.meal_date
                        ? mealForm.errors.meal_date
                        : undefined
                    }
                  />
                  <Select
                    label="Meal Count"
                    placeholder="Select meal count"
                    value={mealForm.values.meal_count}
                    onChange={(value) =>
                      mealForm.setValues({
                        ...mealForm.values,
                        meal_count: value,
                      })
                    }
                    error={
                      mealForm.touched.meal_count
                        ? mealForm.errors.meal_count
                        : undefined
                    }
                    options={MEAL_OPTIONS}
                  />
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
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
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Meal Records
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
            ) : paginatedMeals.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No meals found
                </p>
                {isManager && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Add your first meal entry above
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
                          Meals
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Cost
                        </th>
                        {isManager && (
                          <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMeals.map((meal) => {
                        const member = memberMap.get(meal.member_id);
                        const cost =
                          meal.meal_count * (mealCost?.meal_rate || 0);
                        return (
                          <tr
                            key={meal.id}
                            className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                              {format(parseISO(meal.meal_date), "MMM dd, yyyy")}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                              {member?.full_name || "Unknown"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">
                                {meal.meal_count} meals
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right">
                              {formatCurrency(cost)}
                            </td>
                            {isManager && (
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(meal)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(meal)}
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
                        filteredMeals.length,
                      )}{" "}
                      of {filteredMeals.length} meals
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
          setSelectedMeal(null);
        }}
        title="Edit Meal Entry"
      >
        <ModalBody>
          <form id="edit-form" onSubmit={editForm.handleSubmit}>
            <Select
              label="Meal Count"
              value={editForm.values.meal_count}
              onChange={(value) =>
                editForm.setValues({ ...editForm.values, meal_count: value })
              }
              error={
                editForm.touched.meal_count
                  ? editForm.errors.meal_count
                  : undefined
              }
              options={MEAL_OPTIONS}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedMeal(null);
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
          setMealToDelete(null);
        }}
        title="Delete Meal Entry"
        description="Are you sure you want to delete this meal entry? This action cannot be undone."
      >
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setMealToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
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
              error={
                costForm.touched.total_cost
                  ? costForm.errors.total_cost
                  : undefined
              }
            />
            {mealCost && mealCost.total_meal > 0 && (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Estimated meal rate:{" "}
                {formatCurrency(
                  parseFloat(costForm.values.total_cost || "0") /
                    mealCost.total_meal,
                )}
              </p>
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCostModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="cost-form" isLoading={isSubmitting}>
            Update Cost
          </Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
