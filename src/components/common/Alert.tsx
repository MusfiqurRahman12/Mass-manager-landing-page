import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";
import { cn } from "../../utils";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: AlertType;
  title?: string;
  description: string;
  onClose?: () => void;
}

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-error" />,
  warning: <AlertCircle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-primary" />,
};

const bgMap = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  warning:
    "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
};

const textMap = {
  success: "text-green-800 dark:text-green-200",
  error: "text-red-800 dark:text-red-200",
  warning: "text-amber-800 dark:text-amber-200",
  info: "text-blue-800 dark:text-blue-200",
};

export function Alert({
  type,
  title,
  description,
  onClose,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-4 rounded-lg border p-4",
        bgMap[type],
        textMap[type],
        className,
      )}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[type]}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold">{title}</h3>}
        <p className="text-sm opacity-90">{description}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
