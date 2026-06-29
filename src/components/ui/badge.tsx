import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const statusChipVariants = cva(
  "inline-flex h-6 w-max shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold leading-none uppercase tracking-wide",
  {
    variants: {
      variant: {
        uploading: "bg-blue-100/80 text-blue-700",
        queued: "bg-surface-container text-on-surface-variant",
        processing: "bg-indigo-100/80 text-indigo-700 ring-1 ring-indigo-200/60",
        ready: "bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/60",
        completed: "bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/60",
        failed: "bg-red-100/80 text-red-700",
        paused: "bg-amber-100/80 text-amber-700",
        cancelled: "bg-surface-container text-on-surface-variant",
        default: "bg-primary-fixed/50 text-primary-container",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {}

export const StatusChip = ({ className, variant, ...props }: StatusChipProps) => (
  <span className={cn(statusChipVariants({ variant }), className)} {...props} />
);
