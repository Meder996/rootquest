import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text",
            "placeholder:text-muted/60 transition-colors",
            "focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-coral focus:border-coral focus:ring-coral/30",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-xs text-coral">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export function Textarea({
  className,
  label,
  error,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "min-h-[100px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text",
          "placeholder:text-muted/60 transition-colors",
          "focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30",
          error && "border-coral focus:border-coral focus:ring-coral/30",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  );
}

export function Select({
  className,
  label,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text",
          "transition-colors focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
