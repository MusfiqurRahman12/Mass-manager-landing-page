import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Card, Input, LoadingSpinner } from "../components/common";
import { AuthLayout } from "../components/layout";
import { useAuth } from "../context";
import { useForm } from "../hooks";
import { isNotEmpty, isValidUUID } from "../utils";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface CreateMessFormValues {
  name: string;
  address: string;
  automaticMarketDate: string;
}

interface JoinMessFormValues {
  messId: string;
}

export function OnboardingPage() {
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const { createMess, joinMess, isLoading } = useAuth();
  const navigate = useNavigate();

  // Create Mess Form
  const validateCreateForm = (values: CreateMessFormValues) => {
    const errors: Record<string, string> = {};
    if (!isNotEmpty(values.name)) {
      errors.name = "Mess name is required";
    } else if (values.name.length < 3) {
      errors.name = "Mess name must be at least 3 characters";
    }
    return errors;
  };

  const createForm = useForm<CreateMessFormValues>({
    initialValues: {
      name: "",
      address: "",
      automaticMarketDate: "Friday",
    },
    validate: validateCreateForm,
    onSubmit: async (values) => {
      try {
        await createMess(
          values.name,
          values.address,
          values.automaticMarketDate
        );
        toast.success("Mess created successfully!");
        navigate("/dashboard");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create mess"
        );
      }
    },
  });

  // Join Mess Form
  const validateJoinForm = (values: JoinMessFormValues) => {
    const errors: Record<string, string> = {};
    if (!isNotEmpty(values.messId)) {
      errors.messId = "Mess ID is required";
    } else if (!isValidUUID(values.messId)) {
      errors.messId = "Invalid Mess ID format";
    }
    return errors;
  };

  const joinForm = useForm<JoinMessFormValues>({
    initialValues: { messId: "" },
    validate: validateJoinForm,
    onSubmit: async (values) => {
      try {
        await joinMess(values.messId);
        toast.success("Successfully joined mess!");
        navigate("/dashboard");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to join mess"
        );
      }
    },
  });

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  // Selection View
  if (mode === "select") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Welcome! 👋</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              You're not part of any mess yet. What would you like to do?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode("create")}
              className="w-full p-6 text-left border-2 border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Create a New Mess
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Set up a new mess as a manager. You'll be able to invite
                    members and manage expenses.
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors"
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
            </button>

            <button
              onClick={() => setMode("join")}
              className="w-full p-6 text-left border-2 border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Join Existing Mess
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Enter a mess ID to join an existing mess as a member.
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors"
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
            </button>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  // Create Mess Form
  if (mode === "create") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md shadow-lg">
          <div className="mb-6">
            <button
              onClick={() => setMode("select")}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create Your Mess</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Set up your new mess household
            </p>
          </div>

          <form onSubmit={createForm.handleSubmit} className="space-y-5">
            <Input
              label="Mess Name"
              type="text"
              name="name"
              value={createForm.values.name}
              onChange={createForm.handleChange}
              onBlur={createForm.handleBlur}
              error={
                createForm.touched.name ? createForm.errors.name : undefined
              }
              placeholder="e.g., Sunrise Mess"
              required
            />

            <Input
              label="Address (Optional)"
              type="text"
              name="address"
              value={createForm.values.address}
              onChange={createForm.handleChange}
              onBlur={createForm.handleBlur}
              placeholder="123 Main Street, Dhaka"
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Weekly Market Day
              </label>
              <select
                name="automaticMarketDate"
                value={createForm.values.automaticMarketDate}
                onChange={createForm.handleChange}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Day when you typically go to the market for groceries
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold"
              isLoading={createForm.isSubmitting}
            >
              Create Mess
            </Button>
          </form>
        </Card>
      </AuthLayout>
    );
  }

  // Join Mess Form
  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <div className="mb-6">
          <button
            onClick={() => setMode("select")}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Join a Mess</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enter the Mess ID provided by your manager
          </p>
        </div>

        <form onSubmit={joinForm.handleSubmit} className="space-y-5">
          <Input
            label="Mess ID"
            type="text"
            name="messId"
            value={joinForm.values.messId}
            onChange={joinForm.handleChange}
            onBlur={joinForm.handleBlur}
            error={joinForm.touched.messId ? joinForm.errors.messId : undefined}
            placeholder="550e8400-e29b-41d4-a716-446655440000"
            helperText="Ask your manager for the Mess ID"
            required
          />

          <Button
            type="submit"
            className="w-full py-3 text-base font-semibold"
            isLoading={joinForm.isSubmitting}
          >
            Join Mess
          </Button>
        </form>

        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Tip:</span> The Mess ID is a UUID
            format code that looks like:
            <code className="block mt-1 text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">
              550e8400-e29b-41d4-a716-446655440000
            </code>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
