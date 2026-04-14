import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Card, Input } from "../components/common";
import { AuthLayout } from "../components/layout";
import { useAuth } from "../context";
import { useForm } from "../hooks";
import { isNotEmpty, isValidEmail } from "../utils";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const validate = (values: LoginFormValues) => {
    const errors: Record<string, string> = {};
    if (!isValidEmail(values.email)) errors.email = "Invalid email address";
    if (!isNotEmpty(values.password)) errors.password = "Password is required";
    return errors;
  };

  const form = useForm<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validate,
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Login failed");
      }
    },
  });

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={form.handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.touched.email ? form.errors.email : undefined}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.touched.password ? form.errors.password : undefined}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full py-3 text-base font-semibold"
            isLoading={form.isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-primary font-semibold hover:underline transition-colors"
            >
              Create one
            </a>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
