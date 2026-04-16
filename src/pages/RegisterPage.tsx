import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Card, Input } from "../components/common";
import { AuthLayout } from "../components/layout";
import { useAuth } from "../context";
import { useForm } from "../hooks";
import { isNotEmpty, isValidEmail, isValidPassword } from "../utils";

interface RegisterFormValues {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const validate = (values: RegisterFormValues) => {
    const errors: Record<string, string> = {};

    if (!isValidEmail(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!isNotEmpty(values.fullName)) {
      errors.fullName = "Full name is required";
    }

    const passwordValidation = isValidPassword(values.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0] || "Invalid password";
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
    validate,
    onSubmit: async (values) => {
      try {
        const hasMess = await register(values.email, values.fullName, values.password);
        toast.success("Account created successfully!");
        navigate(hasMess ? "/dashboard" : "/onboarding");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Registration failed",
        );
      }
    },
  });

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get Started</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Create your account in seconds
          </p>
        </div>

        <form onSubmit={form.handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            value={form.values.fullName}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.touched.fullName ? form.errors.fullName : undefined}
            placeholder="John Doe"
          />

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
            helperText="Min 8 chars, 1 uppercase, 1 number"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.values.confirmPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={
              form.touched.confirmPassword
                ? form.errors.confirmPassword
                : undefined
            }
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={form.isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary font-semibold hover:underline transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
