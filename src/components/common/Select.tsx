import React, { forwardRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Select an option",
      value,
      onChange,
      options,
      disabled,
      className,
    },
    ref,
  ) => {
    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption?.label || placeholder;

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">
            {label}
          </label>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-left transition-all duration-200",
                "focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error && "border-error focus:border-error focus:ring-error/20",
                !value && "text-neutral-400 dark:text-neutral-500",
                value && "text-neutral-900 dark:text-white",
              )}
            >
              <div className="flex items-center justify-between">
                <span>{displayValue}</span>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50"
              sideOffset={4}
              align="start"
            >
              {options.map((option) => (
                <DropdownMenu.Item
                  key={option.value}
                  disabled={option.disabled}
                  onSelect={() => onChange?.(option.value)}
                  className={cn(
                    "px-4 py-2 text-sm cursor-pointer flex items-center justify-between",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 outline-none",
                    "text-neutral-900 dark:text-white",
                    option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                    value === option.value && "bg-blue-50 dark:bg-blue-900/20 text-primary",
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {error && (
          <p className="mt-1.5 text-sm font-medium text-error">{error}</p>
        )}
        {helperText && (
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
