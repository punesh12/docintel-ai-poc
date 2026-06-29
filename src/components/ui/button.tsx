import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-body-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary-container text-on-primary hover:bg-primary shadow-sm",
        secondary:
          "border border-border bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
        outline:
          "border border-border bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
        ghost: "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
        destructive: "bg-error text-on-error hover:bg-error/90",
        link: "text-primary-container underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-body-sm",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";
