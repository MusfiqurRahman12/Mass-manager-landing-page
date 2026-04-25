import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge, Button, Card, LoadingSpinner } from "../components/common";
import { MainLayout } from "../components/layout";
import { useRequireAuth } from "../hooks";
import { type Month, monthService } from "../services/monthService";
import { formatCurrency } from "../utils/format.utils";

export function MonthHistoryPage() {
  const { isReady } = useRequireAuth();
  const navigate = useNavigate();
  const [months, setMonths] = useState<Month[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (isReady) {
      loadMonthHistory();
    }
  }, [isReady]);

  const loadMonthHistory = async (newOffset: number = 0) => {
    setIsLoading(true);
    try {
      const data = await monthService.getMonthHistory(limit, newOffset);
      if (newOffset === 0) {
        setMonths(data);
      } else {
        setMonths((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === limit);
      setOffset(newOffset);
    } catch (error) {
      toast.error("Failed to load month history");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    loadMonthHistory(offset + limit);
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getStatusBadge = (month: Month) => {
    if (month.is_active) {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="default">Closed</Badge>;
  };

  if (!isReady || (isLoading && months.length === 0)) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading month history..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Month History</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              View past months and their statements
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Months List */}
        {months.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-500 mb-4">No month history available</p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {months.map((month) => (
              <Card
                key={month.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/months/${month.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {new Date(month.month_year).getMonth() + 1}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">
                          {getMonthName(month.month_year)}
                        </h3>
                        {getStatusBadge(month)}
                      </div>
                      <p className="text-sm text-neutral-500">
                        Created on{" "}
                        {new Date(month.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-neutral-500">Meals</p>
                      <p className="font-semibold">{month.total_meal}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-500">Rate</p>
                      <p className="font-semibold">
                        {formatCurrency(month.meal_rate)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-500">Cost</p>
                      <p className="font-semibold">
                        {formatCurrency(month.total_cost)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-500">Balance</p>
                      <p
                        className={`font-semibold ${
                          month.closing_balance >= 0
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {formatCurrency(month.closing_balance)}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  isLoading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
