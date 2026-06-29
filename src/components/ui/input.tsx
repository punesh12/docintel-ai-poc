import { cn } from "@/utils/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-border bg-sidebar px-3 py-1 text-body-md text-on-surface transition-colors placeholder:text-outline focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
