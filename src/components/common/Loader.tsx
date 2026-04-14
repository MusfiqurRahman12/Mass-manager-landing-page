import { Loader } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({
  size = "md",
  fullScreen = false,
  message,
}: LoaderProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader className={`${sizeMap[size]} text-primary animate-spin`} />
      {message && (
        <p className="text-neutral-600 dark:text-neutral-400">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

export const Spinner = ({ className = "" }: { className?: string }) => (
  <Loader className={`animate-spin ${className}`} />
);
