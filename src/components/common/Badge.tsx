import React from "react";
import { cn } from "../../utils";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "default";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  secondary:
    "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  error:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  neutral:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  default:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
