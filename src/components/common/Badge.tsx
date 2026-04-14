import React from "react";
import { cn } from "../../utils";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variants = {
  primary: "badge-primary",
  secondary: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  neutral:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
};

export function Badge({
  variant = "primary",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn("badge", variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
