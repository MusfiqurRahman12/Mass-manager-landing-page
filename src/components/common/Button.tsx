import { Loader } from "lucide-react";
import React from "react";
import { cn } from "../../utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900";

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-blue-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-primary",
      secondary:
        "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 dark:bg-neutral-700 dark:text-white focus:ring-neutral-400",
      ghost:
        "bg-transparent text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-primary",
      danger:
        "bg-error text-white hover:bg-red-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-red-400",
      outline:
        "border-2 border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 shadow-sm hover:shadow-md active:scale-95 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700 focus:ring-neutral-400",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
