import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import { cn } from "../../utils";

interface DatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string; // ISO date string YYYY-MM-DD
  onChange?: (date: string) => void;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  helperText,
  placeholder = "Select a date",
  value,
  onChange,
  disabled,
  minDate,
  maxDate,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? parseISO(value) : new Date();
  });

  const selectedDate = value ? parseISO(value) : null;

  const minDateObj = minDate ? parseISO(minDate) : null;
  const maxDateObj = maxDate ? parseISO(maxDate) : null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (date: Date) => {
    onChange?.(format(date, "yyyy-MM-dd"));
    setOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDateObj && isBefore(date, minDateObj) && !isSameDay(date, minDateObj)) {
      return true;
    }
    if (maxDateObj && isAfter(date, maxDateObj) && !isSameDay(date, maxDateObj)) {
      return true;
    }
    return false;
  };

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-left transition-all duration-200",
              "focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-between",
              error && "border-error focus:border-error focus:ring-error/20",
              !value && "text-neutral-400 dark:text-neutral-500",
              value && "text-neutral-900 dark:text-white",
            )}
          >
            <span>
              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 text-neutral-400" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-4 z-50 w-[280px]"
            sideOffset={4}
            align="start"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </button>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const disabled = isDateDisabled(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      !isCurrentMonth && "text-neutral-300 dark:text-neutral-600",
                      isCurrentMonth && "text-neutral-700 dark:text-neutral-200",
                      isCurrentDay && !isSelected && "bg-blue-50 dark:bg-blue-900/20 text-primary border border-primary",
                      isSelected && "bg-primary text-white",
                      !disabled && !isSelected && "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                      disabled && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
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
};
